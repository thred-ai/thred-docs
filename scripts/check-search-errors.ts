/** Offline catalog/OpenAPI/documentation parity audit. No API or provider calls. */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { SEARCH_ERROR_CATALOG } from "../../thred-data-backend/src/search-errors";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const document = JSON.parse(read("api-reference/openapi.json"));
const schemas = document.components.schemas;
type Scope = "request" | "search" | "source";
const catalog: Record<string, Partial<Record<Scope, { message: string; status?: number }>>> = SEARCH_ERROR_CATALOG;
const codes = (scope: Scope) => Object.keys(catalog).filter(code => catalog[code][scope]);
const same = (left: string[], right: string[]) => JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const expectedOperations = {
  "api-reference/create-search.mdx": "POST /v1/search",
  "api-reference/get-search.mdx": "GET /v1/search/{id}",
  "api-reference/cancel-search.mdx": "POST /v1/search/{id}/cancel",
  "api-reference/authentication.mdx": "GET /v1/auth/me",
  "api-reference/get-usage.mdx": "GET /v1/usage",
  "api-reference/health.mdx": "GET /v1/health",
};
const expectedPaths = Object.values(expectedOperations).map(operation => operation.split(" ")[1]);
const httpMethods = new Set(["get", "put", "post", "delete", "options", "head", "patch", "trace"]);
const operations = Object.entries(document.paths).flatMap(([path, methods]) =>
  Object.keys(methods as object).filter(method => httpMethods.has(method)).map(method => `${method.toUpperCase()} ${path}`),
);
ensure(same(Object.keys(document.paths), expectedPaths), "Exact six versioned public paths");
ensure(same(operations, Object.values(expectedOperations)), "Exact six public method/path operations");
ensure(document.servers.length === 1 && document.servers[0].url === "https://api.thred.dev", "Origin-only public API server");

const bindings: Record<string, string> = {};
for (const name of readdirSync(resolve(root, "api-reference")).filter(name => name.endsWith(".mdx"))) {
  const path = `api-reference/${name}`;
  const frontmatter = read(path).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  ensure(frontmatter, `${path}: missing frontmatter`);
  const metadata = parseYaml(frontmatter[1]);
  if (metadata.openapi !== undefined) bindings[path] = metadata.openapi;
}
ensure(same(Object.keys(bindings), Object.keys(expectedOperations)), "Exact six MDX operation pages");
for (const [path, operation] of Object.entries(expectedOperations)) {
  ensure(bindings[path] === `api-reference/openapi.json ${operation}`, `${path}: canonical MDX operation binding`);
}
const isSearchPath = (path: string) => path === "/v1/search" || path.startsWith("/v1/search/");

for (const [scope, name] of [["request", "SearchRequestError"], ["search", "SearchOutcomeError"], ["source", "SourceError"]] as const) {
  const schema = schemas[name];
  ensure(same(Object.keys(schema.properties), ["code", "message"]), `${name}: exact error properties`);
  ensure(same(schema.required, ["code", "message"]) && schema.additionalProperties === false, `${name}: exact required shape`);
  ensure(same(schema.properties.code.enum, codes(scope)), `${name}: canonical scope enum`);
  ensure(schema.properties.message.maxLength === 240, `${name}: message bound`);
}
ensure(schemas.Search.properties.error.$ref === "#/components/schemas/SearchOutcomeError", "Search outcome error reference");
ensure(!("error" in schemas.SearchRecord.properties) && schemas.SourceError.deprecated === true, "Source errors are legacy delivery metadata only");
const requestFields = ["query", "results", "identity", "identityId", "webhook_id"];
ensure(same(Object.keys(schemas.SearchRequest.properties), requestFields) && schemas.SearchRequest.additionalProperties === false, "Exact five Search request properties");
ensure(same(schemas.SearchRequest.required, ["query", "results"]), "Required Search request fields");
ensure(schemas.SearchRequest.properties.results.maximum === 10 && !("records" in schemas.SearchRequest.properties), "Numeric request results remains unchanged");
ensure(schemas.Search.properties.records.type === "array" && !("results" in schemas.Search.properties), "Response records has no results alias");
ensure(same(Object.keys(schemas.Search.properties), ["id", "status", "timestamp", "duration", "records", "error"]), "Exact search snapshot fields");
ensure(same(schemas.Search.required, ["id", "status", "timestamp", "duration", "records"]), "Required search timing fields");
ensure(same(schemas.Search.properties.status.enum, ["running", "completed", "failed"]), "Execution-only search statuses");
ensure(!codes("search").includes("no_usable_answer") && codes("source").includes("no_usable_answer"), "No usable answer is source-only");
ensure(schemas.Search.properties.id.pattern === "^sch_[a-z0-9-]+$", "Canonical search ID prefix");
ensure(schemas.SearchRecord.properties.id.pattern === "^rcd_[a-z0-9_-]+$", "Canonical record ID prefix");
ensure(schemas.Search.properties.timestamp.format === "date-time", "Acceptance timestamp format");
ensure(schemas.Search.properties.duration.nullable && schemas.Search.properties.duration.minimum === 0, "Nullable elapsed search duration");
ensure(same(Object.keys(schemas.SearchRecord.properties), ["id", "source", "content"]), "Exact three Search record properties");
ensure(schemas.SearchRecord.properties.content.type === "string" && schemas.SearchRecord.properties.content.minLength === 1 && !schemas.SearchRecord.properties.content.nullable, "Returned content is nonempty");
ensure(same(schemas.SearchRecord.required, ["id", "source", "content"]), "Required result fields");
ensure(schemas.SearchRecord.properties.source.$ref === "#/components/schemas/SearchSource", "Nested source reference");
ensure(same(Object.keys(schemas.SearchSource.properties), ["details", "evidence", "call_metadata"]) && same(schemas.SearchSource.required, ["details", "evidence", "call_metadata"]), "Exact source shape");
ensure(schemas.SearchSource.properties.details.$ref === "#/components/schemas/SearchSourceDetails", "Source details reference");
ensure(schemas.SearchSource.properties.evidence.items.$ref === "#/components/schemas/SearchSourceEvidence", "Source evidence reference");
ensure(schemas.SearchSource.properties.call_metadata.$ref === "#/components/schemas/SearchCallMetadata", "Source call metadata reference");
ensure(same(Object.keys(schemas.SearchSourceEvidence.properties), ["quote", "start", "end"]) && same(schemas.SearchSourceEvidence.required, ["quote", "start", "end"]), "Exact short quote bounds");
for (const field of ["start", "end"]) ensure(schemas.SearchSourceEvidence.properties[field].nullable && schemas.SearchSourceEvidence.properties[field].minimum === 0, `${field}: nullable nonnegative offset`);
ensure(same(Object.keys(schemas.SearchCallMetadata.properties), ["duration", "placed_at", "picked_up_at"]) && same(schemas.SearchCallMetadata.required, ["duration", "placed_at"]), "Exact call timing schema");
ensure(schemas.SearchCallMetadata.properties.duration.nullable && schemas.SearchCallMetadata.properties.duration.minimum === 0, "Nullable connected duration");
ensure(schemas.SearchCallMetadata.properties.placed_at.nullable && schemas.SearchCallMetadata.properties.placed_at.format === "date-time", "Nullable placement");
ensure(!schemas.SearchCallMetadata.properties.picked_up_at.nullable && schemas.SearchCallMetadata.properties.picked_up_at.format === "date-time", "Optional nonnull pickup");
for (const name of ["Search", "SearchRecord", "SearchSource", "SearchSourceDetails", "SearchSourceEvidence", "SearchCallMetadata"]) ensure(schemas[name].additionalProperties === false, `${name}: exact schema`);

const statuses = [...new Set(codes("request").map(code => catalog[code].request!.status!))];
for (const status of statuses) {
  const response = document.components.responses[`SearchHttp${status}`];
  const expected = codes("request").filter(code => catalog[code].request!.status === status);
  ensure(same(response["x-error-codes"], expected), `HTTP ${status}: code mapping`);
  ensure(response.content["application/json"].schema.$ref === "#/components/schemas/SearchRequestErrorResponse", `HTTP ${status}: request error schema`);
  for (const code of expected) {
    const error = response.content["application/json"].examples[code].value.error;
    ensure(error.code === code && error.message === catalog[code].request!.message, `HTTP ${status}: canonical example for ${code}`);
  }
}

let refs = 0, snapshots = 0, sourceResults = 0;
function checkError(error: Record<string, unknown>, scope: Scope) {
  ensure(same(Object.keys(error), ["code", "message"]), `${scope}: exact example error shape`);
  ensure(typeof error.code === "string" && codes(scope).includes(error.code), `${scope}: unknown example code`);
  ensure(error.message === catalog[error.code][scope]!.message, `${scope}: noncanonical example message`);
  ensure(Buffer.byteLength(error.message as string, "utf8") <= 240, `${scope}: oversized example message`);
}
function walk(value: unknown) {
  if (Array.isArray(value)) { value.forEach(walk); return; }
  if (!value || typeof value !== "object") return;
  const object = value as Record<string, any>;
  if (typeof object.query === "string" && typeof object.results === "number") {
    ensure(Object.keys(object).every(key => requestFields.includes(key)), "Example exact Search request fields");
  }
  if (typeof object.$ref === "string" && object.$ref.startsWith("#/")) {
    let target: any = document;
    for (const key of object.$ref.slice(2).split("/")) target = target?.[key.replaceAll("~1", "/").replaceAll("~0", "~")];
    ensure(target !== undefined, `Broken OpenAPI reference: ${object.$ref}`);
    refs++;
  }
  const snapshot = typeof object.id === "string" && (Array.isArray(object.records) || Array.isArray(object.results));
  const source = typeof object.id === "string" && object.source && "content" in object;
  const iso = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
  const milliseconds = (value: unknown) => value === null || (typeof value === "number" && Number.isFinite(value) && value >= 0);
  if (snapshot) {
    ensure(["id", "status", "timestamp", "duration", "records"].every(key => key in object) && Object.keys(object).every(key => ["id", "status", "timestamp", "duration", "records", "error"].includes(key)), "Example exact search fields");
    ensure(new RegExp(schemas.Search.properties.id.pattern).test(object.id), "Example valid search ID");
    ensure(schemas.Search.properties.status.enum.includes(object.status), "Example search status");
    ensure(iso(object.timestamp) && milliseconds(object.duration), "Example search timing");
    ensure(object.status !== "running" || object.duration !== null, "Running duration must be known");
    if (object.status === "failed") ensure(object.error && object.records.length === 0, "Failed search requires an error and no records");
    else ensure(!object.error, "Running/completed search includes a search-level error");
    if (object.status === "completed") ensure(object.records.length > 0, "Completed search requires supported records");
  }
  if (source) {
    ensure(new RegExp(schemas.SearchRecord.properties.id.pattern).test(object.id), "Example valid canonical source ID");
    ensure(same(Object.keys(object), ["id", "source", "content"]), "Example exact source result fields");
    ensure(same(Object.keys(object.source), ["details", "evidence", "call_metadata"]) && Array.isArray(object.source.evidence), "Example nested source shape");
    ensure(Object.keys(object.source.details).every(key => ["name", "url", "phone", "address"].includes(key)), "Example source details");
    for (const evidence of object.source.evidence) {
      ensure(same(Object.keys(evidence), ["quote", "start", "end"]) && typeof evidence.quote === "string" && evidence.quote.trim(), "Example timestamped quote shape");
      for (const field of ["start", "end"]) ensure(milliseconds(evidence[field]), `Example ${field}`);
      ensure(evidence.end === null || (evidence.start !== null && evidence.end >= evidence.start), "Example evidence range order");
    }
    const metadata = object.source.call_metadata;
    ensure(["duration", "placed_at"].every(key => key in metadata) && Object.keys(metadata).every(key => ["duration", "placed_at", "picked_up_at"].includes(key)), "Example exact business metadata");
    ensure(milliseconds(metadata.duration) && (metadata.placed_at === null || iso(metadata.placed_at)), "Example business timing");
    if ("picked_up_at" in metadata) {
      ensure(iso(metadata.picked_up_at), "Example pickup cannot be null");
      ensure(metadata.duration !== 0, "Zero is reserved for confirmed unanswered calls");
      ensure(metadata.placed_at === null || Date.parse(metadata.picked_up_at) >= Date.parse(metadata.placed_at), "Example pickup precedes placement");
    }
    if (typeof metadata.duration === "number" && metadata.duration > 0) ensure("picked_up_at" in metadata, "Connected duration needs pickup");
    ensure(typeof object.content === "string" && object.content.trim() && object.source.evidence.length, "Returned example lacks supported content");
  }
  if (snapshot || source) {
    if (object.error) checkError(object.error, snapshot ? "search" : "source");
    if (snapshot) snapshots++; else sourceResults++;
  }
  Object.values(object).forEach(walk);
}
walk(document);

for (const [path, methods] of Object.entries(document.paths) as [string, Record<string, any>][]) {
  for (const operation of Object.values(methods)) {
    if (isSearchPath(path)) for (const parameter of operation.parameters ?? []) {
      if (parameter.in !== "path" || parameter.name !== "id") continue;
      ensure(parameter.schema.pattern === "^(sch_|search_)[a-z0-9-]+$", `${path}: canonical ID and legacy alias input`);
      ensure(typeof parameter.example === "string" && new RegExp(schemas.Search.properties.id.pattern).test(parameter.example), `${path}: canonical path example`);
    }
    for (const [status, response] of Object.entries(operation.responses ?? {}) as [string, any][]) {
      if (Number(status) < 400) continue;
      if (isSearchPath(path)) ensure(response.$ref === `#/components/responses/SearchHttp${status}`, `${path}: scoped HTTP ${status} response`);
      else ensure(!String(response.$ref).includes("SearchHttp"), `${path}: unrelated error contract changed`);
    }
  }
}

const guide = read("guides/errors.mdx");
for (const [scope, heading] of [["request", "## Request errors"], ["search", "## Errors inside an accepted search"]] as const) {
  const section = guide.split(heading)[1]?.split(/\n## /)[0];
  ensure(section, `Missing ${scope} guide section`);
  const tableCodes = [...section.matchAll(/^\| `([a-z_]+)` \|/gm)].map(match => match[1]);
  ensure(same(tableCodes, codes(scope)), `${scope}: guide/catalog parity`);
  if (scope === "request") for (const match of section.matchAll(/^\| `([a-z_]+)` \| (\d+) \|/gm)) {
    ensure(catalog[match[1]].request!.status === Number(match[2]), `${match[1]}: guide HTTP mapping`);
  }
}
const documents = ["guides/errors.mdx", "guides/identities.mdx", "guides/webhooks.mdx", "guides/pricing-and-queues.mdx", "api-reference/create-search.mdx", "api-reference/get-search.mdx", "api-reference/cancel-search.mdx", "quickstart.mdx"];
let links = 0;
for (const name of documents) {
  const source = read(name);
  ensure(source.startsWith("---\n") && (source.match(/^```/gm)?.length ?? 0) % 2 === 0, `${name}: frontmatter/fences`);
  for (const match of source.matchAll(/\]\((\/[^)#]+)(?:#[^)]*)?\)/g)) {
    const target = resolve(root, match[1].slice(1));
    ensure(existsSync(target) || existsSync(`${target}.mdx`), `${name}: broken local link ${match[1]}`);
    links++;
  }
}
const navigation = JSON.parse(read("docs.json")).navigation.groups.flatMap((group: any) => group.pages);
ensure(navigation.includes("guides/errors"), "Error guide navigation");
console.log(`PASS: ${operations.length} public operations/MDX bindings; ${Object.keys(catalog).length} canonical codes; three scoped schemas; ${statuses.length} HTTP mappings; ${refs} OpenAPI references; ${snapshots} snapshot and ${sourceResults} source examples; ${documents.length} MDX documents/${links} local links.`);

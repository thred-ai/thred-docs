# Thred API documentation

November 12 documentation revision: developers supply a query and result count to `/search`; Thred returns paginated answers with sources and supporting evidence. Optional identity and public/customer purpose are request-scoped. Calls and result processing are fully automatic. This contract is implemented locally; production activation remains pending.

Mintlify documentation for Thred, a search API, at `https://api.thred.dev`.

Describe Thred as broad search. Overview copy and examples should reflect research and information needs across domains. Calling mechanics belong in the relevant API details; field names such as `business` and `selected_businesses` do not define the product's scope. Preserve actual JSON field names when documenting the contract.

## Local preview

With the [Mintlify CLI](https://www.mintlify.com/docs/cli/install) installed, run `mint dev` from this directory.

## Content

- `introduction.mdx` and `quickstart.mdx`: overview, request example and result polling.
- `guides/what-you-can-build.mdx`: use cases and available options.
- `api-reference/openapi.json`: the API contract.
- `api-reference/*.mdx`: endpoint pages using [Mintlify's OpenAPI integration](https://www.mintlify.com/docs/api-playground/openapi-setup), with cURL, JavaScript and Python search examples.
- `docs.json`: navigation, Instrument Sans, and the shared Thred wordmark.
- `style.css`: typography, light/dark colors, controls, and spacing matched to `thred-phone-data`.

Document the query-driven `/search` request and its `search_` IDs. Without request `output`, each result contains a concise text answer in `content` (or null when unavailable), with no generated custom fields and no `output` property. Explicit request `output` remains supported by the API and adds the requested structured values to result `output`. The dashboard currently disables custom-schema configuration. Keep source metadata, call status, transcript `evidence`, discovery `sources`, and cursor pagination consistent with the backend contract.

Search routes use `/search`, without a `/v1` prefix. Account and utility routes retain `/v1/auth/me`, `/v1/usage` and `/v1/health`. The new public router does not expose Collect or Crawl; the old collection pages direct readers to Search.

## Static validation

```bash
mint openapi-check api-reference/openapi.json
mint validate
mint broken-links
git diff --check
```

Do not run tests or place API calls unless requested. Keep changes local unless publishing is requested.

## Updating the contract

Check the sibling `thred-data-backend` repository: `src/search-contracts.ts`, `src/contracts.ts`, `src/index.ts`, `convex/http.ts`, `convex/searches.ts`, `convex/lib/callView.ts`, and `convex/usage.ts`.

Check `../thred-phone-data/deployment/STATUS.md` before advertising local-only work. At this revision, recording and monetary billing are disabled. Use only fictional data in examples.

## Styling

Use `thred-phone-data/tailwind.config.ts`, `src/app/globals.css`, and the Settings UI as the styling source: Instrument Sans, slate text, neutral light/dark surfaces, teal accents, 6px controls, and a 224px navigation column. Body text is 14px with 24px line height; code uses a system monospace face at 13px. Keep code formatting separate from prose.

Custom CSS uses Mintlify's documented IDs and component hooks. The installed Mint theme exposes the active navigation state through `bg-primary/10`; verify that selector and desktop sidebar/content alignment when upgrading Mintlify. Check introduction, quickstart, and an endpoint page in both themes and at narrow widths after styling changes.

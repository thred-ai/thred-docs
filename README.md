# Thred API documentation

Developers supply a query and source count to `/search`; Thred retrieves information over the phone and returns full snapshots of supported answer records. Caller identities and structured output are optional. Calls and result processing are automatic.

Mintlify documentation for Thred, a search API, at `https://api.thred.dev`.

Keep reader-facing docs short and simple. Use one basic request-and-results flow, and let the generated API reference carry field details and language examples. Avoid duplicate examples and long implementation tutorials.

Write for developers building apps and AI assistants. Lead with "Start building with Thred," explain that the API retrieves information over the phone, and guide readers to their first request. Frame use cases as things they can build.

Use `Thred` as the site name so browser and social titles follow `Page title - Thred`, matching Exa's brand-only suffix. Do not append `Thred API`.

Describe Thred as broad search. Overview copy and examples should reflect research and information needs across domains. Calling mechanics belong in the relevant API details; field names such as `business` and `selected_businesses` do not define the product's scope. Preserve actual JSON field names when documenting the contract.

Choose examples where phone calls uncover current facts such as stock, openings, availability, or delivery constraints.

## Local preview

With the [Mintlify CLI](https://www.mintlify.com/docs/cli/install) installed, run `mint dev` from this directory.

## Content

- `introduction.mdx` and `quickstart.mdx`: short overview and a three-step cURL example.
- `guides/what-you-can-build.mdx`: use cases and example queries.
- `guides/identities.mdx`: saved, temporary and default caller configuration.
- `guides/webhooks.mdx`: event payloads, signature verification and delivery handling.
- `guides/errors.mdx`: current request and search error codes.
- `guides/pricing-and-queues.mdx`: record pricing, source limits and queuing.
- `api-reference/openapi.json`: the API contract.
- `api-reference/*.mdx`: endpoint pages using [Mintlify's OpenAPI integration](https://www.mintlify.com/docs/api-playground/openapi-setup). Mintlify generates cURL, JavaScript and Python examples from OpenAPI.
- `docs.json`: navigation, Instrument Sans, and the shared Thred SVG logo and favicon.
- `style.css`: typography, light/dark colors, controls, and spacing matched to `thred-phone-data`.

The required request fields are `query` and integer `results` (1–10). `identity` and `identityId` are mutually exclusive; omitting both uses the API environment's default caller. The old `callAgent` selectors are rejected. Do not introduce timezone or timestamp inputs or idempotency setup into the basic search flow.

Create, read and cancel return `{ id, status, timestamp, duration, records, error? }`. IDs use `sch_` for searches and `rcd_` for records. Reads return the full current snapshot; cursor pagination is unsupported. Each record contains nonempty supported `content`, nested source details/evidence/call metadata, and optional `output` when explicitly requested and supported. Sources without answers are omitted. Records have no individual status or error.

Search status is `running`, `completed` or `failed`. A settled search completes with at least one record and no error; with zero records it fails with an appropriate error. System durations and evidence offsets use milliseconds; calendar timestamps are ISO strings. Preserve nullability and distinguish webhook `data.result` from snapshot `records`.

Search routes use `/search`, without a `/v1` prefix. Account and utility routes retain `/v1/auth/me`, `/v1/usage` and `/v1/health`. The new public router does not expose Collect or Crawl; the old collection pages direct readers to Search.

Primary examples must show the normal successful flow: accepted creation, completed search and populated results. Keep cancellation examples on the cancellation endpoint. Use one consistent request and result count across the quickstart and reference, with matching IDs, record counts, timestamps, evidence and output values. Inspect the rendered example selected by default as well as the source schema; structural validation cannot establish whether an example is useful.

Hide `required` badges on response fields through `style.css`. Preserve OpenAPI's response presence guarantees and keep required badges visible on request fields.

## Static validation

```bash
npx --yes mint@4.3.24 validate
npx --yes mint@4.3.24 broken-links
git diff --check
```

`validate` checks OpenAPI, content and the strict build. With the sibling backend and its dependencies available, `npm run check:search-errors` also audits the error catalog, schema references and example JSON offline.

Do not run tests or place API calls unless requested. Keep changes local unless publishing is requested.

## Updating the contract

Check the sibling `thred-data-backend` repository: `src/search-contracts.ts`, `src/identities.ts`, `src/contracts.ts`, `src/search-response.ts`, `src/search-errors.ts`, `src/search-ids.ts`, `src/business-call-timing.ts`, `src/index.ts`, `convex/http.ts`, `convex/searches.ts`, `convex/lib/searchViews.ts`, and `convex/usage.ts`. Use `convex/lib/searchQueue.ts` for deadlines and queuing limits. Prefer public parsers and serializers over historical documentation.

Check the latest applicable entries in `../thred-phone-data/IMPLEMENTATION.md` and their implementation receipts before making availability claims. Development code publication, provider readiness, billing activation and production deployment are separate facts. Use only fictional data in examples.

## Styling

Use `thred-phone-data/tailwind.config.ts`, `src/app/globals.css`, `PowerWorkspace`, and the Settings UI as the styling source: Instrument Sans, slate text, neutral light/dark surfaces, teal accents, 6px controls, and a 224px navigation column. Keep both columns flat, with a subtle shadow only along their shared divider. Body text is 14px with 24px line height; code uses a system monospace face at 12px. Keep code formatting separate from prose.

`logo/thred.svg` is the supplied `Group 289725.svg`, unchanged, used for both themes and the favicon. Preserve its original teal fill and 47:34 proportions.

Social previews keep each page's title and description alongside a larger original Thred logo, without a category label. `scripts/generate-og.cjs` renders 1200×630 cards in `images/og/` using Instrument Sans and the dashboard's dark background, then sets each navigable page's `og:image` frontmatter. Twitter inherits that image. Run `npm ci` once and `npm run og:generate` after editing titles, descriptions, API descriptions, navigation, or the logo. The font and its SIL Open Font License are in `scripts/assets/`.

Center each card's content vertically using its rendered height. Keep 64px between the logo and title and 24px between the title and description, preserving the shared left alignment.

Titles and descriptions wrap within 1056px and truncate with an ellipsis to fit their measured height limits. Truncation prefers word boundaries and handles unbroken text without splitting Unicode characters or overflowing horizontally.

Maple provides the full-height sidebar with the logo, search, and navigation inside it. Keep its native layout and a consistent 48px content inset; do not add the sidebar width to content padding. Style the active page through `aria-current="page"`. Check introduction, quickstart, and an endpoint page in both themes and at narrow widths after styling changes, including the hosted layout: the CLI preview can lag behind Mintlify's current renderer.

On desktop, the native theme switcher sits above Website at the bottom of the sidebar. Dashboard is hidden from navigation for now. Keep one divider below the switcher, separating it from Website, and no divider above it. Reserve its space in the sidebar footer; keep Mintlify's native mobile placement.

# Thred API documentation

November 12 documentation revision: developers supply a query and result count to `/search`; Thred returns paginated answers with sources and supporting evidence. Optional identity and public/customer purpose are request-scoped. Calls and result processing are fully automatic. This contract is implemented locally; production activation remains pending.

Mintlify documentation for Thred, a search API, at `https://api.thred.dev`.

Keep reader-facing docs short and simple. Use one basic request-and-results flow, and let the generated API reference carry field details and language examples. Avoid duplicate examples and long implementation tutorials.

Write for developers building apps and AI assistants. Lead with "Start building with Thred," explain that the API retrieves information over the phone, and guide readers to their first request. Frame use cases as things they can build.

Describe Thred as broad search. Overview copy and examples should reflect research and information needs across domains. Calling mechanics belong in the relevant API details; field names such as `business` and `selected_businesses` do not define the product's scope. Preserve actual JSON field names when documenting the contract.

Choose examples where phone calls uncover current facts such as stock, openings, availability, or delivery constraints.

## Local preview

With the [Mintlify CLI](https://www.mintlify.com/docs/cli/install) installed, run `mint dev` from this directory.

## Content

- `introduction.mdx` and `quickstart.mdx`: short overview and a three-step cURL example.
- `guides/what-you-can-build.mdx`: use cases and example queries.
- `guides/webhooks.mdx`: event payloads, signature verification and delivery handling.
- `api-reference/openapi.json`: the API contract.
- `api-reference/*.mdx`: endpoint pages using [Mintlify's OpenAPI integration](https://www.mintlify.com/docs/api-playground/openapi-setup). Mintlify generates cURL, JavaScript and Python examples from OpenAPI.
- `docs.json`: navigation, Instrument Sans, and the shared Thred SVG logo and favicon.
- `style.css`: typography, light/dark colors, controls, and spacing matched to `thred-phone-data`.

Document the query-driven `/search` request and its `search_` IDs. Without request `output`, each result contains a concise text answer in `content` (or null when unavailable), with no generated custom fields and no `output` property. Explicit request `output` remains supported by the API and adds the requested structured values to result `output`. The dashboard currently disables custom-schema configuration. Keep source metadata, call status, transcript `evidence`, discovery `sources`, and cursor pagination consistent with the backend contract.

Search routes use `/search`, without a `/v1` prefix. Account and utility routes retain `/v1/auth/me`, `/v1/usage` and `/v1/health`. The new public router does not expose Collect or Crawl; the old collection pages direct readers to Search.

Primary examples must show the normal successful flow: accepted creation, completed search and populated results. Keep cancellation examples on the cancellation endpoint. Use one consistent request and result count across the quickstart and reference, with matching IDs, counters, timestamps, evidence and output values. Inspect the rendered example selected by default as well as the source schema; structural validation cannot establish whether an example is useful.

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

Use `thred-phone-data/tailwind.config.ts`, `src/app/globals.css`, `PowerWorkspace`, and the Settings UI as the styling source: Instrument Sans, slate text, neutral light/dark surfaces, teal accents, 6px controls, and a 224px navigation column. Keep both columns flat, with a subtle shadow only along their shared divider. Body text is 14px with 24px line height; code uses a system monospace face at 12px. Keep code formatting separate from prose.

`logo/thred.svg` is the supplied `Group 289725.svg`, unchanged, used for both themes and the favicon. Preserve its original teal fill and 47:34 proportions.

Social previews keep each page's title and description alongside a larger original Thred logo, without a category label. `scripts/generate-og.cjs` renders 1200×630 cards in `images/og/` using Instrument Sans and the dashboard's dark background, then sets each navigable page's `og:image` frontmatter. Twitter inherits that image. Run `npm ci` once and `npm run og:generate` after editing titles, descriptions, API descriptions, navigation, or the logo. The font and its SIL Open Font License are in `scripts/assets/`.

Maple provides the full-height sidebar with the logo, search, and navigation inside it. Keep its native layout and a consistent 48px content inset; do not add the sidebar width to content padding. Style the active page through `aria-current="page"`. Check introduction, quickstart, and an endpoint page in both themes and at narrow widths after styling changes, including the hosted layout: the CLI preview can lag behind Mintlify's current renderer.

On desktop, the native theme switcher sits above Website at the bottom of the sidebar. Dashboard is hidden from navigation for now. Keep one divider below the switcher, separating it from Website, and no divider above it. Reserve its space in the sidebar footer; keep Mintlify's native mobile placement.

# Thred API documentation

Mintlify documentation for Thred, the data API for the phone, at `https://api.thred.dev`. The Collect API at `/v1/collect` collects structured answers from a known phone number.

## Local preview

With the [Mintlify CLI](https://www.mintlify.com/docs/cli/install) installed, run `mint dev` from this directory.

## Content

- `introduction.mdx` and `quickstart.mdx`: overview and one end-to-end example.
- `guides/what-you-can-build.mdx`: use cases and available options.
- `api-reference/openapi.json`: the API contract.
- `api-reference/*.mdx`: endpoint pages using [Mintlify's OpenAPI integration](https://www.mintlify.com/docs/api-playground/openapi-setup).
- `docs.json`: navigation, Instrument Sans, and the shared Thred wordmark.
- `style.css`: typography, light/dark colors, controls, and spacing matched to `thred-phone-data`.

Keep the getting-started content to the two simple examples: business hours and inventory. Document the implemented `to`, `instructions`, `input`, and `output` request fields and `call_` IDs. Search is not an available API.

## Static validation

```bash
mint openapi-check api-reference/openapi.json
mint validate
mint broken-links
git diff --check
```

Do not run tests or place API calls unless requested. Keep changes local unless publishing is requested.

## Updating the contract

Check the sibling `thred-data-backend` repository: `src/contracts.ts`, `src/index.ts`, `convex/http.ts`, `convex/calls.ts`, `convex/lib/callView.ts`, `convex/usage.ts`, and `convex/recordings.ts`.

Check `../thred-phone-data/deployment/STATUS.md` before advertising local-only work. At this revision, recording and monetary billing are disabled; the local forced-review parameter is not advertised. Use only fictional data in examples.

## Styling

Use `thred-phone-data/tailwind.config.ts`, `src/app/globals.css`, and the Settings UI as the styling source: Instrument Sans, slate text, neutral light/dark surfaces, teal accents, 6px controls, and a 224px navigation column. Body text is 14px with 24px line height; code uses a system monospace face at 13px. Keep code formatting separate from prose.

Custom CSS uses Mintlify's documented IDs and component hooks. The installed Mint theme exposes the active navigation state through `bg-primary/10`; verify that selector and desktop sidebar/content alignment when upgrading Mintlify. Check introduction, quickstart, and an endpoint page in both themes and at narrow widths after styling changes.

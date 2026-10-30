# Thred API documentation

Mintlify documentation for the phone-call API at `https://api.thred.dev`.

## Local preview

With the [Mintlify CLI](https://www.mintlify.com/docs/cli/install) installed, run `mint dev` from this directory.

## Content

- `introduction.mdx` and `quickstart.mdx`: overview and one end-to-end example.
- `guides/what-you-can-build.mdx`: use cases and available options.
- `api-reference/openapi.json`: the API contract.
- `api-reference/*.mdx`: endpoint pages using [Mintlify's OpenAPI integration](https://www.mintlify.com/docs/api-playground/openapi-setup).
- `docs.json`: navigation and Thred's existing branding.

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

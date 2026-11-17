# Docs site

SvelteKit with `@sveltejs/adapter-cloudflare`, fully prerendered. It deploys to https://rime.frostycle.com.

## Cloudflare settings

The adapter is configured without a wrangler config, so it builds for Cloudflare Pages.

| Setting | Value |
|---|---|
| Root directory | repository root |
| Build command | `pnpm build` |
| Build output directory | `apps/docs/.svelte-kit/cloudflare` |
| `NODE_VERSION` | `24` (local development uses 24.20.0) |
| `PNPM_VERSION` | `12.10.1` |

`pnpm build` builds the library first, then the docs, which import it through its public exports.

### pnpm version

Cloudflare's build image documentation lists `PNPM_VERSION` as the way to choose the pnpm version and does not mention the `packageManager` field or Corepack. Treat `packageManager: pnpm@12.10.1` as not honoured and set `PNPM_VERSION=12.10.1` to match. Source: https://developers.cloudflare.com/pages/configuration/build-image/

### What reaches the worker

The adapter writes `_worker.js` and `_routes.json` next to the prerendered pages. `_routes.json` excludes every prerendered route, `/favicon.svg` and `/_app/*`, so those are served as static assets and never invoke the worker.

Any other URL, including a prerendered route with a trailing slash, does invoke the worker, which renders the SvelteKit 404 page with a link home. Serving unknown URLs statically would replace that page with the adapter's plain-text `404.html` ("Not Found"), so this is left as is.

## Tests

```sh
pnpm test:docs
```

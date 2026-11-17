# Docs site

SvelteKit with `@sveltejs/adapter-cloudflare`, fully prerendered. It deploys to https://rime.frostycle.com.

## Cloudflare settings

The output is for a Cloudflare **Pages** project. The adapter has no wrangler config, which makes it build for Pages (`CF_PAGES` or no `main`/`assets` selects it), confirmed by the first deploy on 2026-11-17. A Workers project would need a wrangler config with `assets.directory` and a different setup.

| Setting | Value |
|---|---|
| Root directory | empty (the repository root, not `apps/docs`) |
| Build command | `pnpm build` |
| Build output directory | `apps/docs/.svelte-kit/cloudflare` |
| `NODE_VERSION` | `24` (local development uses 24.20.0) |
| `PNPM_VERSION` | `12.10.1` |

`pnpm build` builds the library first, then the docs, which import it through its public exports.

### pnpm version

Cloudflare's build image documentation lists `PNPM_VERSION` as the way to choose the pnpm version and does not mention the `packageManager` field or Corepack. Treat `packageManager: pnpm@12.10.1` as not honoured and set `PNPM_VERSION=12.10.1` to match. Source: https://developers.cloudflare.com/pages/configuration/build-image/

### What reaches the worker

Nothing. `vite.config.ts` sets `routes: { include: ['/*'], exclude: ['/*'] }`, so `_routes.json` excludes every path and the generated `_worker.js` is never invoked (the adapter requires a non-empty `include`, and `exclude` wins). Pages serves the prerendered pages and assets directly and redirects a trailing slash itself.

`fallback: 'spa'` makes the adapter emit `404.html` as a client-rendered shell. Pages serves it with status 404 for any unknown URL, and the SvelteKit router then renders the designed error page with its link home. The cost is that an unknown URL visited without JavaScript shows a blank page with the 404 status.

`pnpm test:docs` checks this against the built output served by `wrangler pages dev` (port 4174); the other tests use `vite preview`.

## Tests

```sh
pnpm test:docs
```

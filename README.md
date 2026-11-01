# Rime

Headless, snippet-based UI primitives for Svelte 5.

| Path | Contents |
|---|---|
| [`packages/rime`](packages/rime) | The published library, [`@frostycle/rime`](packages/rime/README.md) |
| [`apps/docs`](apps/docs) | The documentation site, not published |

## Development

```sh
pnpm install
pnpm dev           # rebuilds the library on change and serves the docs
pnpm check
pnpm test:unit
pnpm test:browser  # Chromium, WebKit and Firefox; needs Firefox installed
```

The docs import the built library through its public exports, so they see what consumers see.

## License

MIT

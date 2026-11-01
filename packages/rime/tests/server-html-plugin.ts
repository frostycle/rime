import type { Plugin, ViteDevServer } from 'vite';

const MODULE_ID = 'virtual:server-html';
const RESOLVED_ID = `\0${MODULE_ID}`;

export const HYDRATION_VALUE = { start: '2026-10-01', end: '2026-10-31' };
export const HYDRATION_LOCALES = ['en-US', 'id-ID', 'en-GB'];

/** Renders the range picker with the server compiler so browser tests can hydrate real server HTML. */
export function serverHtmlPlugin(): Plugin {
	let server: ViteDevServer;
	return {
		name: 'rime:server-html',
		configureServer(devServer) {
			server = devServer;
		},
		resolveId(id) {
			return id === MODULE_ID ? RESOLVED_ID : undefined;
		},
		async load(id) {
			if (id !== RESOLVED_ID) return undefined;
			const { render } = await server.ssrLoadModule('svelte/server');
			const { default: DateRangePicker } = await server.ssrLoadModule(
				'/src/lib/date-picker/DateRangePicker.svelte'
			);
			const serverHtml = Object.fromEntries(
				HYDRATION_LOCALES.map((locale) => [
					locale,
					render(DateRangePicker, { props: { value: HYDRATION_VALUE, locale } }).body
				])
			);
			return `export const serverHtml = ${JSON.stringify(serverHtml)};
export const value = ${JSON.stringify(HYDRATION_VALUE)};
export const locales = ${JSON.stringify(HYDRATION_LOCALES)};`;
		}
	};
}

declare module 'virtual:server-html' {
	export const serverHtml: Record<string, string>;
	export const value: { start: string; end: string };
	export const locales: string[];
}

import { hydrate, tick, unmount } from 'svelte';
import { afterEach, expect, test, vi } from 'vitest';
import { locales, serverHtml, value } from 'virtual:server-html';
import DateRangePicker from './DateRangePicker.svelte';

afterEach(() => {
	vi.restoreAllMocks();
	document.body.replaceChildren();
});

test.each(locales)('hydrating %s produces no mismatch warning', async (locale) => {
	const warn = vi.spyOn(console, 'warn');
	const error = vi.spyOn(console, 'error');
	const container = document.body.appendChild(document.createElement('div'));
	container.innerHTML = serverHtml[locale];
	const serverLabel = container.querySelector('button')!.textContent;

	const app = hydrate(DateRangePicker, { target: container, props: { value, locale } });
	await tick();

	expect(warn).not.toHaveBeenCalled();
	expect(error).not.toHaveBeenCalled();
	expect(serverLabel).toContain('2026');
	expect(container.querySelector('button')!.textContent).toBe(serverLabel);
	await unmount(app);
});

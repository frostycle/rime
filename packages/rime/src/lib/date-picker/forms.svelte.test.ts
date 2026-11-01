import { expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DatePicker from './DatePicker.svelte';
import FormFixture from './fixtures/FormFixture.svelte';

const data = () => Object.fromEntries(new FormData(document.querySelector('form')!));

test('single value is submitted under name', async () => {
	await render(FormFixture, { kind: 'single', value: '2026-10-31' });
	expect(data()).toEqual({ due: '2026-10-31' });
});

test('empty range submits empty strings under both names', async () => {
	await render(FormFixture, { kind: 'range', value: null });
	expect(data()).toEqual({ from: '', to: '' });
});

test('range is submitted under startName and endName', async () => {
	await render(FormFixture, { kind: 'range', value: { start: '2026-10-01', end: '2026-10-31' } });
	expect(data()).toEqual({ from: '2026-10-01', to: '2026-10-31' });
});

test('disabled picker submits nothing', async () => {
	await render(FormFixture, { kind: 'range', value: { start: '2026-10-01', end: '2026-10-31' }, disabled: true });
	expect(data()).toEqual({});
});

test('opening and picking never submits the form', async () => {
	const onsubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
	await render(FormFixture, { kind: 'single', value: '2026-10-15', onsubmit });
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	await page.getByRole('button', { name: /October 20, 2026/ }).click();
	expect(onsubmit).not.toHaveBeenCalled();
});

test('form reset restores the value at mount', async () => {
	await render(FormFixture, { kind: 'single', value: '2026-10-15' });
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	await page.getByRole('button', { name: /October 20, 2026/ }).click();
	await expect.element(page.getByRole('button', { name: 'Oct 20, 2026' })).toBeVisible();
	expect(data()).toEqual({ due: '2026-10-20' });
	document.querySelector('form')!.reset();
	await expect.element(page.getByRole('button', { name: 'Oct 15, 2026' })).toBeVisible();
	expect(data()).toEqual({ due: '2026-10-15' });
});

test('a picker outside any form mounts without error', async () => {
	await expect(render(DatePicker, { value: null, name: 'due' })).resolves.toBeDefined();
});

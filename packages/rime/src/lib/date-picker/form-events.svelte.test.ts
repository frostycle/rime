import { expect, onTestFinished, test } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DateRangePicker from './DateRangePicker.svelte';
import ClearableFixture from './fixtures/ClearableFixture.svelte';
import FormFixture from './fixtures/FormFixture.svelte';

const day = (date: string) => page.getByRole('button', { name: new RegExp(date) });
const october = { start: '2026-10-01', end: '2026-10-31' };

function recordFormEvents(log: string[]) {
	const form = document.querySelector('form')!;
	for (const type of ['input', 'change']) {
		form.addEventListener(type, (event) => log.push(`${type}:${(event.target as HTMLInputElement).name}`));
	}
}

function eventLog() {
	const log: string[] = [];
	return { log, onchange: () => log.push('onchange') };
}

test.each([false, true])(
	'a pick fires input then change from the hidden input, before onchange (required: %s)',
	async (required) => {
		const { log, onchange } = eventLog();
		await render(FormFixture, { kind: 'single', value: '2026-10-15', required, onchange });
		recordFormEvents(log);
		await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
		await day('October 20, 2026').click();
		expect(log).toEqual(['input:due', 'change:due', 'onchange']);
	}
);

test('a range pick fires from both inputs', async () => {
	const { log, onchange } = eventLog();
	await render(FormFixture, { kind: 'range', value: october, onchange });
	recordFormEvents(log);
	await page.getByRole('button', { name: /Oct 1/ }).click();
	await day('October 5, 2026').click();
	await day('October 9, 2026').click();
	expect(log).toEqual(['input:from', 'change:from', 'input:to', 'change:to', 'onchange']);
});

test('a range whose end stays the same fires only from startName', async () => {
	const { log, onchange } = eventLog();
	const presets = [{ label: 'Later start', value: () => ({ start: '2026-10-05', end: '2026-10-31' }) }];
	await render(FormFixture, { kind: 'range', value: october, presets, onchange });
	recordFormEvents(log);
	await page.getByRole('button', { name: /Oct 1/ }).click();
	await page.getByRole('button', { name: 'Later start' }).click();
	expect(log).toEqual(['input:from', 'change:from', 'onchange']);
});

test('re-picking the same date fires no form events', async () => {
	const { log, onchange } = eventLog();
	await render(FormFixture, { kind: 'single', value: '2026-10-15', onchange });
	recordFormEvents(log);
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	await day('October 15, 2026').click();
	expect(log).toEqual(['onchange']);
});

test('clear fires from the hidden input, and clearing an empty picker fires nothing', async () => {
	const { log, onchange } = eventLog();
	await render(ClearableFixture, { value: '2026-10-15', onchange });
	recordFormEvents(log);
	await page.getByRole('button', { name: 'Clear' }).click();
	expect(log).toEqual(['input:due', 'change:due', 'onchange']);
	await page.getByRole('button', { name: 'Clear' }).click();
	expect(log).toEqual(['input:due', 'change:due', 'onchange', 'onchange']);
});

test('form reset fires no form events', async () => {
	const { log, onchange } = eventLog();
	await render(FormFixture, { kind: 'single', value: '2026-10-15', onchange });
	recordFormEvents(log);
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	await day('October 20, 2026').click();
	log.length = 0;
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect.element(page.getByRole('button', { name: 'Oct 15, 2026' })).toBeVisible();
	expect(log).toEqual([]);
});

test('a range with only startName fires from that input', async () => {
	const log: string[] = [];
	const form = document.body.appendChild(document.createElement('form'));
	onTestFinished(() => form.remove());
	await render(DateRangePicker, { target: form, props: { value: october, startName: 'from' } });
	recordFormEvents(log);
	await page.getByRole('button', { name: /Oct 1/ }).click();
	await day('October 5, 2026').click();
	await day('October 9, 2026').click();
	expect(log).toEqual(['input:from', 'change:from']);
});

test('clear on a disabled picker fires nothing', async () => {
	const { log, onchange } = eventLog();
	await render(ClearableFixture, { value: '2026-10-15', disabled: true, onchange });
	recordFormEvents(log);
	await page.getByRole('button', { name: 'Clear' }).click();
	expect(log).toEqual([]);
});

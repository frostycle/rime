import axe from 'axe-core';
import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DatePicker from './DatePicker.svelte';
import DateRangePicker from './DateRangePicker.svelte';
import FormFixture from './fixtures/FormFixture.svelte';

const presets = [{ label: 'October', value: () => ({ start: '2026-10-01', end: '2026-10-31' }) }];

async function expectNoViolations() {
	const { violations } = await axe.run(document.body);
	expect(violations.map(({ id, nodes }) => ({ id, html: nodes[0].html }))).toEqual([]);
}

test('single, closed has no axe violations', async () => {
	await render(DatePicker, { value: null });
	await expectNoViolations();
});

test('single, open has no axe violations', async () => {
	await render(DatePicker, { value: null });
	await page.getByRole('button').first().click();
	await expect.element(page.getByRole('grid')).toBeVisible();
	await expectNoViolations();
});

test('range, two months with presets, open has no axe violations', async () => {
	await render(DateRangePicker, { value: null, months: 2, presets });
	await page.getByRole('button').first().click();
	await expect.element(page.getByRole('grid').first()).toBeVisible();
	await expectNoViolations();
});

test('single, required, after a blocked submit has no axe violations', async () => {
	await render(FormFixture, { kind: 'single', required: true });
	const form = document.querySelector('form')!;
	form.addEventListener('submit', (event) => event.preventDefault());
	form.requestSubmit();
	await expect.element(page.getByRole('button', { name: 'Choose date' })).toHaveFocus();
	await expectNoViolations();
});

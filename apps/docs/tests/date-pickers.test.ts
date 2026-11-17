import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

test('the live range picker selects a range and shows it', async ({ page }) => {
	await page.goto('/date-pickers');
	const demo = page.locator('section[aria-labelledby="demo"]');
	await demo.getByRole('button', { name: /Oct 5/ }).click();
	const dialog = page.getByRole('dialog', { name: 'Choose dates' });
	await dialog.getByRole('button', { name: /October 3, 2026/ }).first().click();
	await dialog.getByRole('button', { name: /October 12, 2026/ }).first().click();
	await expect(demo.getByRole('button', { name: /Oct 3 – 12, 2026/ })).toBeVisible();
	await expect(demo.getByRole('status')).toHaveText('2026-10-03 to 2026-10-12');
});

test('the live single picker selects a date and shows it', async ({ page }) => {
	await page.goto('/date-pickers');
	const demo = page.locator('section[aria-labelledby="demo"]');
	await demo.getByRole('button', { name: 'Single' }).click();
	await demo.getByRole('button', { name: /Oct 5, 2026/ }).click();
	await page.getByRole('dialog', { name: 'Choose date' }).getByRole('button', { name: /October 14, 2026/ }).click();
	await expect(demo.getByRole('button', { name: /Oct 14, 2026/ })).toBeVisible();
	await expect(demo.getByRole('status')).toHaveText('2026-10-14');
});

for (const [label, file] of [
	['picker-classes.ts', 'picker-classes.ts'],
	['DateRangeField.svelte', 'DateRangeField.svelte']
]) {
	test(`the recipe shows ${file} exactly as the demo runs it`, async ({ page }) => {
		const source = readFileSync(new URL(`../src/lib/demos/${file}`, import.meta.url), 'utf8');
		await page.goto('/date-pickers');
		const shown = page.locator('section[aria-labelledby="recipe"]').getByRole('region', { name: label });
		expect((await shown.textContent())?.trimEnd()).toBe(source.trimEnd());
	});
}

test('every documented prop of both pickers is listed', async ({ page }) => {
	await page.goto('/date-pickers');
	const props = page.locator('section[aria-labelledby="props"]');
	for (const name of ['value', 'min', 'max', 'isDateDisabled', 'months', 'presets', 'minDays', 'maxDays', 'startName', 'endName', 'name']) {
		await expect(props.getByRole('cell', { name, exact: true }).first()).toBeVisible();
	}
});

test('the page has its sections in order', async ({ page }) => {
	await page.goto('/date-pickers');
	const found = await page.locator('main h2').evaluateAll((nodes) => nodes.map((node) => node.id));
	expect(found).toEqual(['demo', 'usage', 'props', 'snippets', 'keyboard', 'attributes', 'recipe', 'url-values', 'non-modal']);
});

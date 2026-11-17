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

test('the recipe shown is the wrapper the demo runs', async ({ page }) => {
	await page.goto('/date-pickers');
	const recipe = page.locator('section[aria-labelledby="recipe"] pre').first();
	await expect(recipe).toContainText("from '@frostycle/rime/date-picker'");
	await expect(recipe).toContainText('data-in-range:');
});

test('every documented prop of both pickers is listed', async ({ page }) => {
	await page.goto('/date-pickers');
	const props = page.locator('section[aria-labelledby="props"]');
	for (const name of ['value', 'min', 'max', 'isDateDisabled', 'months', 'presets', 'minDays', 'maxDays', 'startName', 'endName', 'name']) {
		await expect(props.getByRole('cell', { name, exact: true }).first()).toBeVisible();
	}
});

test('every section of the page is present', async ({ page }) => {
	await page.goto('/date-pickers');
	for (const id of ['demo', 'usage', 'props', 'snippets', 'keyboard', 'attributes', 'recipe', 'url-values', 'non-modal']) {
		await expect(page.locator(`h2#${id}`)).toBeVisible();
	}
});

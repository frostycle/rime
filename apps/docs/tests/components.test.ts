import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

test('the live menu runs an action', async ({ page }) => {
	await page.goto('/dropdown-menu');
	const demo = page.locator('section[aria-labelledby="demo"]');
	await demo.getByRole('button', { name: 'Actions' }).click();
	await page.getByRole('menuitem', { name: 'Duplicate' }).click();
	await expect(demo.getByRole('status')).toHaveText('Selected: Duplicate');
});

test('the live select is labelled and binds its value', async ({ page }) => {
	await page.goto('/select');
	const demo = page.locator('section[aria-labelledby="demo"]');
	await demo.getByRole('combobox', { name: 'Country' }).click();
	await expect(page.getByRole('listbox', { name: 'Country' })).toBeVisible();
	await page.getByRole('option', { name: 'Thailand' }).click();
	await expect(demo.getByRole('status')).toHaveText("value = 'th'");
});

test('a deep link lands on its section', async ({ page }) => {
	await page.goto('/select#keyboard');
	await expect(page).toHaveURL(/#keyboard$/);
	await expect(page.locator('#keyboard')).toBeInViewport();
});

for (const [route, files] of [
	['/dropdown-menu', ['menu-classes.ts', 'AppMenu.svelte']],
	['/select', ['select-classes.ts', 'AppSelect.svelte']]
] as const) {
	for (const file of files) {
		test(`${route} recipe shows ${file} exactly as the demo runs it`, async ({ page }) => {
			const source = readFileSync(new URL(`../src/lib/demos/${file}`, import.meta.url), 'utf8');
			await page.goto(route);
			const shown = page.locator('section[aria-labelledby="recipe"]').getByRole('group', { name: file });
			expect((await shown.textContent())?.trimEnd()).toBe(source.trimEnd());
		});
	}
}

const sectionIds = {
	'/dropdown-menu': ['demo', 'usage', 'props', 'snippets', 'keyboard', 'attributes', 'recipe', 'behaviour'],
	'/select': ['demo', 'usage', 'labelling', 'props', 'snippets', 'keyboard', 'attributes', 'forms', 'recipe', 'behaviour']
};

for (const [route, ids] of Object.entries(sectionIds)) {
	test(`${route} has its sections in order`, async ({ page }) => {
		await page.goto(route);
		const found = await page.locator('main h2').evaluateAll((nodes) => nodes.map((node) => node.id));
		expect(found).toEqual(ids);
	});
}

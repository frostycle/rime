import { expect, test } from '@playwright/test';

test('home leads with the tagline and a working picker, and links every component', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Headless, snippet-based UI primitives for Svelte 5.');
	await page.locator('main').getByRole('button', { name: /Nov 3/ }).click();
	await expect(page.getByRole('dialog', { name: 'Choose dates' })).toBeVisible();
	for (const name of ['Date picker', 'Dropdown menu', 'Select']) {
		await expect(page.locator('main').getByRole('link', { name: new RegExp(name) }).first()).toBeVisible();
	}
});

test('the anatomy keys outline one part at a time', async ({ page }) => {
	await page.goto('/styling');
	const day = page.getByRole('button', { name: 'day', exact: true });
	await day.click();
	await expect(day).toHaveAttribute('aria-pressed', 'true');
	await page.getByRole('button', { name: 'trigger', exact: true }).click();
	await expect(day).toHaveAttribute('aria-pressed', 'false');
});

test('styling keeps the animating section', async ({ page }) => {
	await page.goto('/styling');
	await expect(page.getByRole('heading', { name: 'Animating the popup' })).toBeVisible();
	await expect(page.locator('#animate')).toBeAttached();
});

test('every evidence link on How it is built points into the repo or the npm package', async ({ page }) => {
	await page.goto('/how-its-built');
	const hrefs = await page.locator('main a[href^="http"]').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
	expect(hrefs.length).toBeGreaterThan(4);
	for (const href of hrefs)
		expect(href).toMatch(/^https:\/\/(github\.com\/frostycle\/rime\/blob\/main\/|www\.npmjs\.com\/package\/@frostycle\/rime\/)/);
});

test('provenance is claimed from 0.1.1 and linked to that version on npm', async ({ page }) => {
	await page.goto('/how-its-built');
	await expect(page.getByText(/^From 0\.1\.1, each release .* signed npm provenance statement/)).toBeVisible();
	await expect(page.getByRole('link', { name: 'Provenance on npm' })).toHaveAttribute(
		'href',
		'https://www.npmjs.com/package/@frostycle/rime/v/0.1.1#provenance'
	);
});

test('installation shows the install command and the Svelte requirement', async ({ page }) => {
	await page.goto('/installation');
	await expect(page.getByText('pnpm add @frostycle/rime')).toBeVisible();
	await expect(page.getByText('^5.29.0')).toBeVisible();
});

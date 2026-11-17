import { expect, test } from '@playwright/test';
import { ROUTES } from '../src/lib/site.ts';
import { runAxe } from './axe.ts';

const THEMES = ['light', 'dark'] as const;
const PAGE_BACKGROUND = { light: 'rgb(249, 250, 252)', dark: 'rgb(14, 16, 22)' };

const TABLE_ROUTES = ['/date-pickers', '/dropdown-menu', '/select'];
const CODE_ROUTES = ['/', '/installation', '/styling', ...TABLE_ROUTES];

for (const route of ROUTES) {
	for (const theme of THEMES) {
		test(`${route} has one h1, landmarks, a skip link and passes axe in the ${theme} theme`, async ({ page }) => {
			await page.addInitScript((t) => localStorage.setItem('rime-theme', t), theme);
			await page.goto(route);
			await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
			await expect(page.locator('h1')).toHaveCount(1);
			for (const role of ['banner', 'main', 'contentinfo'] as const) await expect(page.getByRole(role)).toBeVisible();
			await expect(page.getByRole('link', { name: 'Skip to content' })).toBeAttached();
			const { violations } = await runAxe(page);
			expect(violations).toEqual([]);
		});
	}

	test(`${route} does not scroll sideways`, async ({ page }) => {
		await page.goto(route);
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
	});

	test(`${route} is readable without JavaScript`, async ({ browser }) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.goto(route);
		await expect(page.locator('h1')).toBeVisible();
		if (TABLE_ROUTES.includes(route)) await expect(page.locator('td').first()).toBeVisible();
		if (CODE_ROUTES.includes(route)) await expect(page.locator('pre').first()).toBeVisible();
		await context.close();
	});
}

test('the toggle switches theme and the choice survives a reload', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' });
	await page.goto('/installation');
	await page.getByRole('button', { name: 'Switch theme' }).click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('with storage blocked, the theme follows the system and the toggle still works', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(window, 'localStorage', {
			get() {
				throw new Error('blocked');
			}
		});
	});
	await page.emulateMedia({ colorScheme: 'dark' });
	await page.goto('/select');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await page.getByRole('button', { name: 'Switch theme' }).click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('the sidebar marks the current page', async ({ page }) => {
	await page.goto('/select');
	await expect(
		page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Select' })
	).toHaveAttribute('aria-current', 'page');
});

test('an unknown URL shows a 404 page with a link home', async ({ page }) => {
	const response = await page.goto('/no-such-page');
	expect(response?.status()).toBe(404);
	await expect(page.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
});

for (const theme of THEMES) {
	const system = theme === 'light' ? 'dark' : 'light';
	test(`a stored ${theme} theme wins over a ${system} system`, async ({ page }) => {
		await page.emulateMedia({ colorScheme: system });
		await page.addInitScript((t) => localStorage.setItem('rime-theme', t), theme);
		await page.goto('/installation');
		await expect(page.locator('body')).toHaveCSS('background-color', PAGE_BACKGROUND[theme]);
	});

	test(`the 404 page passes axe in the ${theme} theme`, async ({ page }) => {
		await page.addInitScript((t) => localStorage.setItem('rime-theme', t), theme);
		await page.goto('/no-such-page');
		await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
		const { violations } = await runAxe(page);
		expect(violations).toEqual([]);
	});

	test(`without JavaScript, a ${theme} system gets the ${theme} theme`, async ({ browser }) => {
		const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: theme });
		const page = await context.newPage();
		await page.goto('/installation');
		await expect(page.locator('body')).toHaveCSS('background-color', PAGE_BACKGROUND[theme]);
		await context.close();
	});
}

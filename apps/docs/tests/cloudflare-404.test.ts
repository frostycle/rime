import { expect, test } from '@playwright/test';

const PAGES_ORIGIN = 'http://localhost:4174';

test('the built output serves an unknown URL as a 404 page with a link home', async ({
	page,
	request
}, testInfo) => {
	test.skip(testInfo.project.name !== 'chromium', 'one browser is enough for a hosting check');

	expect((await request.get(`${PAGES_ORIGIN}/select`)).status()).toBe(200);

	const response = await page.goto(`${PAGES_ORIGIN}/no-such-page`);
	expect(response?.status()).toBe(404);
	await expect(page.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
});

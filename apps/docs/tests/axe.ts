import { createRequire } from 'node:module';
import type { Page } from '@playwright/test';
import type * as Axe from 'axe-core';

const axePath = createRequire(import.meta.url).resolve('axe-core');

export async function runAxe(page: Page): Promise<Axe.AxeResults> {
	await page.addScriptTag({ path: axePath });
	return page.evaluate(() => (window as unknown as { axe: typeof Axe }).axe.run(document));
}

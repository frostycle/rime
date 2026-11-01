import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { webdriverio } from '@vitest/browser-webdriverio';
import { defineConfig } from 'vitest/config';
import { serverHtmlPlugin } from './tests/server-html-plugin.ts';

export default defineConfig({
	plugins: [svelte()],
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					environment: 'node',
					include: ['src/**/*.test.ts'],
					exclude: ['src/**/*.svelte.test.ts']
				}
			},
			{
				extends: true,
				plugins: [serverHtmlPlugin()],
				test: {
					name: 'browser',
					include: ['src/**/*.svelte.test.ts'],
					browser: {
						enabled: true,
						headless: true,
						provider: playwright(),
						instances: [{ browser: 'chromium' }, { browser: 'webkit' }]
					}
				}
			},
			{
				extends: true,
				plugins: [serverHtmlPlugin()],
				test: {
					name: 'firefox',
					include: ['src/**/*.svelte.test.ts'],
					browser: {
						enabled: true,
						headless: true,
						// Drives the installed Firefox. Playwright's patched build failed to start when this was set up,
						// with "Could not find profile folder".
						provider: webdriverio(),
						instances: [{ browser: 'firefox' }]
					}
				}
			}
		]
	}
});

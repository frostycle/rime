import { defineConfig, devices } from '@playwright/test';

const desktop = { width: 1280, height: 800 };

export default defineConfig({
	testDir: 'tests',
	use: { baseURL: 'http://localhost:4173' },
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: desktop } },
		{ name: 'webkit', use: { ...devices['Desktop Safari'], viewport: desktop } },
		{ name: 'phone', use: { ...devices['iPhone 13'], viewport: { width: 375, height: 812 } } }
	],
	webServer: {
		command: 'vite build && vite preview --port 4173',
		port: 4173,
		reuseExistingServer: !process.env.CI
	}
});

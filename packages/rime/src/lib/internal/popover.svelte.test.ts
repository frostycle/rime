import { beforeEach, expect, test, vi, type Mock } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import PopoverFixture from './PopoverFixture.svelte';
import type { CloseReason, Popover, PopoverOptions } from './popover.svelte.js';

const trigger = page.getByTestId('trigger');
const content = page.getByTestId('content');
const inside = page.getByTestId('inside');
const outside = page.getByTestId('outside');

let onClose: Mock<(reason: CloseReason) => void>;
let popover: Popover;

beforeEach(async () => {
	await page.viewport(1024, 768);
	onClose = vi.fn<(reason: CloseReason) => void>();
});

async function renderFixture(options?: PopoverOptions) {
	await render(PopoverFixture, { onClose, options, expose: (instance: Popover) => (popover = instance) });
}

test('clicking the trigger opens, and clicking it again closes without reopening', async () => {
	await renderFixture();
	await trigger.click();
	await expect.element(content).toBeVisible();
	await trigger.click();
	await expect.element(content).not.toBeInTheDocument();
});

test('the trigger exposes its popup state', async () => {
	await renderFixture();
	await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
	await expect.element(trigger).not.toHaveAttribute('aria-controls');
	await trigger.click();
	await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
	await expect.element(trigger).toHaveAttribute('aria-controls', content.element().id);
});

test('Escape closes and returns focus to the trigger', async () => {
	await renderFixture();
	await trigger.click();
	await expect.element(content).toBeVisible();
	await userEvent.keyboard('{Escape}');
	expect(onClose).toHaveBeenCalledExactlyOnceWith('escape');
	await expect.element(trigger).toHaveFocus();
});

test('commit closes and returns focus to the trigger', async () => {
	await renderFixture();
	await trigger.click();
	await expect.element(content).toBeVisible();
	popover.close('commit');
	await expect.element(trigger).toHaveFocus();
	expect(onClose).toHaveBeenCalledExactlyOnceWith('commit');
});

test('clicking outside closes and leaves focus alone', async () => {
	await renderFixture();
	await trigger.click();
	await expect.element(content).toBeVisible();
	await outside.click();
	await expect.element(content).not.toBeInTheDocument();
	expect(onClose).toHaveBeenCalledExactlyOnceWith('outside');
	await expect.element(trigger).not.toHaveFocus();
});

test('tabbing out closes and does not return focus', async () => {
	await renderFixture();
	await trigger.click();
	await expect.element(content).toBeVisible();
	inside.element().focus();
	await userEvent.tab();
	await expect.element(content).not.toBeInTheDocument();
	expect(onClose).toHaveBeenCalledExactlyOnceWith('focus-left');
	await expect.element(trigger).not.toHaveFocus();
});

test('inline position styles are the only styles applied', async () => {
	await renderFixture();
	await trigger.click();
	await expect.element(content).toBeVisible();
	const { style } = content.element() as HTMLElement;
	const positional = ['position', 'left', 'right', 'top', 'bottom', 'margin', 'inset'];
	expect([...style].every((name) => positional.some((allowed) => name.startsWith(allowed)))).toBe(true);
});

test('the popup flips to stay in the viewport', async () => {
	await renderFixture();
	await page.viewport(800, 300);
	const element = trigger.element() as HTMLElement;
	element.style.position = 'fixed';
	element.style.bottom = '0';
	await trigger.click();
	await expect.element(content).toBeVisible();
	await expect.poll(() => content.element().getBoundingClientRect().bottom).toBeLessThanOrEqual(300);
});

test('role sets the popup role and the trigger aria-haspopup', async () => {
	await renderFixture({ role: 'menu' });
	await expect.element(trigger).toHaveAttribute('aria-haspopup', 'menu');
	await trigger.click();
	await expect.element(content).toHaveAttribute('role', 'menu');
});

test('without options it stays a dialog', async () => {
	await renderFixture();
	await expect.element(trigger).toHaveAttribute('aria-haspopup', 'dialog');
	await trigger.click();
	await expect.element(content).toHaveAttribute('role', 'dialog');
});

test('placement positions the popup', async () => {
	await renderFixture({ placement: () => 'top-start' });
	const element = trigger.element() as HTMLElement;
	element.style.cssText = 'position: fixed; top: 300px';
	await trigger.click();
	await expect.element(content).toBeVisible();
	await expect
		.poll(() => {
			const { top, bottom } = content.element().getBoundingClientRect();
			const triggerTop = element.getBoundingClientRect().top;
			return top > 0 && Math.round(bottom) === Math.round(triggerTop);
		})
		.toBe(true);
});

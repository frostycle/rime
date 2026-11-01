import { afterEach, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DatePicker from './DatePicker.svelte';

const DURATION_MS = 500;
const trigger = () => page.getByRole('button', { name: 'Oct 15, 2026' });
const popup = () => document.querySelector<HTMLElement>('[popover]');

function addTransitionStyles() {
	const style = document.createElement('style');
	style.textContent = `.fade { transition: opacity ${DURATION_MS}ms linear; } .fade[data-closed] { opacity: 0; }`;
	document.head.append(style);
	return style;
}

let styles: HTMLStyleElement | undefined;

afterEach(() => {
	styles?.remove();
});

async function renderAnimated(props = {}) {
	styles = addTransitionStyles();
	await render(DatePicker, { value: '2026-10-15', transition: true, classes: { popup: 'fade' }, ...props });
}

// Closing mid-enter reverses the transition, and CSS shortens a reversal to the distance already covered.
async function openUntilSettled() {
	await trigger().click();
	await expect.poll(popup).not.toBeNull();
	const element = popup()!;
	await expect.poll(() => element.hasAttribute('data-enter'), { timeout: DURATION_MS * 5 }).toBe(false);
}

test('without transition, closing unmounts at once and no phase attributes appear', async () => {
	await render(DatePicker, { value: '2026-10-15' });
	await trigger().click();
	await expect.poll(popup).not.toBeNull();
	expect(popup()!.hasAttribute('data-enter')).toBe(false);
	await userEvent.keyboard('{Escape}');
	expect(popup()).toBeNull();
});

test('entering runs from data-closed, then the phase attributes are removed', async () => {
	await renderAnimated();
	await trigger().click();
	await expect.poll(popup).not.toBeNull();
	const element = popup()!;
	expect(element.hasAttribute('data-closed')).toBe(false);
	expect(element.hasAttribute('data-enter')).toBe(true);
	expect(element.getAnimations().length).toBeGreaterThan(0);
	await expect.poll(() => element.hasAttribute('data-enter')).toBe(false);
});

test('leaving keeps the popup mounted and inert until the transition ends, with focus already returned', async () => {
	await renderAnimated();
	await openUntilSettled();
	await userEvent.keyboard('{Escape}');
	const element = popup()!;
	expect(element.hasAttribute('data-closed')).toBe(true);
	expect(element.hasAttribute('data-leave')).toBe(true);
	expect(element.inert).toBe(true);
	await expect.element(trigger()).toHaveFocus();
	await expect.element(trigger()).not.toHaveAttribute('data-open');
	await expect.poll(popup, { timeout: DURATION_MS * 5 }).toBeNull();
});

test('an outside click also animates out', async () => {
	await renderAnimated();
	await openUntilSettled();
	const outside = document.body.appendChild(document.createElement('button'));
	outside.textContent = 'Outside';
	outside.style.cssText = 'position: fixed; top: 0; right: 0';
	await page.elementLocator(outside).click();
	outside.remove();
	expect(popup()?.hasAttribute('data-leave')).toBe(true);
	await expect.poll(popup, { timeout: DURATION_MS * 5 }).toBeNull();
});

test('committing animates out and fires onchange once', async () => {
	const onchange = vi.fn();
	await renderAnimated({ onchange });
	await trigger().click();
	await page.getByRole('button', { name: /October 20, 2026/ }).click();
	expect(onchange).toHaveBeenCalledExactlyOnceWith('2026-10-20');
	expect(popup()?.hasAttribute('data-leave')).toBe(true);
	await expect.poll(popup, { timeout: DURATION_MS * 5 }).toBeNull();
});

test('reopening during the leave cancels it', async () => {
	await renderAnimated();
	await openUntilSettled();
	await userEvent.keyboard('{Escape}');
	const element = popup()!;
	await trigger().click();
	expect(popup()).toBe(element);
	expect(element.inert).toBe(false);
	expect(element.hasAttribute('data-leave')).toBe(false);
	expect(element.hasAttribute('data-closed')).toBe(false);
	await new Promise((resolve) => setTimeout(resolve, DURATION_MS * 2));
	expect(popup()).toBe(element);
});

test('with no CSS transition defined, closing still unmounts', async () => {
	await render(DatePicker, { value: '2026-10-15', transition: true });
	await trigger().click();
	await expect.poll(popup).not.toBeNull();
	await userEvent.keyboard('{Escape}');
	await expect.poll(popup).toBeNull();
});

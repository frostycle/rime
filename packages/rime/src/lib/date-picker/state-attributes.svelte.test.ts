import { expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DatePicker from './DatePicker.svelte';

const trigger = () => page.getByRole('button', { name: 'Oct 15, 2026' });
const day = (date: string) => page.getByRole('button', { name: new RegExp(date) });

test('the trigger has data-open only while the popup is open', async () => {
	await render(DatePicker, { value: '2026-10-15' });
	await expect.element(trigger()).not.toHaveAttribute('data-open');
	await trigger().click();
	await expect.element(trigger()).toHaveAttribute('data-open');
	await userEvent.keyboard('{Escape}');
	await expect.element(trigger()).not.toHaveAttribute('data-open');
});

test('a disabled trigger has data-disabled', async () => {
	await render(DatePicker, { value: '2026-10-15', disabled: true });
	await expect.element(trigger()).toHaveAttribute('data-disabled');
});

test('data-hover follows the pointer', async () => {
	await render(DatePicker, { value: '2026-10-15' });
	await trigger().click();
	await day('October 20, 2026').hover();
	await expect.element(day('October 20, 2026')).toHaveAttribute('data-hover');
	await day('October 21, 2026').hover();
	await expect.element(day('October 20, 2026')).not.toHaveAttribute('data-hover');
	await expect.element(day('October 21, 2026')).toHaveAttribute('data-hover');
});

test('disabled days take neither data-hover nor data-active', async () => {
	await render(DatePicker, { value: '2026-10-15', max: '2026-10-19' });
	await trigger().click();
	const disabled = day('October 20, 2026');
	await disabled.hover();
	disabled.element().dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
	await expect.element(disabled).not.toHaveAttribute('data-hover');
	await expect.element(disabled).not.toHaveAttribute('data-active');
});

test('data-active lasts for the press', async () => {
	await render(DatePicker, { value: '2026-10-15' });
	await trigger().click();
	const element = day('October 20, 2026').element();
	element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
	expect(element.hasAttribute('data-active')).toBe(true);
	element.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
	expect(element.hasAttribute('data-active')).toBe(false);
});

test('data-focus marks keyboard focus and moves with it', async () => {
	await render(DatePicker, { value: '2026-10-15' });
	await trigger().click();
	await expect.element(day('October 15, 2026')).toHaveFocus();
	await userEvent.keyboard('{ArrowRight}');
	await expect.element(day('October 16, 2026')).toHaveFocus();
	await expect.element(day('October 16, 2026')).toHaveAttribute('data-focus');
	await userEvent.keyboard('{ArrowRight}');
	await expect.element(day('October 17, 2026')).toHaveAttribute('data-focus');
	await expect.element(day('October 16, 2026')).not.toHaveAttribute('data-focus');
});

test('a mouse click does not set data-focus', async () => {
	await render(DatePicker, { value: '2026-10-15' });
	await trigger().click();
	const next = page.getByRole('button', { name: 'Next month' });
	await next.click();
	await expect.element(page.getByRole('grid', { name: 'November 2026' })).toBeVisible();
	await expect.element(next).not.toHaveAttribute('data-focus');
});

test('the default trigger takes a class', async () => {
	await render(DatePicker, { value: '2026-10-15', classes: { trigger: 'my-trigger' } });
	await expect.element(trigger()).toHaveClass('my-trigger');
});

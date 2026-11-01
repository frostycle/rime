import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DateRangePicker from './DateRangePicker.svelte';
import RangeFixture from './fixtures/RangeFixture.svelte';

const open = () => page.getByRole('button', { name: 'Choose' }).click();
const day = (date: string) => page.getByRole('button', { name: new RegExp(date) });

beforeEach(() => {
	vi.setSystemTime(new Date(2026, 9, 15));
});
afterEach(() => {
	vi.useRealTimers();
});

test('two clicks commit once, in click order or reversed', async () => {
	const onchange = vi.fn();
	await render(RangeFixture, { onchange });
	await open();
	await day('October 25, 2026').click();
	expect(onchange).not.toHaveBeenCalled();
	await day('October 20, 2026').click();
	expect(onchange).toHaveBeenCalledExactlyOnceWith({ start: '2026-10-20', end: '2026-10-25' });
	await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
});

test('the default label formats the range', async () => {
	await render(DateRangePicker, { value: { start: '2026-10-01', end: '2026-10-31' } });
	await expect.element(page.getByRole('button', { name: /Oct 1\s.\s31, 2026/ })).toBeVisible();
});

test('one Space press starts a range without finishing it', async () => {
	const onchange = vi.fn();
	await render(RangeFixture, { onchange });
	await open();
	await expect.element(day('October 15, 2026')).toHaveFocus();
	await userEvent.keyboard(' ');
	await expect.element(day('October 15, 2026')).toHaveAttribute('data-range-start');
	expect(onchange).not.toHaveBeenCalled();
	await userEvent.keyboard('{ArrowRight}');
	await userEvent.keyboard(' ');
	expect(onchange).toHaveBeenCalledExactlyOnceWith({ start: '2026-10-15', end: '2026-10-16' });
});

test('hover previews days between the start and the pointer', async () => {
	await render(RangeFixture);
	await open();
	await day('October 20, 2026').click();
	await day('October 23, 2026').hover();
	await expect.element(day('October 22, 2026')).toHaveAttribute('data-preview');
});

test('dismissing mid-selection keeps the previous value', async () => {
	const initial = { start: '2026-10-01', end: '2026-10-02' };
	await render(RangeFixture, { value: initial });
	await page.getByRole('button', { name: /Oct 1/ }).click();
	await day('October 20, 2026').click();
	await userEvent.keyboard('{Escape}');
	await expect.element(page.getByTestId('value')).toHaveTextContent('2026-10-01..2026-10-02');
});

test('reopening after a dismissal starts a fresh range', async () => {
	await render(RangeFixture);
	await open();
	await day('October 20, 2026').click();
	await userEvent.keyboard('{Escape}');
	await open();
	await expect.element(day('October 20, 2026')).not.toHaveAttribute('data-range-start');
});

test('a parent value change discards the pending selection and keeps the popup open', async () => {
	const { rerender } = await render(RangeFixture, { value: { start: '2026-10-01', end: '2026-10-02' } });
	await page.getByRole('button', { name: /Oct 1/ }).click();
	await day('October 20, 2026').click();
	await rerender({ value: { start: '2026-10-05', end: '2026-10-06' } });
	await expect.element(page.getByRole('dialog')).toBeVisible();
	await expect.element(day('October 5, 2026')).toHaveAttribute('data-range-start');
	await expect.element(day('October 20, 2026')).not.toHaveAttribute('data-range-start');
});

test('maxDays disables dates beyond the limit after the first click', async () => {
	await render(RangeFixture, { maxDays: 3 });
	await open();
	await day('October 15, 2026').click();
	await expect.element(day('October 18, 2026')).toHaveAttribute('aria-disabled', 'true');
	await expect.element(day('October 17, 2026')).not.toHaveAttribute('aria-disabled', 'true');
});

test('a preset breaking maxDays is disabled, and a valid one commits', async () => {
	const onchange = vi.fn();
	const presets = [
		{ label: 'Long', value: () => ({ start: '2026-10-01', end: '2026-10-31' }) },
		{ label: 'Short', value: () => ({ start: '2026-10-01', end: '2026-10-02' }) }
	];
	await render(RangeFixture, { maxDays: 3, presets, onchange });
	await open();
	await expect.element(page.getByRole('button', { name: 'Long' })).toBeDisabled();
	await page.getByRole('button', { name: 'Short' }).click();
	expect(onchange).toHaveBeenCalledExactlyOnceWith({ start: '2026-10-01', end: '2026-10-02' });
});

test('clear from the trigger snippet fires onchange with null', async () => {
	const onchange = vi.fn();
	await render(RangeFixture, { value: { start: '2026-10-01', end: '2026-10-02' }, onchange });
	await page.getByRole('button', { name: 'Clear' }).click();
	expect(onchange).toHaveBeenCalledExactlyOnceWith(null);
});

test('a reversed range value throws', async () => {
	await expect(render(DateRangePicker, { value: { start: '2026-10-25', end: '2026-10-20' } })).rejects.toThrow(/before/);
});

test('clear does nothing on a disabled picker', async () => {
	const onchange = vi.fn();
	await render(RangeFixture, { value: { start: '2026-10-01', end: '2026-10-02' }, disabled: true, onchange });
	await page.getByRole('button', { name: 'Clear' }).click();
	expect(onchange).not.toHaveBeenCalled();
	await expect.element(page.getByTestId('value')).toHaveTextContent('2026-10-01..2026-10-02');
});

test('days inside a range say so in their accessible name, and endpoints do not', async () => {
	await render(RangeFixture, { value: { start: '2026-10-01', end: '2026-10-03' } });
	await page.getByRole('button', { name: /Oct 1/ }).click();
	await expect.element(day('October 2, 2026, in selected range')).toBeVisible();
	await expect.element(day('October 3, 2026$')).toBeVisible();
});

test('a custom label translates the in-range name', async () => {
	await render(RangeFixture, { value: { start: '2026-10-01', end: '2026-10-03' }, labels: { inRange: 'dalam rentang' } });
	await page.getByRole('button', { name: /Oct 1/ }).click();
	await expect.element(day('October 2, 2026, dalam rentang')).toBeVisible();
});

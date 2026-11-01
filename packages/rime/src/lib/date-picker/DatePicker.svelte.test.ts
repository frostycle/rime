import { expect, test, vi } from 'vitest';
import { page, server, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DatePicker from './DatePicker.svelte';
import AllSnippetsFixture from './fixtures/AllSnippetsFixture.svelte';
import CustomPresetsFixture from './fixtures/CustomPresetsFixture.svelte';
import ModalDialogFixture from './fixtures/ModalDialogFixture.svelte';
import TwoPickersFixture from './fixtures/TwoPickersFixture.svelte';

test('renders an unstyled button with a formatted label by default', async () => {
	await render(DatePicker, { value: '2026-10-31', locale: 'en-US' });
	await expect.element(page.getByRole('button', { name: 'Oct 31, 2026' })).toBeVisible();
});

test('with no value the default trigger still has an accessible name', async () => {
	await render(DatePicker, { value: null });
	await expect.element(page.getByRole('button', { name: 'Choose date' })).toBeVisible();
});

test('picking a date updates value, fires onchange once and closes', async () => {
	const onchange = vi.fn();
	await render(DatePicker, { value: '2026-10-15', onchange });
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	await page.getByRole('button', { name: /October 20, 2026/ }).click();
	expect(onchange).toHaveBeenCalledExactlyOnceWith('2026-10-20');
	await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
	await expect.element(page.getByRole('button', { name: 'Oct 20, 2026' })).toHaveFocus();
});

test('opening focuses the selected date, arrows move DOM focus, and Enter selects', async () => {
	const onchange = vi.fn();
	await render(DatePicker, { value: '2026-10-15', onchange });
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	await expect.element(page.getByRole('button', { name: /October 15, 2026/ })).toHaveFocus();
	await userEvent.keyboard('{ArrowRight}');
	await expect.element(page.getByRole('button', { name: /October 16, 2026/ })).toHaveFocus();
	await userEvent.keyboard('{Enter}');
	expect(onchange).toHaveBeenCalledExactlyOnceWith('2026-10-16');
});

test('Space selects exactly once', async () => {
	const onchange = vi.fn();
	await render(DatePicker, { value: '2026-10-15', onchange });
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	await expect.element(page.getByRole('button', { name: /October 15, 2026/ })).toHaveFocus();
	await userEvent.keyboard(' ');
	expect(onchange).toHaveBeenCalledExactlyOnceWith('2026-10-15');
});

test('a parent-set value does not fire onchange', async () => {
	const onchange = vi.fn();
	const { rerender } = await render(DatePicker, { value: '2026-10-15', onchange });
	await rerender({ value: '2026-10-16' });
	expect(onchange).not.toHaveBeenCalled();
});

test('invalid value throws a descriptive error', async () => {
	await expect(render(DatePicker, { value: '2026-02-31' })).rejects.toThrow(/2026-02-31/);
});

test('a value outside min and max is displayed unchanged', async () => {
	await render(DatePicker, { value: '2026-01-01', min: '2026-06-01' });
	await expect.element(page.getByRole('button', { name: 'Jan 1, 2026' })).toBeVisible();
});

test('snippets replace trigger, popup, header, grid, day and presets', async () => {
	await render(AllSnippetsFixture);
	await page.getByTestId('custom-trigger').click();
	for (const id of ['custom-popup', 'custom-header', 'custom-grid', 'custom-day', 'custom-presets']) {
		await expect.element(page.getByTestId(id).first()).toBeVisible();
	}
	await page.getByTestId('custom-day').nth(10).click();
	await expect.element(page.getByTestId('value')).toHaveTextContent('2026-10-11');
});

test('default elements take classes and expose data attributes', async () => {
	await render(DatePicker, { value: '2026-10-15', classes: { day: 'my-day', popup: 'my-popup' } });
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	const selected = page.getByRole('button', { name: /October 15, 2026/ });
	await expect.element(selected).toHaveClass('my-day');
	await expect.element(selected).toHaveAttribute('data-selected');
	await expect.element(page.getByRole('dialog')).toHaveClass('my-popup');
});

test('grid is labelled by its month title and outside cells are empty', async () => {
	await render(DatePicker, { value: '2026-10-15' });
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	await expect.element(page.getByRole('grid', { name: 'October 2026' })).toBeVisible();
	expect(page.getByRole('button', { name: /October 1, 2026/ }).elements()).toHaveLength(1);
});

test('two-month view has one previous and one next control', async () => {
	await render(DatePicker, { value: '2026-10-15', months: 2 });
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	expect(page.getByRole('button', { name: 'Previous month' }).elements()).toHaveLength(1);
	expect(page.getByRole('button', { name: 'Next month' }).elements()).toHaveLength(1);
	await expect.element(page.getByRole('grid', { name: 'November 2026' })).toBeVisible();
});

test('presets commit immediately, and out-of-bounds presets are disabled', async () => {
	const onchange = vi.fn();
	const presets = [
		{ label: 'Inside', value: () => '2026-10-20' },
		{ label: 'Outside', value: () => '2027-01-01' }
	];
	await render(DatePicker, { value: '2026-10-15', max: '2026-12-31', presets, onchange });
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	await expect.element(page.getByRole('button', { name: 'Outside' })).toBeDisabled();
	await page.getByRole('button', { name: 'Inside' }).click();
	expect(onchange).toHaveBeenCalledExactlyOnceWith('2026-10-20');
});

// WebKit's Tab skips buttons by default, as Safari does, so this order cannot be observed there.
test.skipIf(server.browser === 'webkit')('tab order is presets, navigation, then grid', async () => {
	await render(DatePicker, { value: '2026-10-15', presets: [{ label: 'P', value: () => '2026-10-20' }] });
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	await expect.element(page.getByRole('button', { name: /October 15, 2026/ })).toHaveFocus();
	(page.getByRole('button', { name: 'P', exact: true }).element() as HTMLElement).focus();
	await userEvent.tab();
	await expect.element(page.getByRole('button', { name: 'Previous month' })).toHaveFocus();
	await userEvent.tab();
	await expect.element(page.getByRole('button', { name: 'Next month' })).toHaveFocus();
	await userEvent.tab();
	await expect.element(page.getByRole('button', { name: /October 15, 2026/ })).toHaveFocus();
});

test('disabled picker does not open', async () => {
	await render(DatePicker, { value: '2026-10-15', disabled: true });
	await expect.element(page.getByRole('button', { name: 'Oct 15, 2026' })).toBeDisabled();
});

test('two pickers keep unique ids, and opening the second closes the first', async () => {
	await render(TwoPickersFixture);
	await page.getByRole('button', { name: 'Oct 1, 2026' }).click();
	await expect.element(page.getByRole('dialog')).toBeVisible();
	await page.getByRole('button', { name: 'Nov 1, 2026' }).click();
	await expect.element(page.getByRole('grid', { name: 'November 2026' })).toBeVisible();
	expect(page.getByRole('dialog').elements()).toHaveLength(1);
	const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
	expect(new Set(ids).size).toBe(ids.length);
});

test('inside a modal dialog, the popup is on top and Escape closes only the popup', async () => {
	await render(ModalDialogFixture);
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	await page.getByRole('button', { name: /October 20, 2026/ }).hover();
	await userEvent.keyboard('{Escape}');
	await expect.element(page.getByRole('grid')).not.toBeInTheDocument();
	await expect.element(page.getByTestId('modal')).toBeVisible();
});

test('disabling an open picker closes the popup', async () => {
	const onchange = vi.fn();
	const { rerender } = await render(DatePicker, { value: '2026-10-15', onchange });
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	await expect.element(page.getByRole('dialog')).toBeVisible();
	await rerender({ disabled: true });
	await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
	expect(onchange).not.toHaveBeenCalled();
});

test('select from a custom preset list cannot commit a disallowed value', async () => {
	const onchange = vi.fn();
	const presets = [{ label: 'Outside', value: () => '2027-01-01' }];
	await render(CustomPresetsFixture, { value: '2026-10-15', max: '2026-12-31', presets, onchange });
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	await page.getByRole('button', { name: 'Outside' }).click();
	expect(onchange).not.toHaveBeenCalled();
});

test('a parent value in another month is shown in the open popup', async () => {
	const { rerender } = await render(DatePicker, { value: '2026-10-15' });
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	await expect.element(page.getByRole('grid', { name: 'October 2026' })).toBeVisible();
	await rerender({ value: '2027-03-05' });
	await expect.element(page.getByRole('grid', { name: 'March 2027' })).toBeVisible();
	await expect.element(page.getByRole('button', { name: /March 5, 2027/ })).toHaveAttribute('data-selected');
	await expect.element(page.getByRole('button', { name: /March 5, 2027/ })).toHaveFocus();
});

test('month changes are announced and today is exposed to assistive technology', async () => {
	vi.setSystemTime(new Date(2026, 9, 15));
	await render(DatePicker, { value: '2026-10-01' });
	await page.getByRole('button', { name: 'Oct 1, 2026' }).click();
	await expect.element(page.getByText('October 2026')).toHaveAttribute('aria-live', 'polite');
	await expect.element(page.getByRole('button', { name: /October 15, 2026/ })).toHaveAttribute('aria-current', 'date');
	await expect.element(page.getByRole('button', { name: /October 16, 2026/ })).not.toHaveAttribute('aria-current');
	vi.useRealTimers();
});

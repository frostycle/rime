import axe from 'axe-core';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import FormNativeSelectFixture from './fixtures/FormNativeSelectFixture.svelte';
import FormSelectFixture from './fixtures/FormSelectFixture.svelte';
import LateItemsNativeSelectFixture from './fixtures/LateItemsNativeSelectFixture.svelte';
import NativeSelect from './NativeSelect.svelte';

const field = () => page.getByRole('combobox', { name: 'Country' });
const select = () => document.querySelector('select')!;
const form = () => document.querySelector('form')!;
const formData = () => Object.fromEntries(new FormData(form()));
const hiddenInput = () => document.querySelector<HTMLInputElement>('input[type="hidden"][name="country"]');
const items = [
	{ value: 'id', label: 'Indonesia' },
	{ value: 'jp', label: 'Japan' }
];

function recordHiddenInputEvents(log: string[]) {
	for (const type of ['input', 'change']) {
		form().addEventListener(type, (event) => {
			if (event.target === hiddenInput()) log.push(type);
		});
	}
}

test('items map to options, disabled options, optgroups and hr', async () => {
	await render(FormNativeSelectFixture, {
		items: [
			items[0],
			{ type: 'separator' },
			{ type: 'group', label: 'Asia', items: [{ value: 'jp', label: 'Japan', disabled: true }] },
			{ type: 'group', label: 'Europe', items: [] }
		]
	});
	const japan = select().querySelector<HTMLOptionElement>('optgroup[label="Asia"] option[value="jp"]');
	expect(japan?.disabled).toBe(true);
	expect(select().querySelectorAll('hr')).toHaveLength(1);
	expect(select().querySelector('optgroup[label="Europe"]')).toBeNull();
});

test('the empty first option shows while value is null', async () => {
	const { unmount } = await render(FormNativeSelectFixture, { placeholder: 'Choose' });
	expect(select().selectedIndex).toBe(0);
	const first = select().options[0];
	expect([first.value, first.disabled, first.hidden, first.text]).toEqual(['', true, true, 'Choose']);
	unmount();
	await render(FormNativeSelectFixture);
	expect(select().selectedIndex).toBe(0);
	expect(select().options[0].text).toBe('');
});

test('a value missing from items selects a hidden option and submits it', async () => {
	await render(FormNativeSelectFixture, { value: 'zz' });
	expect(select().value).toBe('zz');
	const chosen = select().selectedOptions[0];
	expect([chosen.hidden, chosen.disabled]).toEqual([true, true]);
	expect(formData()).toEqual({ country: 'zz' });
});

test('a value moving from missing to present selects the real option', async () => {
	const { rerender } = await render(FormNativeSelectFixture);
	await rerender({ value: 'zz' });
	await rerender({ value: 'jp' });
	expect(select().value).toBe('jp');
	expect(select().querySelector('option[value="zz"]')).toBeNull();
});

test('options arriving after mount still show the bound value', async () => {
	const { rerender } = await render(FormNativeSelectFixture, { items: [], value: 'jp' });
	await rerender({ items });
	expect(select().value).toBe('jp');
	expect(select().selectedOptions[0].text).toBe('Japan');
});

test('the select has no name; a hidden input carries it', async () => {
	await render(FormNativeSelectFixture);
	expect(select().hasAttribute('name')).toBe(false);
	expect(hiddenInput()).not.toBeNull();
});

test('form data matches Select for the same props', async () => {
	for (const props of [{ value: null }, { value: 'jp' }, { value: 'zz' }, { value: 'jp', disabled: true }]) {
		const custom = await render(FormSelectFixture, props);
		const expected = formData();
		custom.unmount();
		const native = await render(FormNativeSelectFixture, props);
		expect(formData()).toEqual(expected);
		native.unmount();
	}
});

test('picking fires input then change from the hidden input, then onchange', async () => {
	const log: string[] = [];
	await render(FormNativeSelectFixture, { onchange: (value: string | null) => log.push(`onchange:${value}`) });
	recordHiddenInputEvents(log);
	await userEvent.selectOptions(field(), 'jp');
	expect(log).toEqual(['input', 'change', 'onchange:jp']);
	await expect.element(page.getByRole('status')).toHaveTextContent('jp');
});

test('picking the current value fires nothing', async () => {
	const log: string[] = [];
	const onchange = vi.fn();
	await render(FormNativeSelectFixture, { value: 'jp', onchange });
	recordHiddenInputEvents(log);
	await userEvent.selectOptions(field(), 'jp');
	expect(log).toEqual([]);
	expect(onchange).not.toHaveBeenCalled();
});

test('a value set by the parent fires nothing', async () => {
	const log: string[] = [];
	const onchange = vi.fn();
	const { rerender } = await render(FormNativeSelectFixture, { onchange });
	recordHiddenInputEvents(log);
	await rerender({ value: 'jp' });
	expect(select().value).toBe('jp');
	expect(log).toEqual([]);
	expect(onchange).not.toHaveBeenCalled();
});

test('disabled submits nothing, like Select', async () => {
	await render(FormNativeSelectFixture, { value: 'jp', disabled: true });
	expect(select().disabled).toBe(true);
	expect(formData()).toEqual({});
	expect(hiddenInput()).toBeNull();
});

test('id names the select for its label, and one is generated without it', async () => {
	const { unmount } = await render(FormNativeSelectFixture);
	await expect.element(field()).toBeVisible();
	unmount();
	await render(NativeSelect, { items });
	expect(select().id).not.toBe('');
});

test('required blocks submit while value is null', async () => {
	await render(FormNativeSelectFixture, { required: true });
	expect(form().checkValidity()).toBe(false);
});

test('required passes once an option is picked', async () => {
	await render(FormNativeSelectFixture, { required: true });
	await userEvent.selectOptions(field(), 'jp');
	expect(form().checkValidity()).toBe(true);
});

test('an empty-string value reports a missing value', async () => {
	await render(FormNativeSelectFixture, { required: true, value: '' });
	expect(form().checkValidity()).toBe(false);
});

test('the invalid state appears only after validation fails', async () => {
	await render(FormNativeSelectFixture, { required: true });
	await expect.element(field()).not.toHaveAttribute('data-invalid');
	await expect.element(field()).not.toHaveAttribute('aria-invalid');
	form().checkValidity();
	await expect.element(field()).toHaveAttribute('data-invalid');
	await expect.element(field()).toHaveAttribute('aria-invalid', 'true');
});

test('picking a value clears the invalid state', async () => {
	await render(FormNativeSelectFixture, { required: true });
	form().checkValidity();
	await userEvent.selectOptions(field(), 'jp');
	await expect.element(field()).not.toHaveAttribute('data-invalid');
	await expect.element(field()).not.toHaveAttribute('aria-invalid');
});

test('form reset clears the invalid state', async () => {
	await render(FormNativeSelectFixture, { required: true });
	form().checkValidity();
	await expect.element(field()).toHaveAttribute('data-invalid');
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect.element(field()).not.toHaveAttribute('data-invalid');
	await expect.element(field()).not.toHaveAttribute('aria-invalid');
});

test('turning required off clears the invalid state', async () => {
	const { rerender } = await render(FormNativeSelectFixture, { required: true });
	form().checkValidity();
	await expect.element(field()).toHaveAttribute('data-invalid');
	await rerender({ required: false });
	await expect.element(field()).not.toHaveAttribute('data-invalid');
});

test('the select has no aria-required', async () => {
	await render(FormNativeSelectFixture, { required: true });
	await expect.element(field()).not.toHaveAttribute('aria-required');
});

test('form reset restores the mount value in the element and the bound value', async () => {
	const { unmount } = await render(FormNativeSelectFixture, { value: 'id' });
	await userEvent.selectOptions(field(), 'jp');
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect.poll(() => select().value).toBe('id');
	await expect.element(page.getByRole('status')).toHaveTextContent('id');
	expect(formData()).toEqual({ country: 'id' });
	unmount();

	const second = await render(FormNativeSelectFixture);
	await userEvent.selectOptions(field(), 'jp');
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect.poll(() => select().selectedIndex).toBe(0);
	expect(formData()).toEqual({ country: '' });
	second.unmount();

	await render(FormNativeSelectFixture, { value: 'zz' });
	await userEvent.selectOptions(field(), 'jp');
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect.poll(() => select().value).toBe('zz');
	expect(formData()).toEqual({ country: 'zz' });
});

test('form reset fires nothing from the hidden input and does not call onchange', async () => {
	const log: string[] = [];
	const onchange = vi.fn();
	await render(FormNativeSelectFixture, { value: 'id', onchange });
	await userEvent.selectOptions(field(), 'jp');
	onchange.mockClear();
	recordHiddenInputEvents(log);
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect.poll(() => select().value).toBe('id');
	expect(log).toEqual([]);
	expect(onchange).not.toHaveBeenCalled();
});

test('state attributes', async () => {
	const { rerender } = await render(FormNativeSelectFixture);
	await field().hover();
	await expect.element(field()).toHaveAttribute('data-hover');
	select().dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
	expect(select().hasAttribute('data-active')).toBe(true);
	select().dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
	expect(select().hasAttribute('data-active')).toBe(false);
	await userEvent.tab();
	await expect.element(field()).toHaveAttribute('data-focus');
	await rerender({ disabled: true });
	await expect.element(field()).toHaveAttribute('data-disabled');
});

test('axe finds no violations, with and without a value', async () => {
	for (const value of [null, 'jp']) {
		const { unmount } = await render(FormNativeSelectFixture, { value });
		const { violations } = await axe.run(document.body, { rules: { region: { enabled: false } } });
		expect(violations).toEqual([]);
		unmount();
	}
});

test('options added after a pick keep the pick, and reset restores the mount value', async () => {
	await render(LateItemsNativeSelectFixture);
	await userEvent.selectOptions(field(), 'id');
	await page.getByRole('button', { name: 'Add Japan' }).click();
	await expect.element(page.getByTestId('seen')).toHaveTextContent('id');
	expect(select().value).toBe('id');
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect.poll(() => select().value).toBe('jp');
});

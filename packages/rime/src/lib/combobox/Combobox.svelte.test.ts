import axe from 'axe-core';
import { expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import LabelledComboboxFixture from './fixtures/LabelledComboboxFixture.svelte';

const field = () => page.getByRole('combobox', { name: 'Timezone' });
const option = (name: string) => page.getByRole('option', { name });
const all = [
	{ value: 'Asia/Jakarta', label: 'Asia/Jakarta' },
	{ value: 'Asia/Jayapura', label: 'Asia/Jayapura' },
	{ value: 'Europe/Paris', label: 'Europe/Paris' }
];
const renderField = (props = {}) => render(LabelledComboboxFixture, { all, ...props });
const query = () => page.getByTestId('query');

test('the input shows the selected label, or the placeholder', async () => {
	const { unmount } = await renderField({ value: 'Europe/Paris' });
	await expect.element(field()).toHaveValue('Europe/Paris');
	unmount();
	await renderField({ value: null, placeholder: 'Search' });
	await expect.element(field()).toHaveValue('');
	await expect.element(field()).toHaveAttribute('placeholder', 'Search');
});

test("typing sets query, opens the list and shows the caller's filtered items", async () => {
	await renderField();
	await field().fill('jak');
	await expect.element(query()).toHaveTextContent('jak');
	await expect.element(page.getByRole('listbox')).toBeVisible();
	await expect.element(page.getByRole('option')).toHaveLength(1);
	await expect.element(option('Asia/Jakarta')).toBeVisible();
});

test('pasting starts editing like typing', async () => {
	await renderField();
	const input = field().element() as HTMLInputElement;
	input.focus();
	input.value = 'ja';
	input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }));
	await expect.element(page.getByRole('listbox')).toBeVisible();
	await expect.element(query()).toHaveTextContent('ja');
});

test('clicking an option picks it, restores the label and resets query', async () => {
	const onchange = vi.fn();
	await renderField({ onchange });
	await field().fill('jak');
	await option('Asia/Jakarta').click();
	await expect.element(page.getByRole('status')).toHaveTextContent('Asia/Jakarta');
	expect(onchange).toHaveBeenCalledExactlyOnceWith('Asia/Jakarta');
	await expect.element(field()).toHaveValue('Asia/Jakarta');
	await expect.element(query()).toHaveTextContent('');
	await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
	await expect.element(field()).toHaveFocus();
});

test('clicking into the input does not open the list', async () => {
	await renderField();
	await field().click();
	await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
});

test('roles follow the combobox pattern', async () => {
	await renderField();
	await expect.element(field()).toHaveAttribute('aria-autocomplete', 'list');
	await expect.element(field()).toHaveAttribute('autocomplete', 'off');
	await expect.element(field()).toHaveAttribute('aria-expanded', 'false');
	await field().fill('jak');
	await expect.element(field()).toHaveAttribute('aria-expanded', 'true');
	await expect.element(page.getByRole('listbox', { name: 'Timezone' })).toBeVisible();
});

const axeOptions = { rules: { region: { enabled: false } } };

test('axe finds no violations, closed or open', async () => {
	await renderField();
	expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
	await field().fill('ja');
	await expect.element(page.getByRole('listbox')).toBeVisible();
	expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
});

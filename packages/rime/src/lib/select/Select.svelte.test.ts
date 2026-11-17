import axe from 'axe-core';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import AllSnippetsFixture from './fixtures/AllSnippetsFixture.svelte';
import LabelledSelectFixture from './fixtures/LabelledSelectFixture.svelte';
import type { SelectEntry } from './types.js';

const field = () => page.getByRole('combobox', { name: 'Country' });
const option = (name: string) => page.getByRole('option', { name });
const countries = (): SelectEntry[] => [
	{ value: 'id', label: 'Indonesia' },
	{ value: 'it', label: 'Italy', disabled: true },
	{ value: 'in', label: 'India' },
	{ value: 'jp', label: 'Japan' },
	{ type: 'separator' },
	{ type: 'group', label: 'Later', items: [{ value: 'th', label: 'Thailand' }] }
];
const renderField = (props = {}) => render(LabelledSelectFixture, { items: countries(), ...props });

test('roles and labelling follow the select-only combobox pattern', async () => {
	await renderField();
	await expect.element(field()).toHaveAttribute('aria-haspopup', 'listbox');
	await expect.element(field()).toHaveAttribute('aria-expanded', 'false');
	await field().click();
	await expect.element(page.getByRole('listbox', { name: 'Country' })).toBeVisible();
	await expect.element(page.getByRole('group', { name: 'Later' })).toBeVisible();
	await expect.element(option('Italy')).toHaveAttribute('aria-disabled', 'true');
});

test('the trigger shows the placeholder, then the selected label', async () => {
	await renderField({ placeholder: 'Choose' });
	await expect.element(field()).toHaveTextContent('Choose');
	await expect.element(field()).toHaveAttribute('data-placeholder');
	await field().click();
	await option('Japan').click();
	await expect.element(field()).toHaveTextContent('Japan');
	await expect.element(field()).not.toHaveAttribute('data-placeholder');
	await expect.element(page.getByRole('status')).toHaveTextContent('jp');
});

test('clicking the label focuses the trigger without opening', async () => {
	await renderField();
	await page.getByText('Country').click();
	await expect.element(field()).toHaveFocus();
	await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
});

test('pressing an option keeps focus on the trigger and selects it', async () => {
	const onchange = vi.fn();
	await renderField({ onchange });
	await field().click();
	await option('India').click();
	expect(onchange).toHaveBeenCalledExactlyOnceWith('in');
	await expect.element(field()).toHaveFocus();
	await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
});

test('pointer down on the popup itself does not close it', async () => {
	await renderField();
	await field().click();
	await page.getByText('Later').click();
	await expect.element(field()).toHaveFocus();
	await expect.element(page.getByRole('listbox')).toBeVisible();
});

test('a disabled option does nothing and stays open', async () => {
	const onchange = vi.fn();
	await renderField({ onchange });
	await field().click();
	(option('Italy').element() as HTMLElement).click();
	expect(onchange).not.toHaveBeenCalled();
	await expect.element(page.getByRole('listbox')).toBeVisible();
});

test.each([['{Enter}'], [' '], ['{ArrowDown}'], ['{ArrowUp}']])('%s opens on the selected option', async (key) => {
	await renderField({ value: 'in' });
	(field().element() as HTMLElement).focus();
	await userEvent.keyboard(key);
	await expect.element(field()).toHaveAttribute('aria-activedescendant', option('India').element().id);
	await expect.element(field()).toHaveFocus();
});

test('Home and End open on the first and last enabled option', async () => {
	await renderField();
	(field().element() as HTMLElement).focus();
	await userEvent.keyboard('{End}');
	await expect.element(option('Thailand')).toHaveAttribute('data-highlighted');
	await userEvent.keyboard('{Escape}{Home}');
	await expect.element(option('Indonesia')).toHaveAttribute('data-highlighted');
});

test('typing on the closed trigger opens on the first match', async () => {
	await renderField();
	(field().element() as HTMLElement).focus();
	await userEvent.keyboard('j');
	await expect.element(option('Japan')).toHaveAttribute('data-highlighted');
});

test('arrows skip disabled options and stop at the ends', async () => {
	await renderField();
	await field().click();
	await userEvent.keyboard('{ArrowDown}');
	await expect.element(option('India')).toHaveAttribute('data-highlighted');
	await userEvent.keyboard('{End}{ArrowDown}');
	await expect.element(option('Thailand')).toHaveAttribute('data-highlighted');
	await userEvent.keyboard('{Home}{ArrowUp}');
	await expect.element(option('Indonesia')).toHaveAttribute('data-highlighted');
});

test('Page Down and Page Up move ten options', async () => {
	const items = Array.from({ length: 15 }, (_, i) => ({ value: `${i}`, label: `Option ${i}` }));
	await renderField({ items });
	await field().click();
	await userEvent.keyboard('{PageDown}');
	await expect.element(option('Option 10')).toHaveAttribute('data-highlighted');
	await expect.element(option('Option 10')).toBeInViewport();
	await userEvent.keyboard('{PageDown}{PageUp}');
	await expect.element(option('Option 4')).toHaveAttribute('data-highlighted');
});

test('Space counts as typing while typeahead text is pending', async () => {
	await renderField({ items: [{ value: 'no', label: 'Norway' }, { value: 'nz', label: 'New Zealand' }] });
	await field().click();
	await userEvent.keyboard('new z');
	await expect.element(option('New Zealand')).toHaveAttribute('data-highlighted');
	await expect.element(page.getByRole('listbox')).toBeVisible();
});

test('Enter selects and Escape keeps the value', async () => {
	await renderField({ value: 'id' });
	await field().click();
	await userEvent.keyboard('{ArrowDown}{Enter}');
	await expect.element(page.getByRole('status')).toHaveTextContent('in');
	await userEvent.keyboard('{Enter}{ArrowDown}{Escape}');
	await expect.element(page.getByRole('status')).toHaveTextContent('in');
	await expect.element(field()).toHaveFocus();
});

test('Tab selects the highlighted option and moves on', async () => {
	await renderField();
	await field().click();
	await userEvent.keyboard('{End}{Tab}');
	await expect.element(page.getByRole('status')).toHaveTextContent('th');
	await expect.element(page.getByRole('textbox', { name: 'After' })).toHaveFocus();
});

test('onchange only fires when the value changes', async () => {
	const onchange = vi.fn();
	await renderField({ value: 'id', onchange });
	await field().click();
	await userEvent.keyboard('{Enter}');
	expect(onchange).not.toHaveBeenCalled();
});

test('state attributes mark the selected and highlighted options', async () => {
	await renderField({ value: 'in' });
	await field().click();
	await expect.element(option('India')).toHaveAttribute('aria-selected', 'true');
	await expect.element(option('India')).toHaveAttribute('data-selected');
	await option('Japan').hover();
	await expect.element(option('Japan')).toHaveAttribute('data-highlighted');
	await expect.element(option('India')).not.toHaveAttribute('data-highlighted');
});

test('all snippets render with their props', async () => {
	await render(AllSnippetsFixture);
	await field().click();
	await expect.element(option('India')).toHaveAttribute('data-custom');
	await expect.element(page.getByTestId('custom-separator')).toBeInTheDocument();
});

const axeOptions = { rules: { region: { enabled: false } } };

test('axe finds no violations, closed or open', async () => {
	await renderField();
	expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
	await field().click();
	expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
});

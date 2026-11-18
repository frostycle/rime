import axe from 'axe-core';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import AllSnippetsFixture from './fixtures/AllSnippetsFixture.svelte';
import CustomTriggerFixture from './fixtures/CustomTriggerFixture.svelte';
import FormSelectFixture from './fixtures/FormSelectFixture.svelte';
import LabelledSelectFixture from './fixtures/LabelledSelectFixture.svelte';
import LateLabelFixture from './fixtures/LateLabelFixture.svelte';
import ModalSelectFixture from './fixtures/ModalSelectFixture.svelte';
import RequiredCustomTriggerFixture from './fixtures/RequiredCustomTriggerFixture.svelte';
import SelectMenuPickerFixture from './fixtures/SelectMenuPickerFixture.svelte';
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

test('a label rendered after the select mounts also focuses without opening', async () => {
	const { rerender } = await render(LateLabelFixture);
	await rerender({ showLabel: true });
	await page.getByText('Country').click();
	await expect.element(field()).toHaveFocus();
	await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
	await userEvent.keyboard('{ArrowDown}');
	await expect.element(page.getByRole('listbox', { name: 'Country' })).toBeVisible();
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
	await expect.element(page.getByTestId('custom-trigger')).toBeInTheDocument();
	await expect.element(page.getByTestId('custom-popup')).toBeInTheDocument();
	await expect.element(page.getByTestId('custom-group-label')).toHaveTextContent('Later');
	await expect.element(page.getByTestId('custom-separator')).toHaveAttribute('role', 'none');
});

const axeOptions = { rules: { region: { enabled: false } } };

test('axe finds no violations, closed or open', async () => {
	await renderField();
	expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
	await field().click();
	expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
});

const hiddenInput = () => document.querySelector<HTMLInputElement>('input[name="country"]')!;

test('name writes a hidden input, and form reset restores the mounted value', async () => {
	await render(FormSelectFixture, { value: 'id' });
	expect(hiddenInput().value).toBe('id');
	await field().click();
	await option('Japan').click();
	expect(hiddenInput().value).toBe('jp');
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect.element(field()).toHaveTextContent('Indonesia');
	expect(hiddenInput().value).toBe('id');
});

function recordFormEvents(): string[] {
	const seen: string[] = [];
	const form = document.querySelector('form')!;
	for (const type of ['input', 'change']) {
		form.addEventListener(type, (event) => {
			const target = event.target as HTMLInputElement;
			seen.push(`${type} ${target.name}=${target.value}`);
		});
	}
	return seen;
}

test('picking a new option fires input then change on the form, like a native select', async () => {
	await render(FormSelectFixture, { value: 'id' });
	const seen = recordFormEvents();
	await field().click();
	await option('Japan').click();
	expect(seen).toEqual(['input country=jp', 'change country=jp']);
});

test('re-picking the current option, a reset or an outside change fires no form event', async () => {
	const { rerender } = await render(FormSelectFixture, { value: 'id' });
	const seen = recordFormEvents();
	await field().click();
	await option('Indonesia').click();
	await rerender({ value: 'jp' });
	await expect.element(field()).toHaveTextContent('Japan');
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect.element(field()).toHaveTextContent('Indonesia');
	expect(seen).toEqual([]);
});

test('a disabled select submits nothing, like a disabled native select', async () => {
	const { rerender } = await render(FormSelectFixture, { value: 'id', disabled: true });
	expect(formData()).toEqual({});
	await rerender({ disabled: false });
	expect(formData()).toEqual({ country: 'id' });
});

const form = () => document.querySelector('form')!;
const formData = () => Object.fromEntries(new FormData(form()));

test('required blocks submit while nothing is chosen', async () => {
	await render(FormSelectFixture, { required: true });
	expect(form().checkValidity()).toBe(false);
});

test('required passes once an option is picked, and submits the same data', async () => {
	await render(FormSelectFixture, { required: true });
	await field().click();
	await option('Japan').click();
	expect(form().checkValidity()).toBe(true);
	expect(formData()).toEqual({ country: 'jp' });
});

test('required treats an empty-string value as missing', async () => {
	await render(FormSelectFixture, { required: true, value: '' });
	expect(form().checkValidity()).toBe(false);
});

test('required treats a value with no matching option as chosen', async () => {
	await render(FormSelectFixture, { required: true, value: 'zz' });
	expect(form().checkValidity()).toBe(true);
});

test('picking an option whose value is empty stays invalid', async () => {
	await render(FormSelectFixture, {
		required: true,
		value: 'jp',
		items: [
			{ value: '', label: 'None' },
			{ value: 'jp', label: 'Japan' }
		]
	});
	await field().click();
	await option('None').click();
	expect(form().checkValidity()).toBe(false);
});

test('a disabled required select neither validates nor submits', async () => {
	await render(FormSelectFixture, { required: true, disabled: true });
	expect(form().checkValidity()).toBe(true);
	expect(formData()).toEqual({});
});

test('required without name still validates and submits nothing', async () => {
	await render(FormSelectFixture, { required: true, name: undefined });
	expect(form().checkValidity()).toBe(false);
	expect(formData()).toEqual({});
});

test('required marks the trigger aria-required', async () => {
	const { rerender } = await render(FormSelectFixture, { required: true });
	await expect.element(field()).toHaveAttribute('aria-required', 'true');
	await rerender({ required: false });
	await expect.element(field()).not.toHaveAttribute('aria-required');
});

test('a blocked submit focuses the trigger, not the hidden select', async () => {
	await render(FormSelectFixture, { required: true });
	const onsubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
	form().addEventListener('submit', onsubmit);
	form().requestSubmit();
	await expect.element(field()).toHaveFocus();
	expect(onsubmit).not.toHaveBeenCalled();
});

test('the invalid state appears only after validation fails', async () => {
	await render(FormSelectFixture, { required: true });
	await expect.element(field()).not.toHaveAttribute('data-invalid');
	await expect.element(field()).not.toHaveAttribute('aria-invalid');
	form().checkValidity();
	await expect.element(field()).toHaveAttribute('data-invalid');
	await expect.element(field()).toHaveAttribute('aria-invalid', 'true');
});

test('picking a value clears the invalid state', async () => {
	await render(FormSelectFixture, { required: true });
	form().checkValidity();
	await field().click();
	await option('Japan').click();
	await expect.element(field()).not.toHaveAttribute('data-invalid');
	await expect.element(field()).not.toHaveAttribute('aria-invalid');
});

test('form reset clears the invalid state', async () => {
	await render(FormSelectFixture, { required: true });
	form().checkValidity();
	await expect.element(field()).toHaveAttribute('data-invalid');
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect.element(field()).not.toHaveAttribute('data-invalid');
	await expect.element(field()).not.toHaveAttribute('aria-invalid');
});

test('the invalid state reaches a custom trigger', async () => {
	await render(RequiredCustomTriggerFixture);
	form().checkValidity();
	const trigger = page.getByTestId('div-trigger');
	await expect.element(trigger).toHaveAttribute('aria-required', 'true');
	await expect.element(trigger).toHaveAttribute('aria-invalid', 'true');
	await expect.element(trigger).toHaveAttribute('data-invalid');
});

test('turning required off clears the invalid state and restores the hidden input', async () => {
	const { rerender } = await render(FormSelectFixture, { required: true });
	form().checkValidity();
	await expect.element(field()).toHaveAttribute('data-invalid');
	await rerender({ required: false });
	await expect.element(field()).not.toHaveAttribute('data-invalid');
	expect(document.querySelector('input[type="hidden"][name="country"]')).toHaveProperty('value', '');
});

test('a required select has no axe violations, closed or open', async () => {
	await render(FormSelectFixture, { required: true });
	expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
	await field().click();
	expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
});

test('a value with no matching option shows the placeholder and is kept', async () => {
	await render(FormSelectFixture, { value: 'zz', placeholder: 'Choose' });
	await expect.element(field()).toHaveTextContent('Choose');
	expect(hiddenInput().value).toBe('zz');
	await field().click();
	await expect.element(page.getByRole('option', { selected: true })).not.toBeInTheDocument();
});

test('the trigger follows a value changed from outside', async () => {
	const { rerender } = await renderField({ value: 'id' });
	await rerender({ value: 'jp' });
	await expect.element(field()).toHaveTextContent('Japan');
});

test('a highlighted option that disappears moves the highlight to the first enabled', async () => {
	const { rerender } = await renderField();
	await field().click();
	await userEvent.keyboard('{End}');
	await rerender({ items: countries().slice(0, 4) });
	await expect.element(option('Indonesia')).toHaveAttribute('data-highlighted');
});

test('disabling the select closes an open list', async () => {
	const { rerender } = await renderField();
	await field().click();
	await rerender({ disabled: true });
	await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
	await expect.element(field()).toBeDisabled();
});

test('with no enabled options it opens with nothing highlighted', async () => {
	await renderField({ items: [{ value: 'x', label: 'X', disabled: true }] });
	await field().click();
	await expect.element(field()).not.toHaveAttribute('aria-activedescendant');
	await userEvent.keyboard('{Escape}');
	await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
});

test('inside a modal dialog, Escape closes only the list', async () => {
	await render(ModalSelectFixture);
	await field().click();
	await userEvent.keyboard('{Escape}');
	await expect.element(page.getByRole('dialog')).toBeVisible();
	await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
});

test('a select, a menu and a date picker on one page close each other and keep unique ids', async () => {
	await render(SelectMenuPickerFixture);
	await field().click();
	await page.getByRole('button', { name: 'Menu' }).click();
	await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
	const ids = [...document.querySelectorAll('[id]')].map(({ id }) => id);
	expect(new Set(ids).size).toBe(ids.length);
});

test('with transition, a click during the leave cannot select again', async () => {
	const style = document.head.appendChild(document.createElement('style'));
	style.textContent = '.fade { transition: opacity 500ms linear; } .fade[data-closed] { opacity: 0; }';
	const onchange = vi.fn();
	await renderField({ transition: true, onchange, classes: { popup: 'fade' } });
	await field().click();
	const popup = document.querySelector<HTMLElement>('[popover]')!;
	await expect.poll(() => popup.hasAttribute('data-enter'), { timeout: 2500 }).toBe(false);
	await option('India').click();
	(option('Japan').element() as HTMLElement).click();
	expect(onchange).toHaveBeenCalledExactlyOnceWith('in');
	style.remove();
});

test('a custom trigger on a non-labelable element opens without errors', async () => {
	await render(CustomTriggerFixture);
	await page.getByTestId('div-trigger').click();
	await expect.element(page.getByRole('listbox')).toBeVisible();
});

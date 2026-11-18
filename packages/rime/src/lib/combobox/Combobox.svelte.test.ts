import axe from 'axe-core';
import { expect, onTestFinished, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DialogComboboxFixture from './fixtures/DialogComboboxFixture.svelte';
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
const status = () => page.getByRole('status');
const listbox = () => page.getByRole('listbox');
const inputElement = () => field().element() as HTMLInputElement;

async function renderInForm(props = {}) {
	const form = document.body.appendChild(document.createElement('form'));
	const onsubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
	form.addEventListener('submit', onsubmit);
	const result = await render(LabelledComboboxFixture, { target: form, props: { all, ...props } });
	return { ...result, onsubmit };
}

async function expectHighlighted(name: string) {
	await expect.element(option(name)).toHaveAttribute('data-highlighted');
	await expect.element(field()).toHaveAttribute('aria-activedescendant', option(name).element().id);
}

async function emptyTheInput() {
	inputElement().focus();
	inputElement().select();
	await userEvent.keyboard('{Backspace}');
	await expect.element(listbox()).toBeVisible();
}

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
	await expect.poll(() => query().element().textContent).toBe('');
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

test('Down on the closed input opens with the selected option highlighted', async () => {
	await renderField({ value: 'Europe/Paris' });
	await field().click();
	await userEvent.keyboard('{ArrowDown}');
	await expectHighlighted('Europe/Paris');
	await userEvent.keyboard('{Escape}');
	await expect.element(listbox()).not.toBeInTheDocument();
	await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
	await expectHighlighted('Europe/Paris');
});

test('each query change highlights the first match', async () => {
	await renderField();
	await field().click();
	await userEvent.keyboard('a');
	await expectHighlighted('Asia/Jakarta');
	await userEvent.keyboard('{ArrowDown}');
	await expectHighlighted('Asia/Jayapura');
	await userEvent.keyboard('y');
	await expect.element(query()).toHaveTextContent('ay');
	await expectHighlighted('Asia/Jayapura');
	expect(option('Asia/Jayapura').element().id).toMatch(/-option-0$/);
});

const bangkok = { value: 'Asia/Bangkok', label: 'Asia/Bangkok' };

test('items arriving late keep a highlight the user moved', async () => {
	const { rerender, unmount } = await renderField();
	await field().click();
	await userEvent.keyboard('asia{ArrowDown}');
	await expectHighlighted('Asia/Jayapura');
	await rerender({ all: [bangkok, ...all] });
	await expect.element(option('Asia/Bangkok')).toBeVisible();
	await expectHighlighted('Asia/Jayapura');
	unmount();

	const second = await renderField();
	await field().click();
	await userEvent.keyboard('asia');
	await expectHighlighted('Asia/Jakarta');
	await second.rerender({ all: [bangkok, ...all] });
	await expectHighlighted('Asia/Bangkok');
});

test('Enter picks the highlighted option', async () => {
	await renderField();
	await field().click();
	await userEvent.keyboard('par{Enter}');
	await expect.element(status()).toHaveTextContent('Europe/Paris');
	await expect.element(listbox()).not.toBeInTheDocument();
});

test('emptying the input highlights nothing, and Enter clears the value', async () => {
	const onchange = vi.fn();
	const { onsubmit } = await renderInForm({ value: 'Europe/Paris', onchange });
	await emptyTheInput();
	expect(document.querySelector('[data-highlighted]')).toBeNull();
	await expect.element(field()).not.toHaveAttribute('aria-activedescendant');
	await userEvent.keyboard('{Enter}');
	await expect.poll(() => status().element().textContent).toBe('');
	expect(onchange).toHaveBeenCalledExactlyOnceWith(null);
	expect(onsubmit).not.toHaveBeenCalled();
});

test('Enter while editing other text restores the label and does not submit', async () => {
	const { onsubmit } = await renderInForm({ value: 'Europe/Paris' });
	await field().fill('zzz');
	await userEvent.keyboard('{Enter}');
	await expect.element(field()).toHaveValue('Europe/Paris');
	await expect.element(status()).toHaveTextContent('Europe/Paris');
	expect(onsubmit).not.toHaveBeenCalled();
});

test('Enter when not editing submits the form', async () => {
	const { onsubmit } = await renderInForm({ value: 'Europe/Paris' });
	await field().click();
	await userEvent.keyboard('{Enter}');
	await expect.poll(() => onsubmit.mock.calls.length).toBe(1);
});

test('Escape closes and restores the selected label', async () => {
	await renderField({ value: 'Europe/Paris' });
	await field().fill('jak');
	await expect.element(listbox()).toBeVisible();
	await userEvent.keyboard('{Escape}');
	await expect.element(listbox()).not.toBeInTheDocument();
	await expect.element(field()).toHaveValue('Europe/Paris');
	await expect.element(status()).toHaveTextContent('Europe/Paris');
	await expect.poll(() => query().element().textContent).toBe('');
});

test('Escape while editing with the list closed keeps a surrounding dialog open', async () => {
	await render(DialogComboboxFixture, { all, value: 'Europe/Paris' });
	await field().fill('zzz');
	await expect.element(query()).toHaveTextContent('zzz');
	await expect.element(listbox()).not.toBeInTheDocument();
	await userEvent.keyboard('{Escape}');
	await expect.element(page.getByTestId('modal')).toBeVisible();
	await expect.element(field()).toHaveValue('Europe/Paris');
	await userEvent.keyboard('{Escape}');
	await expect.element(page.getByTestId('modal')).not.toBeVisible();
});

test('Tab closes without picking and restores the label', async () => {
	await renderField({ value: 'Europe/Paris' });
	// Without a next stop, Firefox tabs out of the page and later tests get no focus events.
	const next = document.body.appendChild(document.createElement('input'));
	onTestFinished(() => next.remove());
	await field().fill('jak');
	await expect.element(listbox()).toBeVisible();
	await userEvent.keyboard('{Tab}');
	await expect.element(listbox()).not.toBeInTheDocument();
	await expect.element(status()).toHaveTextContent('Europe/Paris');
	await expect.element(field()).toHaveValue('Europe/Paris');
	expect(document.activeElement).toBe(next);
});

test('leaving an emptied input clears the value; leaving other text restores the label', async () => {
	const onchange = vi.fn();
	const { unmount } = await renderField({ value: 'Europe/Paris', onchange });
	await emptyTheInput();
	inputElement().blur();
	await expect.poll(() => status().element().textContent).toBe('');
	expect(onchange).toHaveBeenCalledExactlyOnceWith(null);
	await expect.element(field()).toHaveValue('');
	unmount();

	await renderField({ value: 'Europe/Paris', onchange });
	await field().fill('jak');
	inputElement().blur();
	await expect.element(field()).toHaveValue('Europe/Paris');
	await expect.element(status()).toHaveTextContent('Europe/Paris');
	await expect.element(listbox()).not.toBeInTheDocument();
	expect(onchange).toHaveBeenCalledOnce();
});

test('Home and End move the text cursor, not the highlight', async () => {
	await renderField();
	await field().click();
	await userEvent.keyboard('asia{ArrowDown}');
	const prevented: string[] = [];
	const record = (event: KeyboardEvent) => event.defaultPrevented && prevented.push(event.key);
	window.addEventListener('keydown', record);
	await userEvent.keyboard('{Home}');
	await expectHighlighted('Asia/Jayapura');
	await userEvent.keyboard('{End}');
	await expectHighlighted('Asia/Jayapura');
	window.removeEventListener('keydown', record);
	// Left to the browser rather than asserting selectionStart: on macOS, WebKit and Firefox do not
	// move the caret on Home and End at all.
	expect(prevented).toEqual([]);
});

test('IME composition is left alone', async () => {
	await renderField({ value: 'Europe/Paris' });
	await field().fill('jak');
	await expect.element(listbox()).toBeVisible();
	for (const key of ['Enter', 'Escape']) {
		const init = { key, isComposing: true, bubbles: true, cancelable: true };
		const event = new KeyboardEvent('keydown', init);
		inputElement().dispatchEvent(event);
		expect(event.defaultPrevented).toBe(false);
	}
	await expect.element(listbox()).toBeVisible();
	await expect.element(field()).toHaveValue('jak');
	await expect.element(status()).toHaveTextContent('Europe/Paris');
});

test("Safari's composition-ending Enter (keyCode 229) picks nothing", async () => {
	await renderField();
	await field().fill('jak');
	await expectHighlighted('Asia/Jakarta');
	const init = { key: 'Enter', keyCode: 229, isComposing: false, bubbles: true, cancelable: true };
	const event = new KeyboardEvent('keydown', init);
	inputElement().dispatchEvent(event);
	expect(event.keyCode).toBe(229);
	expect(event.defaultPrevented).toBe(false);
	await expect.element(listbox()).toBeVisible();
	await expect.element(field()).toHaveValue('jak');
	expect(status().element().textContent).toBe('');
});

test('a value set from outside while editing does not overwrite the typed text', async () => {
	const { rerender } = await renderField();
	await field().fill('jak');
	await rerender({ value: 'Europe/Paris' });
	await expect.element(status()).toHaveTextContent('Europe/Paris');
	await expect.element(field()).toHaveValue('jak');
	await userEvent.keyboard('{Escape}');
	await expect.element(field()).toHaveValue('Europe/Paris');
});

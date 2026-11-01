import axe from 'axe-core';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DropdownMenu from './DropdownMenu.svelte';
import AllSnippetsFixture from './fixtures/AllSnippetsFixture.svelte';
import MenuAndPickerFixture from './fixtures/MenuAndPickerFixture.svelte';
import MenuInPickerFixture from './fixtures/MenuInPickerFixture.svelte';
import ModalMenuFixture from './fixtures/ModalMenuFixture.svelte';
import TabTargetFixture from './fixtures/TabTargetFixture.svelte';
import type { MenuEntry } from './types.js';

const trigger = () => page.getByRole('button', { name: 'Menu' });
const item = (name: string) => page.getByRole('menuitem', { name });
const focusTrigger = () => (trigger().element() as HTMLElement).focus();
const entries = (): MenuEntry[] => [
	{ label: 'Edit', onselect: vi.fn() },
	{ label: 'Export', disabled: true },
	{ label: 'Email' },
	{ type: 'separator' },
	{ type: 'group', label: 'Danger', items: [{ label: 'Archive' }] }
];

test('roles and labelling match the menu button pattern', async () => {
	await render(DropdownMenu, { items: entries() });
	await expect.element(trigger()).toHaveAttribute('aria-haspopup', 'menu');
	await trigger().click();
	await expect.element(page.getByRole('menu', { name: 'Menu' })).toBeVisible();
	await expect.element(page.getByRole('group', { name: 'Danger' })).toBeVisible();
	await expect.element(page.getByRole('separator')).toBeInTheDocument();
	await expect.element(item('Export')).toHaveAttribute('aria-disabled', 'true');
});

test('selecting closes, returns focus, then calls onselect once', async () => {
	const onselect = vi.fn(() => expect(document.activeElement).toBe(trigger().element()));
	await render(DropdownMenu, { items: [{ label: 'Edit', onselect }] });
	await trigger().click();
	await item('Edit').click();
	expect(onselect).toHaveBeenCalledOnce();
	await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
	await expect.element(trigger()).toHaveFocus();
});

test('a disabled item does nothing and stays open', async () => {
	const onselect = vi.fn();
	await render(DropdownMenu, { items: [{ label: 'Off', disabled: true, onselect }, { label: 'On' }] });
	await trigger().click();
	(item('Off').element() as HTMLElement).click();
	expect(onselect).not.toHaveBeenCalled();
	await expect.element(page.getByRole('menu')).toBeVisible();
});

test('a link renders an anchor, and a disabled link has no href', async () => {
	await render(DropdownMenu, {
		items: [
			{ label: 'Docs', href: '#docs', target: '_self', rel: 'help' },
			{ label: 'Off', href: '#off', disabled: true }
		]
	});
	await trigger().click();
	await expect.element(item('Docs')).toHaveAttribute('href', '#docs');
	await expect.element(item('Docs')).toHaveAttribute('rel', 'help');
	await expect.element(item('Off')).not.toHaveAttribute('href');
});

test.each([
	['{Enter}', 'Edit'],
	[' ', 'Edit'],
	['{ArrowDown}', 'Edit'],
	['{ArrowUp}', 'Archive']
])('%s on the trigger opens on %s', async (key, expected) => {
	await render(DropdownMenu, { items: entries() });
	focusTrigger();
	await userEvent.keyboard(key);
	await expect.element(item(expected)).toHaveFocus();
});

test('arrows skip disabled items and wrap, and Home and End jump', async () => {
	await render(DropdownMenu, { items: entries() });
	focusTrigger();
	await userEvent.keyboard('{Enter}');
	await expect.element(item('Edit')).toHaveFocus();
	await userEvent.keyboard('{ArrowDown}');
	await expect.element(item('Email')).toHaveFocus();
	await userEvent.keyboard('{End}{ArrowDown}');
	await expect.element(item('Edit')).toHaveFocus();
	await userEvent.keyboard('{ArrowUp}');
	await expect.element(item('Archive')).toHaveFocus();
	await userEvent.keyboard('{Home}');
	await expect.element(item('Edit')).toHaveFocus();
});

test('typeahead jumps, resets after 500 ms, and Space joins typed text', async () => {
	await render(DropdownMenu, { items: [{ label: 'New file' }, { label: 'New tab' }, { label: 'Open' }] });
	focusTrigger();
	await userEvent.keyboard('{Enter}');
	await expect.element(item('New file')).toHaveFocus();
	await userEvent.keyboard('new t');
	await expect.element(item('New tab')).toHaveFocus();
	await expect.element(page.getByRole('menu')).toBeVisible();
	await new Promise((resolve) => setTimeout(resolve, 600));
	await userEvent.keyboard('o');
	await expect.element(item('Open')).toHaveFocus();
});

test.each([['{Enter}'], [' ']])('%s activates the current item once', async (key) => {
	const onselect = vi.fn();
	await render(DropdownMenu, { items: [{ label: 'Edit', onselect }] });
	focusTrigger();
	await userEvent.keyboard('{Enter}');
	await expect.element(item('Edit')).toHaveFocus();
	await userEvent.keyboard(key);
	await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
	expect(onselect).toHaveBeenCalledOnce();
});

test('Space activates a link', async () => {
	await render(DropdownMenu, { items: [{ label: 'Docs', href: '#rime-docs' }] });
	focusTrigger();
	await userEvent.keyboard('{Enter}');
	await expect.element(item('Docs')).toHaveFocus();
	await userEvent.keyboard(' ');
	await expect.poll(() => location.hash).toBe('#rime-docs');
	location.hash = '';
});

test('hover moves focus to enabled items only', async () => {
	await render(DropdownMenu, { items: entries() });
	await trigger().click();
	await item('Email').hover();
	await expect.element(item('Email')).toHaveFocus();
	await item('Export').hover();
	await expect.element(item('Email')).toHaveFocus();
});

test('Escape closes and returns focus', async () => {
	await render(DropdownMenu, { items: entries() });
	await trigger().click();
	await expect.element(item('Edit')).toHaveFocus();
	await userEvent.keyboard('{Escape}');
	await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
	await expect.element(trigger()).toHaveFocus();
});

test('Tab closes the menu and lets focus move on', async () => {
	await render(TabTargetFixture);
	await trigger().click();
	await expect.element(item('Edit')).toHaveFocus();
	await userEvent.tab();
	await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
	await expect.element(page.getByRole('textbox', { name: 'After' })).toHaveFocus();
});

test('Tab closes the menu even with nothing focusable after it', async () => {
	await render(DropdownMenu, { items: [{ label: 'Edit' }] });
	await trigger().click();
	await expect.element(item('Edit')).toHaveFocus();
	await userEvent.tab();
	await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
});

test('disabling an open menu closes it', async () => {
	const { rerender } = await render(DropdownMenu, { items: entries() });
	await trigger().click();
	await rerender({ disabled: true });
	await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
});

test('the focused item disappearing moves focus to the first enabled item', async () => {
	const { rerender } = await render(DropdownMenu, { items: [{ label: 'A' }, { label: 'B' }] });
	await trigger().click();
	await item('B').hover();
	await expect.element(item('B')).toHaveFocus();
	await rerender({ items: [{ label: 'A' }] });
	await expect.element(item('A')).toHaveFocus();
});

test('the focused item becoming disabled moves focus', async () => {
	const { rerender } = await render(DropdownMenu, { items: [{ label: 'A' }, { label: 'B' }] });
	await trigger().click();
	await item('B').hover();
	await expect.element(item('B')).toHaveFocus();
	await rerender({ items: [{ label: 'A' }, { label: 'B', disabled: true }] });
	await expect.element(item('A')).toHaveFocus();
});

test.each([[[]], [[{ label: 'Off', disabled: true }]]])('with nothing enabled, focus is on the menu and Escape closes', async (items) => {
	await render(DropdownMenu, { items });
	await trigger().click();
	await expect.element(page.getByRole('menu')).toHaveFocus();
	await userEvent.keyboard('{Escape}');
	await expect.element(trigger()).toHaveFocus();
});

test('inside a modal dialog, Escape closes only the menu', async () => {
	await render(ModalMenuFixture);
	await trigger().click();
	await expect.element(item('Edit')).toHaveFocus();
	await userEvent.keyboard('{Escape}');
	await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
	await expect.element(page.getByTestId('modal')).toBeVisible();
});

test('a menu and a date picker close each other and keep unique ids', async () => {
	await render(MenuAndPickerFixture);
	await trigger().click();
	await expect.element(page.getByRole('menu')).toBeVisible();
	const popupId = () => document.querySelector('[popover]')!.id;
	const duplicates = () => {
		const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
		return ids.filter((id, index) => ids.indexOf(id) !== index);
	};
	const menuPopupId = popupId();
	expect(duplicates()).toEqual([]);
	await page.getByRole('button', { name: 'Oct 15, 2026' }).click();
	await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
	await expect.element(page.getByRole('dialog')).toBeVisible();
	expect(duplicates()).toEqual([]);
	expect(popupId()).not.toBe(menuPopupId);
	await trigger().click();
	await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
});

test('with transition, the leaving menu is inert and onselect fires once', async () => {
	const style = document.head.appendChild(document.createElement('style'));
	style.textContent = '.fade { transition: opacity 500ms linear; } .fade[data-closed] { opacity: 0; }';
	const onselect = vi.fn();
	await render(DropdownMenu, { items: [{ label: 'Edit', onselect }], transition: true, classes: { popup: 'fade' } });
	await trigger().click();
	await expect.element(item('Edit')).toHaveFocus();
	const popup = document.querySelector<HTMLElement>('[popover]')!;
	await expect.poll(() => popup.hasAttribute('data-enter'), { timeout: 2500 }).toBe(false);
	await item('Edit').click();
	expect(popup.inert).toBe(true);
	popup.querySelector<HTMLElement>('[role=menuitem]')!.click();
	expect(onselect).toHaveBeenCalledOnce();
	style.remove();
});

test('snippets replace trigger, popup, item, separator and group label', async () => {
	await render(AllSnippetsFixture);
	await page.getByTestId('custom-trigger').click();
	for (const id of ['custom-popup', 'custom-item', 'custom-separator', 'custom-group-label']) {
		await expect.element(page.getByTestId(id).first()).toBeVisible();
	}
	await expect.element(page.getByTestId('custom-item').first()).toHaveTextContent('★ Edit');
});

test('default elements take classes and state attributes', async () => {
	await render(DropdownMenu, { items: entries(), classes: { item: 'my-item', popup: 'my-popup', trigger: 'my-trigger' } });
	await expect.element(trigger()).toHaveClass('my-trigger');
	await trigger().click();
	await expect.element(trigger()).toHaveAttribute('data-open');
	await expect.element(page.getByRole('menu')).toHaveClass('my-popup');
	await expect.element(item('Edit')).toHaveClass('my-item');
	await expect.element(item('Export')).toHaveAttribute('data-disabled');
	await item('Email').hover();
	await expect.element(item('Email')).toHaveAttribute('data-hover');
});

// The bare test page has no landmarks, so the page-level region rule says nothing about the menu.
const axeOptions = { rules: { region: { enabled: false } } };

test('open and closed menus have no axe violations', async () => {
	await render(DropdownMenu, { items: entries() });
	expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
	await trigger().click();
	await expect.element(page.getByRole('menu')).toBeVisible();
	expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
});

test('a parked pointer does not take focus when the menu reopens', async () => {
	await render(DropdownMenu, { items: [{ label: 'A' }, { label: 'B' }, { label: 'C' }] });
	await trigger().click();
	await item('C').hover();
	await expect.element(item('C')).toHaveFocus();
	await userEvent.keyboard('{Escape}');
	await expect.element(trigger()).toHaveFocus();
	await userEvent.keyboard('{Enter}');
	await expect.element(item('A')).toHaveFocus();
});

test('scrolling a long menu under a parked pointer does not move focus backwards', async () => {
	const style = document.head.appendChild(document.createElement('style'));
	style.textContent = '.scrolling { max-height: 150px; overflow-y: auto; } .scrolling [role=menuitem] { display: block; width: 100%; height: 30px; }';
	const items = Array.from({ length: 30 }, (_, index) => ({ label: `Item ${index + 1}` }));
	await render(DropdownMenu, { items, classes: { popup: 'scrolling' } });
	await trigger().click();
	await item('Item 1').hover();
	for (let step = 2; step <= 16; step++) {
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(page.getByRole('menuitem', { name: `Item ${step}`, exact: true })).toHaveFocus();
	}
	style.remove();
});

const focusOn = async (name: string) => {
	await trigger().click();
	await item(name).hover();
	await expect.element(item(name)).toHaveFocus();
};

test('focus stays on the same item when items are reordered, so Enter runs that item', async () => {
	const edit = { label: 'Edit', onselect: vi.fn() };
	const remove = { label: 'Delete', onselect: vi.fn() };
	const { rerender } = await render(DropdownMenu, { items: [edit, { label: 'Other' }] });
	await focusOn('Edit');
	await rerender({ items: [remove, edit, { label: 'Other' }] });
	await expect.element(item('Edit')).toHaveFocus();
	await userEvent.keyboard('{Enter}');
	expect(edit.onselect).toHaveBeenCalledOnce();
	expect(remove.onselect).not.toHaveBeenCalled();
});

test('removing the focused middle item moves focus to the first enabled item', async () => {
	const [a, b, c] = [{ label: 'A' }, { label: 'B' }, { label: 'C' }];
	const { rerender } = await render(DropdownMenu, { items: [a, b, c] });
	await focusOn('B');
	await rerender({ items: [a, c] });
	await expect.element(item('A')).toHaveFocus();
});

test('removing an earlier item keeps focus on the focused item', async () => {
	const [a, b, c] = [{ label: 'A' }, { label: 'B' }, { label: 'C' }];
	const { rerender } = await render(DropdownMenu, { items: [a, b, c] });
	await focusOn('C');
	await rerender({ items: [b, c] });
	await expect.element(item('C')).toHaveFocus();
});

test('new objects with the same labels keep focus on the matching item', async () => {
	const { rerender } = await render(DropdownMenu, { items: [{ label: 'A' }, { label: 'B' }, { label: 'C' }] });
	await focusOn('C');
	await rerender({ items: [{ label: 'B' }, { label: 'C' }] });
	await expect.element(item('C')).toHaveFocus();
});

test('disabling the focused item in place moves focus', async () => {
	const items = $state([{ label: 'A', disabled: false }, { label: 'B', disabled: false }]);
	await render(DropdownMenu, { items });
	await focusOn('B');
	items[1].disabled = true;
	await expect.element(item('A')).toHaveFocus();
});

test.each([
	['{Enter>6/}', 'Enter'],
	['[Space>6/]', 'Space']
])('holding %s on the trigger opens the menu and selects nothing', async (keys) => {
	const onselect = vi.fn();
	await render(DropdownMenu, { items: [{ label: 'Edit', onselect }] });
	focusTrigger();
	await userEvent.keyboard(keys);
	await expect.element(item('Edit')).toHaveFocus();
	expect(onselect).not.toHaveBeenCalled();
});

test('Space on an empty menu does not scroll the page', async () => {
	await render(DropdownMenu, { items: [] });
	await trigger().click();
	await expect.element(page.getByRole('menu')).toHaveFocus();
	let spaceEvent: KeyboardEvent | undefined;
	const record = (event: KeyboardEvent) => (spaceEvent = event);
	window.addEventListener('keydown', record);
	await userEvent.keyboard(' ');
	window.removeEventListener('keydown', record);
	expect(spaceEvent?.defaultPrevented).toBe(true);
});

test('pressing a disabled item cancels the focus change', async () => {
	await render(DropdownMenu, { items: [{ label: 'Off', disabled: true }, { label: 'On' }] });
	await trigger().click();
	await expect.element(item('On')).toHaveFocus();
	const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
	item('Off').element().dispatchEvent(press);
	expect(press.defaultPrevented).toBe(true);
});

test('the same object listed twice is two separate stops', async () => {
	const repeated = { label: 'Copy' };
	const copies = page.getByRole('menuitem', { name: 'Copy' });
	await render(DropdownMenu, { items: [repeated, { label: 'Move' }, repeated] });
	focusTrigger();
	await userEvent.keyboard('{Enter}');
	await expect.element(copies.nth(0)).toHaveFocus();
	await userEvent.keyboard('{ArrowDown}{ArrowDown}');
	await expect.element(copies.nth(1)).toHaveFocus();
});

test('a list update keeps focus on the second copy of a repeated object', async () => {
	const repeated = { label: 'Copy' };
	const move = { label: 'Move' };
	const copies = page.getByRole('menuitem', { name: 'Copy' });
	const { rerender } = await render(DropdownMenu, { items: [repeated, move, repeated] });
	await trigger().click();
	await userEvent.keyboard('{End}');
	await expect.element(copies.nth(1)).toHaveFocus();
	await rerender({ items: [repeated, move, repeated] });
	await expect.element(copies.nth(1)).toHaveFocus();
});

test('recreating the list keeps focus on the second of two items with the same label', async () => {
	const list = () => [{ label: 'Copy' }, { label: 'Move' }, { label: 'Copy' }];
	const copies = page.getByRole('menuitem', { name: 'Copy' });
	const { rerender } = await render(DropdownMenu, { items: list() });
	await trigger().click();
	await userEvent.keyboard('{End}');
	await expect.element(copies.nth(1)).toHaveFocus();
	await rerender({ items: list() });
	await expect.element(copies.nth(1)).toHaveFocus();
});

test('a pointer returning to the same pixel moves focus', async () => {
	await render(DropdownMenu, { items: [{ label: 'A' }, { label: 'B' }] });
	await trigger().click();
	await item('A').hover();
	await userEvent.keyboard('{ArrowDown}');
	await expect.element(item('B')).toHaveFocus();
	await trigger().hover();
	await item('A').hover();
	await expect.element(item('A')).toHaveFocus();
});

test('a menu inside a date picker popup closes alone on the first Escape', async () => {
	await render(MenuInPickerFixture);
	await page.getByRole('button', { name: /2026/ }).click();
	await expect.element(page.getByRole('dialog')).toBeVisible();
	await trigger().click();
	await expect.element(item('Edit')).toHaveFocus();
	await userEvent.keyboard('{Escape}');
	await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
	await expect.element(page.getByRole('dialog')).toBeVisible();
	await expect.element(trigger()).toHaveFocus();
	await userEvent.keyboard('{Escape}');
	await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
});

test('item clicks bubble to ancestors, as native clicks do', async () => {
	const onAncestorClick = vi.fn();
	const { container } = await render(DropdownMenu, { items: [{ label: 'Edit' }] });
	container.addEventListener('click', onAncestorClick);
	await trigger().click();
	onAncestorClick.mockClear();
	await item('Edit').click();
	expect(onAncestorClick).toHaveBeenCalledOnce();
});

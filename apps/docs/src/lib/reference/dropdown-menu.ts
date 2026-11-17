import type { DropdownMenuProps } from '@frostycle/rime/dropdown-menu';
import type { ComponentReference } from './types.js';

export const dropdownMenu: ComponentReference<DropdownMenuProps> = {
	props: {
		items: {
			type: '(T | MenuSeparator | MenuGroup<T>)[]',
			notes:
				'Required. T extends MenuItem, so extra fields such as an icon flow into the item snippet.'
		},
		label: { type: 'string', default: 'Menu', notes: 'Text of the default trigger.' },
		placement: {
			type: 'Placement',
			default: 'bottom-start',
			notes: 'From @floating-ui/dom.'
		},
		disabled: {
			type: 'boolean',
			notes: 'Disables the trigger, and closes the menu if it is open.'
		},
		transition: {
			type: 'boolean',
			notes: 'Keeps the popup mounted through its CSS transition, as on the date pickers.'
		},
		classes: {
			type: '{ trigger, popup, item, separator, group, groupLabel }',
			notes: 'Classes for default-rendered elements.'
		},
		trigger: { args: 'props, open' },
		popup: { args: 'props, content', notes: 'Render content for the default body.' },
		item: {
			args: 'item, props, disabled',
			notes: 'Spread props onto a <button>, or an <a> when item.href is set.'
		},
		separator: { args: 'props' },
		groupLabel: { args: 'label, props' }
	},
	keyboard: [
		{ keys: 'Enter, Space, Down on the trigger', action: 'Open and focus the first enabled item' },
		{ keys: 'Up on the trigger', action: 'Open and focus the last enabled item' },
		{ keys: 'Down, Up', action: 'Move between enabled items, wrapping at the ends' },
		{ keys: 'Home, End', action: 'Go to the first or last enabled item' },
		{
			keys: 'Printable characters',
			action: 'Jump to the next enabled item starting with what was typed'
		},
		{ keys: 'Enter, Space', action: 'Activate the current item' },
		{ keys: 'Escape', action: 'Close and return focus to the trigger' },
		{ keys: 'Tab', action: 'Close and let focus move on' }
	],
	attributes: [
		{ element: 'Trigger', attributes: 'data-open, data-disabled, data-hover, data-focus, data-active' },
		{
			element: 'Popup',
			attributes: 'data-open, plus data-closed, data-enter and data-leave with transition'
		},
		{ element: 'Item', attributes: 'data-disabled, data-hover, data-focus, data-active' }
	]
};

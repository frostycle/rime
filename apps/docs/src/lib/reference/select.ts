import type { SelectProps } from '@frostycle/rime/select';
import type { ComponentReference } from './types.js';

export const select: ComponentReference<SelectProps> = {
	props: {
		items: {
			type: '(T | SelectSeparator | SelectGroup<T>)[]',
			notes:
				'Required. T extends SelectOption, so extra fields such as an icon flow into the option snippet.'
		},
		value: {
			type: 'string | null',
			default: 'null',
			notes: 'Bindable. null means nothing is selected.'
		},
		onchange: {
			type: '(value: string | null) => void',
			notes: 'Called when the user picks a different value.'
		},
		id: {
			type: 'string',
			default: 'a generated id',
			notes: "The trigger's id, so <label for> names the field."
		},
		name: {
			type: 'string',
			notes: 'Renders a hidden input carrying the value, empty when null.'
		},
		placeholder: { type: 'string', notes: 'Trigger text while the value is null.' },
		placement: {
			type: 'Placement',
			default: 'bottom-start',
			notes: 'From @floating-ui/dom.'
		},
		disabled: {
			type: 'boolean',
			notes: 'Disables the trigger, closes the list if it is open, and renders no hidden input.'
		},
		transition: {
			type: 'boolean',
			default: 'false',
			notes: 'Keeps the popup mounted through its CSS transition, as on the date pickers.'
		},
		classes: {
			type: '{ trigger, popup, option, separator, group, groupLabel }',
			notes: 'Classes for default-rendered elements.'
		},
		trigger: { args: 'props, open, selected', notes: 'selected is the selected option, or null.' },
		popup: { args: 'props, content', notes: 'Render content for the default body.' },
		option: { args: 'option, props, selected, highlighted, disabled' },
		separator: {
			args: 'props',
			notes: 'Renders with role="none" inside the list, since a listbox may contain only options and groups.'
		},
		groupLabel: { args: 'label, props' }
	},
	keyboard: [
		{ keys: 'Enter, Space, Down, Up on the trigger', action: 'Open the list' },
		{
			keys: 'Home, End on the trigger',
			action: 'Open with the first or last enabled option highlighted'
		},
		{
			keys: 'Printable characters on the trigger',
			action: 'Open at the first matching enabled option'
		},
		{ keys: 'Down, Up', action: 'Move between enabled options, stopping at the ends' },
		{ keys: 'Home, End', action: 'Go to the first or last enabled option' },
		{ keys: 'Page Down, Page Up', action: 'Move ten enabled options' },
		{
			keys: 'Printable characters',
			action:
				'Jump to the next enabled option starting with what was typed. Typed text resets after 500 ms, repeating one character cycles through matches, and Space counts as typed text while it is being collected'
		},
		{ keys: 'Enter, Space', action: 'Select the highlighted option and close' },
		{ keys: 'Tab', action: 'Select the highlighted option, close, and let focus move on' },
		{ keys: 'Escape', action: 'Close without changing the value' }
	],
	attributes: [
		{
			element: 'Trigger',
			attributes: 'data-open, data-disabled, data-placeholder, data-hover, data-focus, data-active'
		},
		{
			element: 'Popup',
			attributes: 'data-open, plus data-closed, data-enter and data-leave with transition'
		},
		{ element: 'Option', attributes: 'data-highlighted, data-selected, data-disabled' }
	]
};

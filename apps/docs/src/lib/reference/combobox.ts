import type { ComboboxProps } from '@frostycle/rime/combobox';
import type { ComponentReference } from './types.js';

export const combobox: ComponentReference<ComboboxProps> = {
	props: {
		items: {
			type: '(T | ComboboxSeparator | ComboboxGroup<T>)[]',
			notes:
				'Required. The options to show now, already filtered by you. T extends ComboboxOption, so extra fields such as an icon flow into the option snippet. Same shape as Select.'
		},
		value: {
			type: 'string | null',
			default: 'null',
			notes: 'Bindable. null means nothing is selected.'
		},
		query: {
			type: 'string',
			default: "''",
			notes: "Bindable. The text being typed; '' while the user is not editing."
		},
		onchange: {
			type: '(value: string | null) => void',
			notes: 'Called when the user picks a different value or clears the field.'
		},
		id: {
			type: 'string',
			default: 'a generated id',
			notes: "The input's id, so <label for> names the field."
		},
		name: {
			type: 'string',
			notes:
				'Renders a hidden input carrying the value, empty when null. The text input has no name, so typed text is never submitted. A pick or clear fires bubbling input and change events from the hidden input.'
		},
		placeholder: { type: 'string', notes: "The input's placeholder." },
		placement: {
			type: 'Placement',
			default: 'bottom-start',
			notes: 'From @floating-ui/dom.'
		},
		disabled: {
			type: 'boolean',
			notes: 'Disables the input, closes the list if it is open, and renders no hidden input.'
		},
		transition: {
			type: 'boolean',
			default: 'false',
			notes: 'Keeps the popup mounted through its CSS transition, as on the date pickers.'
		},
		classes: {
			type: '{ input, popup, option, separator, group, groupLabel }',
			notes:
				'Classes for default-rendered elements. The toggle button exists only through the button snippet, so it has no class entry.'
		},
		input: {
			args: 'props, open, selected',
			notes: 'Replaces the default <input>; spread props on an <input>. selected is the selected option, or null.'
		},
		button: {
			args: 'props, open',
			notes:
				'A toggle button rendered after the input. There is none without this snippet. It has tabindex="-1" and aria-hidden="true", and pressing it keeps focus in the input.'
		},
		popup: { args: 'props, content', notes: 'Render content for the default body.' },
		option: { args: 'option, props, selected, highlighted, disabled' },
		separator: {
			args: 'props',
			notes: 'Renders with role="none" inside the list, since a listbox may contain only options and groups.'
		},
		groupLabel: { args: 'label, props' },
		empty: {
			args: 'query',
			notes:
				'Shown in the open list when items has no options. Without it, the list stays closed when there is nothing to show.'
		}
	},
	keyboard: [
		{ keys: 'Typing, Backspace, paste', action: 'Edit the text, filter through query, and open the list' },
		{ keys: 'Down, Up, Alt+Down on the closed input', action: 'Open the list' },
		{ keys: 'Down, Up', action: 'Move between enabled options, stopping at the ends' },
		{ keys: 'Page Down, Page Up', action: 'Move ten enabled options' },
		{
			keys: 'Enter',
			action:
				'With an option highlighted, pick it and close. While editing with nothing highlighted, an empty input clears the value and other text restores the selected label; the form is not submitted. When not editing, submits the form as in any text field'
		},
		{
			keys: 'Escape',
			action:
				'While editing: close the list, restore the selected label, and stop the event so a surrounding <dialog> stays open. When not editing, the <dialog> handles it'
		},
		{ keys: 'Tab', action: 'Close without picking and let focus move on; the text returns to the selected label' },
		{ keys: 'Home, End, Left, Right', action: 'Move the caret, as in any input. There is no type-ahead' }
	],
	attributes: [
		{
			element: 'Input',
			attributes: 'data-open, data-disabled, data-hover, data-focus, data-active'
		},
		{ element: 'Button', attributes: 'data-open, data-disabled, data-hover, data-active' },
		{
			element: 'Popup',
			attributes: 'data-open, plus data-closed, data-enter and data-leave with transition'
		},
		{ element: 'Option', attributes: 'data-highlighted, data-selected, data-disabled' }
	]
};

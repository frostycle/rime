import type { DatePickerProps, DateRangePickerProps } from '@frostycle/rime/date-picker';
import type { ComponentReference } from './types.js';

const triggerAttributes = 'data-open, data-disabled, data-invalid, data-hover, data-focus, data-active';

export const datePickers: ComponentReference<DatePickerProps & DateRangePickerProps> = {
	props: {
		value: {
			type: 'string | null, or { start, end } | null',
			notes: 'Bindable. Malformed values and reversed ranges throw.',
			appliesTo: 'both'
		},
		onchange: {
			type: '(value) => void',
			notes: 'Fires on user commits and clear, not when the parent sets value.',
			appliesTo: 'both'
		},
		min: { type: 'string', notes: 'Inclusive.', appliesTo: 'both' },
		max: { type: 'string', notes: 'Inclusive.', appliesTo: 'both' },
		isDateDisabled: {
			type: '(date: string) => boolean',
			notes: 'A range may span disabled dates; only its endpoints are checked.',
			appliesTo: 'both'
		},
		minDays: { type: 'number', notes: 'Length counting both endpoints.', appliesTo: 'range' },
		maxDays: { type: 'number', notes: 'Length counting both endpoints.', appliesTo: 'range' },
		months: { type: 'number', default: '1', notes: '', appliesTo: 'both' },
		presets: {
			type: '{ label, value: () => V }[]',
			notes: 'Commit on click. Disabled when the result breaks the constraints.',
			appliesTo: 'both'
		},
		locale: { type: 'string', default: 'en-US', notes: '', appliesTo: 'both' },
		weekStartsOn: {
			type: '0 to 6',
			default: 'from the locale, otherwise Sunday',
			notes: '',
			appliesTo: 'both'
		},
		labels: {
			type: '{ previousMonth, nextMonth, dialog, inRange }',
			notes:
				'Accessible names. dialog also labels the default trigger when empty; inRange is appended to the name of days inside a range.',
			appliesTo: 'both'
		},
		disabled: { type: 'boolean', notes: 'Renders no hidden inputs.', appliesTo: 'both' },
		required: {
			type: 'boolean',
			default: 'false',
			notes:
				"Blocks form submit while no date or range is chosen, with the browser's own message. Adds aria-invalid and data-invalid to the trigger once a validity check fails: a blocked submit, or a checkValidity() or reportValidity() call. A range counts as chosen only once both ends are. The trigger is a button, which cannot carry aria-required, so say in its label that the field is required.",
			appliesTo: 'both'
		},
		transition: {
			type: 'boolean',
			default: 'false',
			notes: 'Keeps the popup mounted through its CSS transition.',
			appliesTo: 'both'
		},
		name: { type: 'string', notes: 'Renders a hidden input. A pick or clear that changes an input fires bubbling input then change from it.', appliesTo: 'single' },
		startName: {
			type: 'string',
			notes: 'Renders two hidden inputs with endName, for ?from=…&to=… filter forms. A pick or clear that changes an input fires bubbling input then change from it.',
			appliesTo: 'range'
		},
		endName: {
			type: 'string',
			notes: 'Renders two hidden inputs with startName, for ?from=…&to=… filter forms. A pick or clear that changes an input fires bubbling input then change from it.',
			appliesTo: 'range'
		},
		classes: {
			type: '{ trigger, popup, body, month, header, title, nav, grid, weekday, cell, day, presets, preset }',
			notes: 'Classes for default-rendered elements.',
			appliesTo: 'both'
		},
		trigger: { args: 'props, label, value, open, clear' },
		popup: { args: 'props, content', notes: 'Render content for the default body.' },
		header: {
			args: 'title, titleProps, previousProps, nextProps',
			notes:
				'Rendered per month. previousProps is null except on the first month, nextProps except on the last.'
		},
		grid: {
			args: 'month, weekdays, weeks, props, renderDay',
			notes:
				'Rendered per month. weeks holds null outside that month. Call {@render renderDay(date)} for each date.'
		},
		day: {
			args: 'date, dayNumber, props, selected, inRange, rangeStart, rangeEnd, preview, isToday, disabled',
			notes: 'Spread props onto a <button>: Enter and Space rely on its native click.'
		},
		presetList: { args: 'presets, select', notes: 'Each preset carries disabled.' }
	},
	keyboard: [
		{
			keys: 'Left, Right',
			action: 'Previous or next day. Reversed in right-to-left layouts'
		},
		{ keys: 'Up, Down', action: 'Same weekday in the previous or next week' },
		{ keys: 'Home, End', action: 'First or last day of the week' },
		{ keys: 'PageUp, PageDown', action: 'Same date in the previous or next month' },
		{ keys: 'Shift + PageUp, PageDown', action: 'Same date in the previous or next year' },
		{ keys: 'Enter, Space', action: 'Pick the focused day' },
		{ keys: 'Escape', action: 'Close and return focus to the trigger' },
		{ keys: 'Tab', action: 'Move through the popup. Moving focus out of it closes it' }
	],
	attributes: [
		{ element: 'Trigger', attributes: triggerAttributes },
		{
			element: 'Popup',
			attributes: 'data-open, plus data-closed, data-enter and data-leave with transition'
		},
		{
			element: 'Day',
			attributes:
				'data-selected, data-in-range, data-range-start, data-range-end, data-preview, data-today, data-disabled, data-hover, data-focus, data-active'
		},
		{
			element: 'Previous, next, default presets',
			attributes: 'data-hover, data-focus, data-active'
		}
	]
};

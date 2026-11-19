import type { NativeSelectProps } from '@frostycle/rime/select';
import type { ComponentReference } from './types.js';

export const nativeSelect: ComponentReference<NativeSelectProps> = {
	props: {
		items: {
			type: '(T | SelectSeparator | SelectGroup<T>)[]',
			notes:
				"Required. The same data as Select. Groups render as <optgroup>, separators as <hr>, and a group with no options is left out."
		},
		value: {
			type: 'string | null',
			default: 'null',
			notes:
				'Bindable. null shows the placeholder. A value with no matching option shows an empty field and still submits.'
		},
		onchange: {
			type: '(value: string | null) => void',
			notes: 'Called when the user picks a different value. Not called when the parent sets value.'
		},
		id: {
			type: 'string',
			default: 'a generated id',
			notes: "The select's id, so <label for> names the field."
		},
		name: {
			type: 'string',
			notes:
				'Renders a hidden input carrying the value, empty when null, exactly as Select does. The select itself has no name. A pick that changes the value fires bubbling input and change events from the hidden input.'
		},
		placeholder: {
			type: 'string',
			notes: 'Text of the empty first option, shown while the value is null. It cannot be picked.'
		},
		disabled: { type: 'boolean', default: 'false', notes: 'Disables the select and renders no hidden input.' },
		required: {
			type: 'boolean',
			default: 'false',
			notes:
				"Native required: the browser blocks submit while the value is null or '', with its own message on the select. Adds aria-invalid and data-invalid once a validity check fails."
		},
		classes: { type: '{ select }', notes: 'Classes for the select element.' }
	},
	keyboard: [],
	attributes: [{ element: 'Select', attributes: 'data-focus, data-hover, data-active, data-disabled, data-invalid' }]
};

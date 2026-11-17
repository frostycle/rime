import { render } from 'svelte/server';
import { expect, test } from 'vitest';
import Select from './Select.svelte';

test('the server renders the trigger with its label and the hidden input only', () => {
	const { body } = render(Select, {
		props: { items: [{ value: 'id', label: 'Indonesia' }], value: 'id', name: 'country' }
	});
	expect(body).toContain('role="combobox"');
	expect(body).toContain('Indonesia');
	expect(body).toContain('name="country"');
	expect(body).not.toContain('role="listbox"');
});

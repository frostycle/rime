import { render } from 'svelte/server';
import { expect, test } from 'vitest';
import Combobox from './Combobox.svelte';

test('the server renders the input with the selected label and the hidden input', () => {
	const { body } = render(Combobox, {
		props: { items: [{ value: 'id', label: 'Indonesia' }], value: 'id', name: 'country' }
	});
	expect(body).toContain('role="combobox"');
	expect(body).toContain('value="Indonesia"');
	expect(body).toContain('name="country"');
	expect(body).not.toContain('role="listbox"');
});

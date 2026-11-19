import { render } from 'svelte/server';
import { expect, test } from 'vitest';
import NativeSelect from './NativeSelect.svelte';

test('the server renders the selected option and the hidden input', () => {
	const { body } = render(NativeSelect, {
		props: {
			items: [
				{ value: 'id', label: 'Indonesia' },
				{ value: 'jp', label: 'Japan' }
			],
			value: 'jp',
			name: 'country'
		}
	});
	expect(body.match(/name="country"/g)).toHaveLength(1);
	expect(body).toMatch(/<option value="jp"[^>]*selected[^>]*>Japan<\/option>/);
});

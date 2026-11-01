import { render } from 'svelte/server';
import { expect, test } from 'vitest';
import DropdownMenu from './DropdownMenu.svelte';

test('the server renders only the trigger', () => {
	const { body } = render(DropdownMenu, { props: { items: [{ label: 'Edit' }] } });
	expect(body).toContain('aria-haspopup="menu"');
	expect(body).not.toContain('role="menu"');
	expect(body).not.toContain('Edit');
});

import { describe, expect, it } from 'vitest';
import { Listbox } from './listbox.svelte.js';

const options = [
	{ value: 'a', label: 'Apple' },
	{ value: 'b', label: 'Banana' },
	{ value: 'c', label: 'Cherry' }
];

describe('Listbox', () => {
	it('with textInput, Home, End and letters are left to the input', () => {
		const listbox = new Listbox(() => options, { textInput: true });
		listbox.highlightFirst();
		for (const key of ['Home', 'End', 'a']) {
			const event = new KeyboardEvent('keydown', { key, cancelable: true });
			expect(listbox.navigate(event)).toBe(false);
			expect(event.defaultPrevented).toBe(false);
			expect(listbox.highlighted).toBe(0);
		}
		expect(listbox.navigate(new KeyboardEvent('keydown', { key: 'ArrowDown' }))).toBe(true);
		expect(listbox.highlighted).toBe(1);
	});

	it('clearHighlight leaves nothing highlighted', () => {
		const listbox = new Listbox(() => options);
		listbox.highlightFirst();
		listbox.clearHighlight();
		expect(listbox.highlighted).toBe(-1);
	});
});

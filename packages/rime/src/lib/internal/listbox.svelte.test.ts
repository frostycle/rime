import { describe, expect, it } from 'vitest';
import { Listbox } from './listbox.svelte.js';

const options = [
	{ value: 'a', label: 'Apple' },
	{ value: 'b', label: 'Banana' },
	{ value: 'c', label: 'Cherry' }
];

describe('Listbox', () => {
	it.each(['Home', 'End', 'a'])('with textInput, %s is left to the input', (key) => {
		const listbox = new Listbox(() => options, { textInput: true });
		listbox.highlightFirst();
		const event = new KeyboardEvent('keydown', { key, cancelable: true });
		expect(listbox.navigate(event)).toBe(false);
		expect(event.defaultPrevented).toBe(false);
		expect(listbox.highlighted).toBe(0);
	});

	it('with textInput, arrow keys still move the highlight', () => {
		const listbox = new Listbox(() => options, { textInput: true });
		listbox.highlightFirst();
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

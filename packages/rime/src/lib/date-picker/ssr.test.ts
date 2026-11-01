import { render } from 'svelte/server';
import { expect, test } from 'vitest';
import DatePicker from './DatePicker.svelte';
import DateRangePicker from './DateRangePicker.svelte';

test('server output contains the trigger and hidden inputs, not the grid', () => {
	const { body } = render(DateRangePicker, {
		props: { value: { start: '2026-10-01', end: '2026-10-31' }, startName: 'from', endName: 'to' }
	});
	expect(body).toContain('name="from"');
	expect(body).toContain('2026-10-31');
	expect(body).not.toContain('role="grid"');
	expect(body).not.toContain('role="dialog"');
});

test('a single picker renders on the server with no value', () => {
	const { body } = render(DatePicker, { props: { value: null, name: 'due' } });
	expect(body).toContain('name="due"');
	expect(body).toContain('Choose date');
});

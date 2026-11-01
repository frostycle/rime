import { expect, test } from 'vitest';
import { entryOffsets, firstEnabled, flattenItems, lastEnabled, matchTypeahead, stepEnabled } from './menu-items.js';
import type { MenuEntry, MenuItem } from './types.js';

const items: MenuItem[] = [{ label: 'Edit' }, { label: 'Export', disabled: true }, { label: 'Email' }, { label: 'Archive' }];

test('flattenItems skips separators and opens groups in order', () => {
	const entries: MenuEntry<MenuItem>[] = [
		{ label: 'A' },
		{ type: 'separator' },
		{ type: 'group', label: 'G', items: [{ label: 'B' }] },
		{ label: 'C' }
	];
	expect(flattenItems(entries).map((item) => item.label)).toEqual(['A', 'B', 'C']);
});

test('stepEnabled skips disabled items and wraps both ways', () => {
	expect(stepEnabled(items, 0, 1)).toBe(2);
	expect(stepEnabled(items, 3, 1)).toBe(0);
	expect(stepEnabled(items, 0, -1)).toBe(3);
	expect(stepEnabled(items, 2, -1)).toBe(0);
});

test('with nothing enabled, every lookup returns -1', () => {
	const none = [{ label: 'A', disabled: true }];
	expect(stepEnabled(none, 0, 1)).toBe(-1);
	expect(firstEnabled(none)).toBe(-1);
	expect(lastEnabled([])).toBe(-1);
});

test('first and last enabled ignore disabled ends', () => {
	const ends = [{ label: 'A', disabled: true }, { label: 'B' }, { label: 'C' }, { label: 'D', disabled: true }];
	expect(firstEnabled(ends)).toBe(1);
	expect(lastEnabled(ends)).toBe(2);
});

test('typeahead matches case-insensitively, after the current item, skipping disabled', () => {
	expect(matchTypeahead(items, 'A', 0)).toBe(3);
	expect(matchTypeahead(items, 'em', 0)).toBe(2);
	expect(matchTypeahead(items, 'exp', 0)).toBe(-1);
	expect(matchTypeahead(items, 'z', 0)).toBe(-1);
});

test('repeating one character cycles through matches', () => {
	expect(matchTypeahead(items, 'e', 0)).toBe(2);
	expect(matchTypeahead(items, 'ee', 2)).toBe(0);
});

test('a longer query can stay on the current item', () => {
	expect(matchTypeahead(items, 'ed', 0)).toBe(0);
});

test('typeahead finds a match when nothing is focused', () => {
	expect(matchTypeahead(items, 'e', -1)).toBe(0);
});

test('entryOffsets gives the flat index where each entry starts', () => {
	const repeated = { label: 'A' };
	const entries: MenuEntry<MenuItem>[] = [
		repeated,
		{ type: 'separator' },
		{ type: 'group', label: 'G', items: [{ label: 'B' }, { label: 'C' }] },
		repeated
	];
	expect(entryOffsets(entries)).toEqual([0, 1, 1, 3]);
});

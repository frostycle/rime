import type { MenuEntry, MenuGroup, MenuItem, MenuSeparator } from './types.js';

export function isSeparator<T extends MenuItem>(entry: MenuEntry<T>): entry is MenuSeparator {
	return 'type' in entry && entry.type === 'separator';
}

export function isGroup<T extends MenuItem>(entry: MenuEntry<T>): entry is MenuGroup<T> {
	return 'type' in entry && entry.type === 'group';
}

export function flattenItems<T extends MenuItem>(entries: MenuEntry<T>[]): T[] {
	return entries.flatMap((entry) => {
		if (isSeparator(entry)) return [];
		return isGroup(entry) ? entry.items : [entry];
	});
}

export function entryOffsets<T extends MenuItem>(entries: MenuEntry<T>[]): number[] {
	let next = 0;
	return entries.map((entry) => {
		const offset = next;
		if (isGroup(entry)) next += entry.items.length;
		else if (!isSeparator(entry)) next += 1;
		return offset;
	});
}

export function firstEnabled<T extends MenuItem>(items: T[]): number {
	return items.findIndex((item) => !item.disabled);
}

export function lastEnabled<T extends MenuItem>(items: T[]): number {
	return items.findLastIndex((item) => !item.disabled);
}

function searchFrom<T extends MenuItem>(
	items: T[],
	start: number,
	direction: 1 | -1,
	matches: (item: T) => boolean
): number {
	const count = items.length;
	for (let offset = 0; offset < count; offset++) {
		const index = (((start + offset * direction) % count) + count) % count;
		if (!items[index].disabled && matches(items[index])) return index;
	}
	return -1;
}

export function stepEnabled<T extends MenuItem>(items: T[], from: number, direction: 1 | -1): number {
	return searchFrom(items, from + direction, direction, () => true);
}

function isOneRepeatedCharacter(text: string): boolean {
	return [...text].every((character) => character === text[0]);
}

export function matchTypeahead<T extends MenuItem>(items: T[], typed: string, from: number): number {
	const query = typed.toLocaleLowerCase();
	const repeated = isOneRepeatedCharacter(query);
	const prefix = repeated ? query[0] : query;
	const start = repeated ? from + 1 : Math.max(from, 0);
	return searchFrom(items, start, 1, (item) => item.label.toLocaleLowerCase().startsWith(prefix));
}

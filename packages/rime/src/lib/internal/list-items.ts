export type ListItem = { label: string; disabled?: boolean };
type ListSeparator = { type: 'separator' };
type ListGroup<T extends ListItem> = { type: 'group'; label: string; items: T[] };
export type ListEntry<T extends ListItem> = T | ListSeparator | ListGroup<T>;

export function isTypeaheadKey(event: KeyboardEvent): boolean {
	return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
}

export function isSeparator<T extends ListItem>(entry: ListEntry<T>): entry is ListSeparator {
	return 'type' in entry && entry.type === 'separator';
}

export function isGroup<T extends ListItem>(entry: ListEntry<T>): entry is ListGroup<T> {
	return 'type' in entry && entry.type === 'group';
}

export function flattenItems<T extends ListItem>(entries: ListEntry<T>[]): T[] {
	return entries.flatMap((entry) => {
		if (isSeparator(entry)) return [];
		return isGroup(entry) ? entry.items : [entry];
	});
}

export function withoutEmptyGroups<T extends ListItem>(entries: ListEntry<T>[]): ListEntry<T>[] {
	return entries.filter((entry) => !isGroup(entry) || entry.items.length > 0);
}

export function entryOffsets<T extends ListItem>(entries: ListEntry<T>[]): number[] {
	let next = 0;
	return entries.map((entry) => {
		const offset = next;
		if (isGroup(entry)) next += entry.items.length;
		else if (!isSeparator(entry)) next += 1;
		return offset;
	});
}

export function firstEnabled<T extends ListItem>(items: T[]): number {
	return items.findIndex((item) => !item.disabled);
}

export function lastEnabled<T extends ListItem>(items: T[]): number {
	return items.findLastIndex((item) => !item.disabled);
}

function searchFrom<T extends ListItem>(
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

export function moveEnabled<T extends ListItem>(items: T[], from: number, steps: number): number {
	const direction = steps < 0 ? -1 : 1;
	let position = from;
	for (let moved = 0; moved < Math.abs(steps); moved++) {
		let next = position + direction;
		while (items[next]?.disabled) next += direction;
		if (!items[next]) break;
		position = next;
	}
	return position === -1 ? firstEnabled(items) : position;
}

export function stepEnabled<T extends ListItem>(items: T[], from: number, direction: 1 | -1): number {
	return searchFrom(items, from + direction, direction, () => true);
}

function isOneRepeatedCharacter(text: string): boolean {
	return [...text].every((character) => character === text[0]);
}

export function matchTypeahead<T extends ListItem>(items: T[], typed: string, from: number): number {
	const query = typed.toLocaleLowerCase();
	const repeated = isOneRepeatedCharacter(query);
	const prefix = repeated ? query[0] : query;
	const start = repeated ? from + 1 : Math.max(from, 0);
	return searchFrom(items, start, 1, (item) => item.label.toLocaleLowerCase().startsWith(prefix));
}

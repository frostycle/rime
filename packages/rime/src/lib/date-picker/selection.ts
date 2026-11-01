import { compareDates, isIsoDate, rangeLength } from './dates.js';

export type DateRange = { start: string; end: string };

export type Constraints = {
	min?: string;
	max?: string;
	isDateDisabled?: (date: string) => boolean;
	minDays?: number;
	maxDays?: number;
};

export type PickResult<V> = { committed: V } | { pendingStart: string };

export interface SelectionStrategy<V> {
	pick(pendingStart: string | null, date: string): PickResult<V>;
	assertValid(value: V | null): void;
	anchor(value: V): string;
	isSelected(value: V | null, date: string): boolean;
	rangeOf(value: V | null, pendingStart: string | null, preview: string | null): DateRange | null;
	isDisabled(date: string, pendingStart: string | null, constraints: Constraints): boolean;
	isValueAllowed(value: V, constraints: Constraints): boolean;
}

function assertIsoDate(value: unknown): void {
	if (!isIsoDate(value)) {
		throw new TypeError(`Expected a real date in YYYY-MM-DD format, received: ${String(value)}`);
	}
}

function ordered(a: string, b: string): DateRange {
	return compareDates(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };
}

function isEndpointDisabled(date: string, { min, max, isDateDisabled }: Constraints): boolean {
	if (min !== undefined && compareDates(date, min) < 0) return true;
	if (max !== undefined && compareDates(date, max) > 0) return true;
	return isDateDisabled?.(date) ?? false;
}

function breaksLength(length: number, { minDays, maxDays }: Constraints): boolean {
	if (minDays !== undefined && length < minDays) return true;
	return maxDays !== undefined && length > maxDays;
}

export const singleSelection: SelectionStrategy<string> = {
	pick: (_pendingStart, date) => ({ committed: date }),
	assertValid(value) {
		if (value !== null) assertIsoDate(value);
	},
	anchor: (value) => value,
	isSelected: (value, date) => value === date,
	rangeOf: () => null,
	isDisabled: (date, _pendingStart, constraints) => isEndpointDisabled(date, constraints),
	isValueAllowed: (value, constraints) => !isEndpointDisabled(value, constraints)
};

export const rangeSelection: SelectionStrategy<DateRange> = {
	pick(pendingStart, date) {
		if (pendingStart === null) return { pendingStart: date };
		return { committed: ordered(pendingStart, date) };
	},
	assertValid(value) {
		if (value === null) return;
		assertIsoDate(value.start);
		assertIsoDate(value.end);
		if (compareDates(value.end, value.start) < 0) {
			throw new RangeError(`Range end ${value.end} is before its start ${value.start}`);
		}
	},
	anchor: (value) => value.start,
	isSelected: (value, date) => value?.start === date || value?.end === date,
	rangeOf(value, pendingStart, preview) {
		if (pendingStart !== null) return ordered(pendingStart, preview ?? pendingStart);
		return value;
	},
	isDisabled(date, pendingStart, constraints) {
		if (isEndpointDisabled(date, constraints)) return true;
		if (pendingStart === null) return false;
		const { start, end } = ordered(pendingStart, date);
		return breaksLength(rangeLength(start, end), constraints);
	},
	isValueAllowed(value, constraints) {
		if (isEndpointDisabled(value.start, constraints)) return false;
		if (isEndpointDisabled(value.end, constraints)) return false;
		return !breaksLength(rangeLength(value.start, value.end), constraints);
	}
};

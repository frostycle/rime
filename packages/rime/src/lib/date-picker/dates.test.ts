import { expect, test, vi } from 'vitest';
import {
	addDays,
	addMonths,
	compareDates,
	dayOfWeek,
	endOfMonth,
	formatDate,
	formatDateRange,
	isIsoDate,
	rangeLength,
	startOfMonth,
	today
} from './dates';

test('isIsoDate accepts real dates only', () => {
	expect(isIsoDate('2024-02-29')).toBe(true);
	for (const bad of ['2026-02-29', '2026-02-31', '2026-13-01', '2026-1-1', '2026-10-31T00:00:00Z', '', null, 20261031]) {
		expect(isIsoDate(bad)).toBe(false);
	}
});

test('isIsoDate accepts years below 100', () => {
	expect(isIsoDate('0050-06-15')).toBe(true);
	expect(addDays('0050-06-15', 1)).toBe('0050-06-16');
});

test('addDays crosses month, year and daylight saving boundaries', () => {
	expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
	expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
	expect(addDays('2026-03-07', 2)).toBe('2026-03-09');
	expect(addDays('2026-10-31', 365)).toBe('2027-10-31');
});

test('addMonths clamps to the last day of a shorter month', () => {
	expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
	expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
	expect(addMonths('2026-03-31', -1)).toBe('2026-02-28');
	expect(addMonths('2026-12-15', 1)).toBe('2027-01-15');
});

test('month bounds', () => {
	expect(startOfMonth('2026-10-31')).toBe('2026-10-01');
	expect(endOfMonth('2024-02-10')).toBe('2024-02-29');
});

test('comparison and length count calendar days', () => {
	expect(compareDates('2026-10-30', '2026-10-31')).toBe(-1);
	expect(compareDates('2026-10-31', '2026-10-31')).toBe(0);
	expect(rangeLength('2026-10-31', '2026-10-31')).toBe(1);
	expect(rangeLength('2026-03-01', '2026-03-31')).toBe(31);
});

test('dayOfWeek and formatDate ignore the runtime timezone', () => {
	expect(dayOfWeek('2026-10-31')).toBe(6);
	expect(formatDate('2026-10-31', 'en-US', { dateStyle: 'long' })).toBe('October 31, 2026');
});

test('today returns the local calendar date', () => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2026, 9, 31, 23, 59));
	expect(today()).toBe('2026-10-31');
	vi.setSystemTime(new Date(2026, 10, 1, 0, 1));
	expect(today()).toBe('2026-11-01');
	vi.useRealTimers();
});

test('functions reject invalid dates by name', () => {
	expect(() => addDays('2026-02-31', 1)).toThrow(/2026-02-31/);
});

test('formatDateRange collapses shared parts and ignores the runtime timezone', () => {
	expect(formatDateRange('2026-10-01', '2026-10-31', 'en-US', { dateStyle: 'medium' })).toBe('Oct 1 – 31, 2026');
	expect(formatDateRange('2026-10-31', '2026-10-31', 'en-US', { dateStyle: 'medium' })).toBe('Oct 31, 2026');
});

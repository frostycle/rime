import { expect, test } from 'vitest';
import { buildMonthGrid, resolveWeekStart } from './month-grid';

test('October 2026 starting Sunday pads outside days with null', () => {
	const { weeks } = buildMonthGrid('2026-10-01', 'en-US', 0);
	expect(weeks[0]).toEqual([null, null, null, null, '2026-10-01', '2026-10-02', '2026-10-03']);
	expect(weeks.at(-1)).toEqual(['2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31']);
});

test('week start shifts columns and weekday names', () => {
	const grid = buildMonthGrid('2026-10-01', 'en-US', 1);
	expect(grid.weeks[0].slice(0, 4)).toEqual([null, null, null, '2026-10-01']);
	expect(grid.weekdays[0].long).toBe('Monday');
});

test('a month starting on the week start has no leading padding', () => {
	expect(buildMonthGrid('2026-02-01', 'en-US', 0).weeks[0][0]).toBe('2026-02-01');
});

test('the last week is padded to seven cells', () => {
	const { weeks } = buildMonthGrid('2026-09-01', 'en-US', 0);
	expect(weeks.at(-1)).toEqual(['2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', null, null, null]);
});

test('title follows the locale', () => {
	expect(buildMonthGrid('2026-10-01', 'en-US', 0).title).toBe('October 2026');
	expect(buildMonthGrid('2026-10-01', 'id-ID', 1).title).toBe('Oktober 2026');
});

test('week start uses the override, then the locale, then Sunday', () => {
	expect(resolveWeekStart('en-US', 3)).toBe(3);
	expect(resolveWeekStart('en-US')).toBe(0);
	expect(resolveWeekStart('en-GB')).toBe(1);
});

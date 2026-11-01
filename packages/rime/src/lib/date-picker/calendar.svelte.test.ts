import { afterEach, expect, test, vi } from 'vitest';
import { Calendar, type CalendarOptions } from './calendar.svelte';
import { rangeSelection, singleSelection, type SelectionStrategy } from './selection';

const labels = { previousMonth: 'Previous month', nextMonth: 'Next month', dialog: 'Choose date', inRange: 'in selected range' };

function setup<V = string>(overrides: Partial<CalendarOptions<V>> = {}): Calendar<V> {
	const options = {
		strategy: singleSelection as unknown as SelectionStrategy<V>,
		value: null,
		months: 1,
		locale: 'en-US',
		weekStartsOn: 0,
		labels,
		rtl: () => false,
		commit: vi.fn(),
		...overrides
	} as CalendarOptions<V>;
	let calendar!: Calendar<V>;
	$effect.root(() => {
		calendar = new Calendar(() => options);
	});
	return calendar;
}

afterEach(() => vi.useRealTimers());

test('initial month follows value, then today, then min', () => {
	expect(setup({ value: '2026-03-15' }).grids[0].month).toBe('2026-03-01');
	vi.setSystemTime(new Date(2026, 9, 31));
	expect(setup({ value: null }).grids[0].month).toBe('2026-10-01');
	expect(setup({ value: null, min: '2027-05-10' }).grids[0].month).toBe('2027-05-01');
});

test('months={2} shows consecutive grids, and navigation moves one month', () => {
	const calendar = setup({ value: '2026-10-15', months: 2 });
	expect(calendar.grids.map((g) => g.month)).toEqual(['2026-10-01', '2026-11-01']);
	calendar.nextMonth();
	expect(calendar.grids.map((g) => g.month)).toEqual(['2026-11-01', '2026-12-01']);
});

test('navigating away keeps the tab stop inside the view', () => {
	const calendar = setup({ value: '2026-10-15' });
	calendar.nextMonth();
	expect(calendar.focusedDate).toBe('2026-11-15');
	expect(calendar.dayProps('2026-11-15').tabindex).toBe(0);
});

test.each([
	['ArrowRight', {}, '2026-10-16'],
	['ArrowLeft', {}, '2026-10-14'],
	['ArrowDown', {}, '2026-10-22'],
	['ArrowUp', {}, '2026-10-08'],
	['Home', {}, '2026-10-11'],
	['End', {}, '2026-10-17'],
	['PageDown', {}, '2026-11-15'],
	['PageUp', {}, '2026-09-15'],
	['PageDown', { shiftKey: true }, '2027-10-15'],
	['PageUp', { shiftKey: true }, '2025-10-15']
])('%s moves focus', (key, init, expected) => {
	const calendar = setup({ value: '2026-10-15', weekStartsOn: 0 });
	calendar.onDayKeydown(new KeyboardEvent('keydown', { key, ...init }));
	expect(calendar.focusedDate).toBe(expected);
});

test('Left and Right swap on right-to-left pages', () => {
	const calendar = setup({ value: '2026-10-15', rtl: () => true });
	calendar.onDayKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
	expect(calendar.focusedDate).toBe('2026-10-16');
});

test('PageDown from January 31 lands on February 28', () => {
	const calendar = setup({ value: '2026-01-31' });
	calendar.onDayKeydown(new KeyboardEvent('keydown', { key: 'PageDown' }));
	expect(calendar.focusedDate).toBe('2026-02-28');
});

test('focus crossing out of view scrolls by one month', () => {
	const calendar = setup({ value: '2026-11-30', months: 2 });
	calendar.previousMonth();
	calendar.onDayKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
	expect(calendar.focusedDate).toBe('2026-12-01');
	expect(calendar.grids.map((g) => g.month)).toEqual(['2026-11-01', '2026-12-01']);
});

test('only the focused date is a tab stop', () => {
	const calendar = setup({ value: '2026-10-15' });
	expect(calendar.dayProps('2026-10-15').tabindex).toBe(0);
	expect(calendar.dayProps('2026-10-16').tabindex).toBe(-1);
});

test('show focuses the selected date, else today, else the first enabled date', () => {
	vi.setSystemTime(new Date(2026, 9, 31));
	const withValue = setup({ value: '2026-10-15' });
	withValue.show();
	expect(withValue.focusedDate).toBe('2026-10-15');

	const withToday = setup({ value: null });
	withToday.show();
	expect(withToday.focusedDate).toBe('2026-10-31');

	const todayDisabled = setup({ value: null, max: '2026-10-20', min: '2026-10-05' });
	todayDisabled.show();
	expect(todayDisabled.focusedDate).toBe('2026-10-05');
});

test('with no enabled date, focus lands on the first day and nothing commits', () => {
	const commit = vi.fn();
	const calendar = setup({ value: null, isDateDisabled: () => true, commit });
	calendar.show();
	expect(calendar.focusedDate).toBe(calendar.grids[0].month);
	calendar.pick(calendar.focusedDate);
	expect(commit).not.toHaveBeenCalled();
});

test('min after max leaves nothing committable', () => {
	const commit = vi.fn();
	const calendar = setup({ value: null, min: '2026-12-01', max: '2026-01-01', commit });
	calendar.show();
	expect(calendar.focusedDate).toBe(calendar.grids[0].month);
	calendar.pick(calendar.focusedDate);
	expect(commit).not.toHaveBeenCalled();
});

test('disabled days can take focus but not selection', () => {
	const commit = vi.fn();
	const calendar = setup({ value: '2026-10-15', isDateDisabled: (d) => d === '2026-10-16', commit });
	calendar.onDayKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
	expect(calendar.focusedDate).toBe('2026-10-16');
	expect(calendar.dayProps('2026-10-16')['aria-disabled']).toBe(true);
	calendar.pick('2026-10-16');
	expect(commit).not.toHaveBeenCalled();
});

test('range picking previews, then commits once', () => {
	const commit = vi.fn();
	const calendar = setup({ strategy: rangeSelection, value: null, commit });
	calendar.pick('2026-10-20');
	expect(commit).not.toHaveBeenCalled();
	expect(calendar.pendingStart).toBe('2026-10-20');
	calendar.onDayFocusOrHover('2026-10-22');
	expect(calendar.dayState('2026-10-21').preview).toBe(true);
	calendar.pick('2026-10-22');
	expect(commit).toHaveBeenCalledExactlyOnceWith({ start: '2026-10-20', end: '2026-10-22' });
	expect(calendar.pendingStart).toBeNull();
});

test('reset discards a half-made range', () => {
	const calendar = setup({ strategy: rangeSelection, value: null });
	calendar.pick('2026-10-20');
	calendar.reset();
	expect(calendar.pendingStart).toBeNull();
});

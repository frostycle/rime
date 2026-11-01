import { expect, test } from 'vitest';
import { rangeSelection, singleSelection } from './selection';

test('single commits on the first pick', () => {
	expect(singleSelection.pick(null, '2026-10-31')).toEqual({ committed: '2026-10-31' });
});

test('range needs two picks and orders them', () => {
	expect(rangeSelection.pick(null, '2026-10-20')).toEqual({ pendingStart: '2026-10-20' });
	expect(rangeSelection.pick('2026-10-20', '2026-10-25')).toEqual({ committed: { start: '2026-10-20', end: '2026-10-25' } });
	expect(rangeSelection.pick('2026-10-25', '2026-10-20')).toEqual({ committed: { start: '2026-10-20', end: '2026-10-25' } });
	expect(rangeSelection.pick('2026-10-20', '2026-10-20')).toEqual({ committed: { start: '2026-10-20', end: '2026-10-20' } });
});

test('assertValid rejects malformed values and reversed ranges', () => {
	expect(() => singleSelection.assertValid('2026-02-31')).toThrow(/2026-02-31/);
	expect(() => rangeSelection.assertValid({ start: '2026-10-25', end: '2026-10-20' })).toThrow(/before/);
	expect(() => singleSelection.assertValid(null)).not.toThrow();
});

test('min, max and isDateDisabled disable dates inclusively', () => {
	const constraints = { min: '2026-10-10', max: '2026-10-20', isDateDisabled: (d: string) => d === '2026-10-15' };
	expect(singleSelection.isDisabled('2026-10-09', null, constraints)).toBe(true);
	expect(singleSelection.isDisabled('2026-10-10', null, constraints)).toBe(false);
	expect(singleSelection.isDisabled('2026-10-20', null, constraints)).toBe(false);
	expect(singleSelection.isDisabled('2026-10-15', null, constraints)).toBe(true);
});

test('maxDays limits both directions from the pending start', () => {
	const start = '2026-10-15';
	expect(rangeSelection.isDisabled('2026-10-17', start, { maxDays: 3 })).toBe(false);
	expect(rangeSelection.isDisabled('2026-10-18', start, { maxDays: 3 })).toBe(true);
	expect(rangeSelection.isDisabled('2026-10-13', start, { maxDays: 3 })).toBe(false);
	expect(rangeSelection.isDisabled('2026-10-12', start, { maxDays: 3 })).toBe(true);
});

test('minDays above one makes the pending start unclickable', () => {
	expect(rangeSelection.isDisabled('2026-10-15', '2026-10-15', { minDays: 3 })).toBe(true);
	expect(rangeSelection.isDisabled('2026-10-16', '2026-10-15', { minDays: 3 })).toBe(true);
	expect(rangeSelection.isDisabled('2026-10-17', '2026-10-15', { minDays: 3 })).toBe(false);
	expect(rangeSelection.isDisabled('2026-10-15', '2026-10-15', {})).toBe(false);
});

test('length limits do not disable dates before the first pick', () => {
	expect(rangeSelection.isDisabled('2026-10-15', null, { minDays: 3, maxDays: 5 })).toBe(false);
});

test('a range may span disabled dates when its endpoints are allowed', () => {
	const constraints = { isDateDisabled: (d: string) => d === '2026-10-15' };
	expect(rangeSelection.isValueAllowed({ start: '2026-10-14', end: '2026-10-16' }, constraints)).toBe(true);
	expect(rangeSelection.isValueAllowed({ start: '2026-10-15', end: '2026-10-16' }, constraints)).toBe(false);
});

test('isValueAllowed enforces min, max and length', () => {
	const value = { start: '2026-10-01', end: '2026-10-10' };
	expect(rangeSelection.isValueAllowed(value, { maxDays: 9 })).toBe(false);
	expect(rangeSelection.isValueAllowed(value, { maxDays: 10 })).toBe(true);
	expect(rangeSelection.isValueAllowed(value, { min: '2026-10-02' })).toBe(false);
});

test('rangeOf previews in either direction', () => {
	expect(rangeSelection.rangeOf(null, '2026-10-20', '2026-10-15')).toEqual({ start: '2026-10-15', end: '2026-10-20' });
	expect(rangeSelection.rangeOf({ start: '2026-10-01', end: '2026-10-02' }, null, null)).toEqual({ start: '2026-10-01', end: '2026-10-02' });
	expect(singleSelection.rangeOf('2026-10-20', null, null)).toBeNull();
});

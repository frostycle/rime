import { addDays, dayOfWeek, endOfMonth, formatDate, startOfMonth } from './dates.js';

export type Weekday = { short: string; long: string };

export type MonthGrid = {
	month: string;
	title: string;
	weekdays: Weekday[];
	weeks: (string | null)[][];
};

const DAYS_PER_WEEK = 7;
const KNOWN_SUNDAY = '2023-01-01';

type LocaleWithWeekInfo = Intl.Locale & {
	getWeekInfo?: () => { firstDay: number };
	weekInfo?: { firstDay: number };
};

export function resolveWeekStart(locale: string, override?: number): number {
	if (override !== undefined) return override;
	const parsed = new Intl.Locale(locale) as LocaleWithWeekInfo;
	const firstDay = parsed.getWeekInfo?.().firstDay ?? parsed.weekInfo?.firstDay;
	// Intl numbers Monday to Sunday as 1 to 7.
	return firstDay === undefined ? 0 : firstDay % DAYS_PER_WEEK;
}

function buildWeekdays(locale: string, weekStartsOn: number): Weekday[] {
	return Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
		const date = addDays(KNOWN_SUNDAY, weekStartsOn + index);
		return {
			short: formatDate(date, locale, { weekday: 'short' }),
			long: formatDate(date, locale, { weekday: 'long' })
		};
	});
}

function buildWeeks(month: string, weekStartsOn: number): (string | null)[][] {
	const leadingBlanks = (dayOfWeek(month) - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK;
	const cells: (string | null)[] = Array(leadingBlanks).fill(null);
	const last = endOfMonth(month);
	for (let date = month; date <= last; date = addDays(date, 1)) cells.push(date);
	while (cells.length % DAYS_PER_WEEK !== 0) cells.push(null);

	const weeks: (string | null)[][] = [];
	for (let start = 0; start < cells.length; start += DAYS_PER_WEEK) {
		weeks.push(cells.slice(start, start + DAYS_PER_WEEK));
	}
	return weeks;
}

export function buildMonthGrid(month: string, locale: string, weekStartsOn: number): MonthGrid {
	const first = startOfMonth(month);
	return {
		month: first,
		title: formatDate(first, locale, { month: 'long', year: 'numeric' }),
		weekdays: buildWeekdays(locale, weekStartsOn),
		weeks: buildWeeks(first, weekStartsOn)
	};
}

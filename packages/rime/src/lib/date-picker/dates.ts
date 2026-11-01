const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;
// ICU versions disagree on these separators, so Node and browsers would otherwise produce
// different server and client labels.
const ICU_SPACES = /[\u00a0\u2009\u202f]/g;

function utcDate(year: number, month: number, day: number): Date {
	const date = new Date(0);
	// Date.UTC maps years 0 to 99 onto 1900 to 1999.
	date.setUTCFullYear(year, month, day);
	return date;
}

function toIso(date: Date): string {
	const year = String(date.getUTCFullYear()).padStart(4, '0');
	const month = String(date.getUTCMonth() + 1).padStart(2, '0');
	const day = String(date.getUTCDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function isIsoDate(value: unknown): value is string {
	if (typeof value !== 'string') return false;
	const match = ISO_DATE.exec(value);
	if (!match) return false;
	const date = utcDate(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
	return toIso(date) === value;
}

function parse(value: string): Date {
	if (!isIsoDate(value)) {
		throw new TypeError(`Expected a real date in YYYY-MM-DD format, received: ${String(value)}`);
	}
	const [year, month, day] = value.split('-').map(Number);
	return utcDate(year, month - 1, day);
}

export function today(): string {
	const now = new Date();
	return toIso(utcDate(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function addDays(date: string, days: number): string {
	const parsed = parse(date);
	return toIso(utcDate(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate() + days));
}

export function addMonths(date: string, months: number): string {
	const parsed = parse(date);
	const year = parsed.getUTCFullYear();
	const month = parsed.getUTCMonth() + months;
	const lastDayOfTarget = utcDate(year, month + 1, 0).getUTCDate();
	return toIso(utcDate(year, month, Math.min(parsed.getUTCDate(), lastDayOfTarget)));
}

export function startOfMonth(date: string): string {
	const parsed = parse(date);
	return toIso(utcDate(parsed.getUTCFullYear(), parsed.getUTCMonth(), 1));
}

export function endOfMonth(date: string): string {
	const parsed = parse(date);
	return toIso(utcDate(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, 0));
}

export function compareDates(a: string, b: string): -1 | 0 | 1 {
	const difference = parse(a).getTime() - parse(b).getTime();
	if (difference === 0) return 0;
	return difference < 0 ? -1 : 1;
}

/** Counts both endpoints, so a same-day range has length 1. */
export function rangeLength(start: string, end: string): number {
	return (parse(end).getTime() - parse(start).getTime()) / MS_PER_DAY + 1;
}

/** 0 is Sunday. */
export function dayOfWeek(date: string): number {
	return parse(date).getUTCDay();
}

export function formatDate(
	date: string,
	locale: string,
	options: Intl.DateTimeFormatOptions
): string {
	return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' })
		.format(parse(date))
		.replace(ICU_SPACES, ' ');
}

export function formatDateRange(
	start: string,
	end: string,
	locale: string,
	options: Intl.DateTimeFormatOptions
): string {
	return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' })
		.formatRange(parse(start), parse(end))
		.replace(ICU_SPACES, ' ');
}

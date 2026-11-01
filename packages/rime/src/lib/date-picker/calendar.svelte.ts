import { tick } from 'svelte';
import { interactionProps } from '../internal/interaction.js';
import {
	addDays,
	addMonths,
	compareDates,
	dayOfWeek,
	endOfMonth,
	formatDate,
	startOfMonth,
	today
} from './dates.js';
import { buildMonthGrid, resolveWeekStart, type MonthGrid } from './month-grid.js';
import type { Constraints, SelectionStrategy } from './selection.js';

export type CalendarLabels = {
	previousMonth: string;
	nextMonth: string;
	dialog: string;
	inRange: string;
};

export type CalendarOptions<V> = Constraints & {
	strategy: SelectionStrategy<V>;
	value: V | null;
	months: number;
	locale: string;
	weekStartsOn?: number;
	labels: CalendarLabels;
	rtl: () => boolean;
	commit: (value: V) => void;
};

export type DayState = {
	date: string;
	dayNumber: number;
	selected: boolean;
	inRange: boolean;
	rangeStart: boolean;
	rangeEnd: boolean;
	preview: boolean;
	isToday: boolean;
	disabled: boolean;
};

const DAYS_PER_WEEK = 7;
const MONTHS_PER_YEAR = 12;

function dataFlag(on: boolean): '' | undefined {
	return on ? '' : undefined;
}

export class Calendar<V> {
	#options: () => CalendarOptions<V>;
	#root: HTMLElement | null = null;
	#firstMonth = $state('');
	#previewDate = $state<string | null>(null);

	focusedDate = $state('');
	pendingStart = $state<string | null>(null);

	#weekStart = $derived.by(() => {
		const { locale, weekStartsOn } = this.#options();
		return resolveWeekStart(locale, weekStartsOn);
	});

	grids: MonthGrid[] = $derived.by(() => {
		const { months, locale } = this.#options();
		return Array.from({ length: months }, (_, index) =>
			buildMonthGrid(addMonths(this.#firstMonth, index), locale, this.#weekStart)
		);
	});

	constructor(options: () => CalendarOptions<V>) {
		this.#options = options;
		this.#moveViewToInitialPosition();
	}

	#initialDate(): string {
		const { strategy, value, min, max } = this.#options();
		if (value !== null) return strategy.anchor(value);
		const now = today();
		if (min !== undefined && compareDates(now, min) < 0) return min;
		if (max !== undefined && compareDates(now, max) > 0) return min ?? max;
		return now;
	}

	#moveViewToInitialPosition(): void {
		const initial = this.#initialDate();
		this.#firstMonth = startOfMonth(initial);
		this.focusedDate = initial;
	}

	#isDisabled(date: string): boolean {
		const options = this.#options();
		return options.strategy.isDisabled(date, this.pendingStart, options);
	}

	#lastVisibleDate(): string {
		return endOfMonth(addMonths(this.#firstMonth, this.#options().months - 1));
	}

	#isInView(date: string): boolean {
		return date >= this.#firstMonth && date <= this.#lastVisibleDate();
	}

	#firstEnabledInView(): string | null {
		const last = this.#lastVisibleDate();
		for (let date = this.#firstMonth; date <= last; date = addDays(date, 1)) {
			if (!this.#isDisabled(date)) return date;
		}
		return null;
	}

	#scrollToInclude(date: string): void {
		if (date < this.#firstMonth) {
			this.#firstMonth = startOfMonth(date);
		} else if (date > this.#lastVisibleDate()) {
			this.#firstMonth = addMonths(startOfMonth(date), 1 - this.#options().months);
		}
	}

	async #focusDay(date: string): Promise<void> {
		await tick();
		this.#root?.querySelector<HTMLElement>(`[data-date="${date}"]`)?.focus();
	}

	#moveFocus(date: string): void {
		this.#scrollToInclude(date);
		this.focusedDate = date;
		this.onDayFocusOrHover(date);
		void this.#focusDay(date);
	}

	#shiftView(months: number): void {
		this.#firstMonth = addMonths(this.#firstMonth, months);
		if (!this.#isInView(this.focusedDate)) {
			this.focusedDate = addMonths(this.focusedDate, months);
		}
	}

	#targetOfKey(event: KeyboardEvent): string | null {
		const focused = this.focusedDate;
		const forward = this.#options().rtl() ? -1 : 1;
		const offsetInWeek = (dayOfWeek(focused) - this.#weekStart + DAYS_PER_WEEK) % DAYS_PER_WEEK;
		const pageMonths = event.shiftKey ? MONTHS_PER_YEAR : 1;
		switch (event.key) {
			case 'ArrowRight':
				return addDays(focused, forward);
			case 'ArrowLeft':
				return addDays(focused, -forward);
			case 'ArrowDown':
				return addDays(focused, DAYS_PER_WEEK);
			case 'ArrowUp':
				return addDays(focused, -DAYS_PER_WEEK);
			case 'Home':
				return addDays(focused, -offsetInWeek);
			case 'End':
				return addDays(focused, DAYS_PER_WEEK - 1 - offsetInWeek);
			case 'PageDown':
				return addMonths(focused, pageMonths);
			case 'PageUp':
				return addMonths(focused, -pageMonths);
			default:
				return null;
		}
	}

	#dayLabel({ date, inRange, selected }: DayState): string {
		const { locale, labels } = this.#options();
		const fullDate = formatDate(date, locale, { dateStyle: 'full' });
		return inRange && !selected ? `${fullDate}, ${labels.inRange}` : fullDate;
	}

	dayState(date: string): DayState {
		const { strategy, value } = this.#options();
		const range = strategy.rangeOf(value, this.pendingStart, this.#previewDate);
		const inRange = range !== null && date >= range.start && date <= range.end;
		const pending = this.pendingStart !== null;
		return {
			date,
			dayNumber: Number(date.slice(8)),
			selected: pending ? date === this.pendingStart : strategy.isSelected(value, date),
			inRange,
			rangeStart: range?.start === date,
			rangeEnd: range?.end === date,
			preview: pending && inRange,
			isToday: date === today(),
			disabled: this.#isDisabled(date)
		};
	}

	dayProps(date: string): Record<string | symbol, unknown> {
		const state = this.dayState(date);
		return {
			type: 'button',
			tabindex: date === this.focusedDate ? 0 : -1,
			'aria-label': this.#dayLabel(state),
			'aria-current': state.isToday ? 'date' : undefined,
			'aria-pressed': state.selected,
			'aria-disabled': state.disabled,
			'data-date': date,
			'data-selected': dataFlag(state.selected),
			'data-in-range': dataFlag(state.inRange),
			'data-range-start': dataFlag(state.rangeStart),
			'data-range-end': dataFlag(state.rangeEnd),
			'data-preview': dataFlag(state.preview),
			'data-today': dataFlag(state.isToday),
			'data-disabled': dataFlag(state.disabled),
			onclick: () => this.pick(date),
			onkeydown: (event: KeyboardEvent) => this.onDayKeydown(event),
			onpointerenter: () => this.onDayFocusOrHover(date),
			onfocus: () => {
				this.focusedDate = date;
				this.onDayFocusOrHover(date);
			},
			...interactionProps
		};
	}

	show(): void {
		this.reset();
		this.#moveViewToInitialPosition();
		const { value } = this.#options();
		if (value === null && this.#isDisabled(this.focusedDate)) {
			this.focusedDate = this.#firstEnabledInView() ?? this.#firstMonth;
		}
		void this.#focusDay(this.focusedDate);
	}

	reset(): void {
		this.pendingStart = null;
		this.#previewDate = null;
	}

	syncToValue(): void {
		this.reset();
		const { strategy, value } = this.#options();
		if (value === null) return;
		const anchor = strategy.anchor(value);
		const hadFocus = this.#root?.contains(document.activeElement) ?? false;
		this.#scrollToInclude(anchor);
		this.focusedDate = anchor;
		if (hadFocus) void this.#focusDay(anchor);
	}

	previousMonth(): void {
		this.#shiftView(-1);
	}

	nextMonth(): void {
		this.#shiftView(1);
	}

	// Enter and Space are left to the native button click: handling them here as well
	// would pick twice in browsers that still click on keyup after keydown is prevented.
	onDayKeydown(event: KeyboardEvent): void {
		const target = this.#targetOfKey(event);
		if (target === null) return;
		event.preventDefault();
		this.#moveFocus(target);
	}

	onDayFocusOrHover(date: string): void {
		if (this.pendingStart !== null && !this.#isDisabled(date)) this.#previewDate = date;
	}

	pick(date: string): void {
		if (this.#isDisabled(date)) return;
		const options = this.#options();
		const result = options.strategy.pick(this.pendingStart, date);
		this.focusedDate = date;
		if ('committed' in result) {
			this.reset();
			options.commit(result.committed);
		} else {
			this.pendingStart = result.pendingStart;
			this.#previewDate = date;
		}
	}

	setRoot(element: HTMLElement): void {
		this.#root = element;
	}
}

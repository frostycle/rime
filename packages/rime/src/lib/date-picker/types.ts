import type { Snippet } from 'svelte';
import type { CalendarLabels, DayState } from './calendar.svelte.js';
import type { Weekday } from './month-grid.js';
import type { DateRange } from './selection.js';

export type Preset<V> = { label: string; value: () => V };

export type ResolvedPreset<V> = Preset<V> & { disabled: boolean };

export type PickerClasses = {
	trigger?: string;
	popup?: string;
	body?: string;
	month?: string;
	header?: string;
	title?: string;
	nav?: string;
	grid?: string;
	weekday?: string;
	cell?: string;
	day?: string;
	presets?: string;
	preset?: string;
};

// `any` because these are spread onto whichever element the consumer chooses, and `unknown` fails Svelte's attribute checks.
export type ElementProps = Record<string | symbol, any>;

export type TriggerSnippetArgs<V> = {
	props: ElementProps;
	label: string;
	value: V | null;
	open: boolean;
	clear: () => void;
};

export type PopupSnippetArgs = { props: ElementProps; content: Snippet };

export type HeaderSnippetArgs = {
	title: string;
	titleProps: ElementProps;
	previousProps: ElementProps | null;
	nextProps: ElementProps | null;
};

export type GridSnippetArgs = {
	month: string;
	weekdays: Weekday[];
	weeks: (string | null)[][];
	props: ElementProps;
	renderDay: Snippet<[string]>;
};

export type DaySnippetArgs = DayState & { props: ElementProps };

export type PresetListSnippetArgs<V> = {
	presets: ResolvedPreset<V>[];
	select: (preset: Preset<V>) => void;
};

export type CommonPickerProps<V> = {
	value?: V | null;
	onchange?: (value: V | null) => void;
	min?: string;
	max?: string;
	isDateDisabled?: (date: string) => boolean;
	months?: number;
	presets?: Preset<V>[];
	locale?: string;
	weekStartsOn?: number;
	labels?: Partial<CalendarLabels>;
	disabled?: boolean;
	transition?: boolean;
	classes?: PickerClasses;
	trigger?: Snippet<[TriggerSnippetArgs<V>]>;
	popup?: Snippet<[PopupSnippetArgs]>;
	header?: Snippet<[HeaderSnippetArgs]>;
	grid?: Snippet<[GridSnippetArgs]>;
	day?: Snippet<[DaySnippetArgs]>;
	presetList?: Snippet<[PresetListSnippetArgs<V>]>;
};

export type DatePickerProps = CommonPickerProps<string> & { name?: string };

export type DateRangePickerProps = CommonPickerProps<DateRange> & {
	minDays?: number;
	maxDays?: number;
	startName?: string;
	endName?: string;
};

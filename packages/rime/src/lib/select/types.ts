import type { Placement } from '@floating-ui/dom';
import type { Snippet } from 'svelte';

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectSeparator = { type: 'separator' };

export type SelectGroup<T extends SelectOption = SelectOption> = { type: 'group'; label: string; items: T[] };

export type SelectEntry<T extends SelectOption = SelectOption> = T | SelectSeparator | SelectGroup<T>;

export type SelectClasses = {
	trigger?: string;
	popup?: string;
	option?: string;
	separator?: string;
	group?: string;
	groupLabel?: string;
};

// `any` because these are spread onto whichever element the consumer chooses, and `unknown` fails Svelte's attribute checks.
export type SelectElementProps = Record<string | symbol, any>;

export type SelectTriggerSnippetArgs<T extends SelectOption = SelectOption> = {
	props: SelectElementProps;
	open: boolean;
	selected: T | null;
};

export type SelectPopupSnippetArgs = { props: SelectElementProps; content: Snippet };

export type SelectOptionSnippetArgs<T extends SelectOption = SelectOption> = {
	option: T;
	props: SelectElementProps;
	selected: boolean;
	highlighted: boolean;
	disabled: boolean;
};

export type SelectSeparatorSnippetArgs = { props: SelectElementProps };

export type SelectGroupLabelSnippetArgs = { label: string; props: SelectElementProps };

export type SelectProps<T extends SelectOption = SelectOption> = {
	items: SelectEntry<T>[];
	value?: string | null;
	onchange?: (value: string | null) => void;
	id?: string;
	name?: string;
	placeholder?: string;
	placement?: Placement;
	disabled?: boolean;
	transition?: boolean;
	classes?: SelectClasses;
	trigger?: Snippet<[SelectTriggerSnippetArgs<T>]>;
	popup?: Snippet<[SelectPopupSnippetArgs]>;
	option?: Snippet<[SelectOptionSnippetArgs<T>]>;
	separator?: Snippet<[SelectSeparatorSnippetArgs]>;
	groupLabel?: Snippet<[SelectGroupLabelSnippetArgs]>;
};

import type { Placement } from '@floating-ui/dom';
import type { Snippet } from 'svelte';
import type {
	ListElementProps,
	ListEntry,
	ListGroup,
	ListGroupLabelSnippetArgs,
	ListOption,
	ListOptionSnippetArgs,
	ListSeparator,
	ListSeparatorSnippetArgs
} from '../internal/list-types.js';

export type SelectOption = ListOption;

export type SelectSeparator = ListSeparator;

export type SelectGroup<T extends SelectOption = SelectOption> = ListGroup<T>;

export type SelectEntry<T extends SelectOption = SelectOption> = ListEntry<T>;

export type SelectClasses = {
	trigger?: string;
	popup?: string;
	option?: string;
	separator?: string;
	group?: string;
	groupLabel?: string;
};

export type SelectElementProps = ListElementProps;

export type SelectTriggerSnippetArgs<T extends SelectOption = SelectOption> = {
	props: SelectElementProps;
	open: boolean;
	selected: T | null;
};

export type SelectPopupSnippetArgs = { props: SelectElementProps; content: Snippet };

export type SelectOptionSnippetArgs<T extends SelectOption = SelectOption> = ListOptionSnippetArgs<T>;

export type SelectSeparatorSnippetArgs = ListSeparatorSnippetArgs;

export type SelectGroupLabelSnippetArgs = ListGroupLabelSnippetArgs;

export type SelectProps<T extends SelectOption = SelectOption> = {
	items: SelectEntry<T>[];
	value?: string | null;
	onchange?: (value: string | null) => void;
	id?: string;
	name?: string;
	placeholder?: string;
	placement?: Placement;
	disabled?: boolean;
	required?: boolean;
	transition?: boolean;
	classes?: SelectClasses;
	trigger?: Snippet<[SelectTriggerSnippetArgs<T>]>;
	popup?: Snippet<[SelectPopupSnippetArgs]>;
	option?: Snippet<[SelectOptionSnippetArgs<T>]>;
	separator?: Snippet<[SelectSeparatorSnippetArgs]>;
	groupLabel?: Snippet<[SelectGroupLabelSnippetArgs]>;
};

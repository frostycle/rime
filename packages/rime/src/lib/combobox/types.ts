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

export type ComboboxOption = ListOption;

export type ComboboxSeparator = ListSeparator;

export type ComboboxGroup<T extends ComboboxOption = ComboboxOption> = ListGroup<T>;

export type ComboboxEntry<T extends ComboboxOption = ComboboxOption> = ListEntry<T>;

export type ComboboxClasses = {
	input?: string;
	button?: string;
	popup?: string;
	option?: string;
	separator?: string;
	group?: string;
	groupLabel?: string;
};

export type ComboboxElementProps = ListElementProps;

export type ComboboxInputSnippetArgs<T extends ComboboxOption = ComboboxOption> = {
	props: ComboboxElementProps;
	open: boolean;
	selected: T | null;
};

export type ComboboxButtonSnippetArgs = { props: ComboboxElementProps; open: boolean };

export type ComboboxPopupSnippetArgs = { props: ComboboxElementProps; content: Snippet };

export type ComboboxOptionSnippetArgs<T extends ComboboxOption = ComboboxOption> =
	ListOptionSnippetArgs<T>;

export type ComboboxSeparatorSnippetArgs = ListSeparatorSnippetArgs;

export type ComboboxGroupLabelSnippetArgs = ListGroupLabelSnippetArgs;

export type ComboboxEmptySnippetArgs = { query: string };

export type ComboboxProps<T extends ComboboxOption = ComboboxOption> = {
	items: ComboboxEntry<T>[];
	value?: string | null;
	query?: string;
	onchange?: (value: string | null) => void;
	id?: string;
	name?: string;
	placeholder?: string;
	placement?: Placement;
	disabled?: boolean;
	transition?: boolean;
	classes?: ComboboxClasses;
	input?: Snippet<[ComboboxInputSnippetArgs<T>]>;
	button?: Snippet<[ComboboxButtonSnippetArgs]>;
	popup?: Snippet<[ComboboxPopupSnippetArgs]>;
	option?: Snippet<[ComboboxOptionSnippetArgs<T>]>;
	separator?: Snippet<[ComboboxSeparatorSnippetArgs]>;
	groupLabel?: Snippet<[ComboboxGroupLabelSnippetArgs]>;
	empty?: Snippet<[ComboboxEmptySnippetArgs]>;
};

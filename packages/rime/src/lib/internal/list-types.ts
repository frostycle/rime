export type ListOption = { value: string; label: string; disabled?: boolean };

export type ListSeparator = { type: 'separator' };

export type ListGroup<T extends ListOption = ListOption> = { type: 'group'; label: string; items: T[] };

export type ListEntry<T extends ListOption = ListOption> = T | ListSeparator | ListGroup<T>;

// `any` because these are spread onto whichever element the consumer chooses, and `unknown` fails Svelte's attribute checks.
export type ListElementProps = Record<string | symbol, any>;

export type ListOptionSnippetArgs<T extends ListOption = ListOption> = {
	option: T;
	props: ListElementProps;
	selected: boolean;
	highlighted: boolean;
	disabled: boolean;
};

export type ListSeparatorSnippetArgs = { props: ListElementProps };

export type ListGroupLabelSnippetArgs = { label: string; props: ListElementProps };

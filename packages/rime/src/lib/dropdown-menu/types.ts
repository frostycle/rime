import type { Placement } from '@floating-ui/dom';
import type { Snippet } from 'svelte';

export type MenuItem = {
	label: string;
	onselect?: () => void;
	href?: string;
	target?: string;
	rel?: string;
	disabled?: boolean;
};

export type MenuSeparator = { type: 'separator' };

export type MenuGroup<T extends MenuItem = MenuItem> = { type: 'group'; label: string; items: T[] };

export type MenuEntry<T extends MenuItem = MenuItem> = T | MenuSeparator | MenuGroup<T>;

export type MenuClasses = {
	trigger?: string;
	popup?: string;
	item?: string;
	separator?: string;
	group?: string;
	groupLabel?: string;
};

// `any` because these are spread onto whichever element the consumer chooses, and `unknown` fails Svelte's attribute checks.
export type MenuElementProps = Record<string | symbol, any>;

export type MenuTriggerSnippetArgs = { props: MenuElementProps; open: boolean };

export type MenuPopupSnippetArgs = { props: MenuElementProps; content: Snippet };

export type MenuItemSnippetArgs<T extends MenuItem = MenuItem> = {
	item: T;
	props: MenuElementProps;
	disabled: boolean;
};

export type MenuSeparatorSnippetArgs = { props: MenuElementProps };

export type MenuGroupLabelSnippetArgs = { label: string; props: MenuElementProps };

export type DropdownMenuProps<T extends MenuItem = MenuItem> = {
	items: MenuEntry<T>[];
	label?: string;
	placement?: Placement;
	disabled?: boolean;
	transition?: boolean;
	classes?: MenuClasses;
	trigger?: Snippet<[MenuTriggerSnippetArgs]>;
	popup?: Snippet<[MenuPopupSnippetArgs]>;
	item?: Snippet<[MenuItemSnippetArgs<T>]>;
	separator?: Snippet<[MenuSeparatorSnippetArgs]>;
	groupLabel?: Snippet<[MenuGroupLabelSnippetArgs]>;
};

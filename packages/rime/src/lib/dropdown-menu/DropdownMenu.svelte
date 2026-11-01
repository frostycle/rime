<script lang="ts" generics="T extends MenuItem">
	import { onDestroy, tick, untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { Popover } from '../internal/popover.svelte.js';
	import { Menu } from './menu.svelte.js';
	import { entryOffsets, flattenItems, isGroup, isSeparator } from './menu-items.js';
	import type { DropdownMenuProps, MenuElementProps, MenuItem } from './types.js';

	const ROOT_KEY = createAttachmentKey();
	const SPACE = ' ';

	let {
		items,
		label = 'Menu',
		placement = 'bottom-start',
		disabled = false,
		transition = false,
		classes = {},
		trigger,
		popup,
		item: itemSnippet,
		separator,
		groupLabel
	}: DropdownMenuProps<T> = $props();

	const id = $props.id();
	const triggerId = `${id}-trigger`;

	const flatItems = $derived(flattenItems(items));
	const offsets = $derived(entryOffsets(items));

	let focusOnOpen: 'first' | 'last' = 'first';

	const menu = new Menu<T>({
		items: () => flatItems,
		onTab: () => popover.close('focus-left')
	});

	const popover = new Popover(id, () => menu.resetTypeahead(), {
		role: 'menu',
		animated: () => transition,
		placement: () => placement
	});

	function focusEdge(edge: 'first' | 'last'): void {
		if (edge === 'first') menu.focusFirst();
		else menu.focusLast();
	}

	function activate(entry: T): void {
		if (!popover.open) return;
		popover.close('commit');
		entry.onselect?.();
	}

	function openWithKeyboard(edge: 'first' | 'last'): void {
		if (popover.open) {
			focusEdge(edge);
			return;
		}
		focusOnOpen = edge;
		popover.show();
	}

	function onTriggerKeydown(event: KeyboardEvent): void {
		switch (event.key) {
			case 'Enter':
			case SPACE:
				event.preventDefault();
				if (event.repeat) return;
				if (popover.open) popover.close('outside');
				else openWithKeyboard('first');
				return;
			case 'ArrowDown':
				event.preventDefault();
				openWithKeyboard('first');
				return;
			case 'ArrowUp':
				event.preventDefault();
				openWithKeyboard('last');
				return;
		}
	}

	// Some browsers still click a button on Space keyup after its keydown was prevented.
	function onTriggerKeyup(event: KeyboardEvent): void {
		if (event.key === SPACE) event.preventDefault();
	}

	$effect(() => {
		if (!popover.open) return;
		untrack(() => {
			const edge = focusOnOpen;
			focusOnOpen = 'first';
			void tick().then(() => focusEdge(edge));
		});
	});

	$effect(() => {
		for (const entry of flatItems) void entry.disabled;
		if (untrack(() => popover.open)) void tick().then(() => menu.syncFocus());
	});

	$effect(() => {
		if (disabled) untrack(() => popover.close('outside'));
	});

	onDestroy(() => menu.resetTypeahead());

	const triggerProps = $derived<MenuElementProps>({
		...popover.triggerProps,
		id: triggerId,
		disabled,
		'data-disabled': disabled ? '' : undefined,
		onkeydown: onTriggerKeydown,
		onkeyup: onTriggerKeyup
	});

	const attachRoot = (element: HTMLElement) => menu.setRoot(element);

	const popupProps = $derived<MenuElementProps>({
		...popover.contentProps,
		tabindex: -1,
		'aria-labelledby': triggerId,
		class: classes.popup,
		onkeydown: menu.onKeydown,
		[ROOT_KEY]: attachRoot
	});

	function groupLabelId(position: number): string {
		return `${id}-group-${position}`;
	}
</script>

{#snippet menuItem(entry: T, index: number)}
	{@const props = menu.itemProps(entry, index, activate)}
	{#if itemSnippet}
		{@render itemSnippet({ item: entry, props, disabled: entry.disabled ?? false })}
	{:else if entry.href !== undefined}
		<a {...props} class={classes.item}>{entry.label}</a>
	{:else}
		<button {...props} class={classes.item}>{entry.label}</button>
	{/if}
{/snippet}

{#snippet body()}
	{#each items as entry, position (position)}
		{#if isSeparator(entry)}
			{#if separator}
				{@render separator({ props: { role: 'separator' } })}
			{:else}
				<div role="separator" class={classes.separator}></div>
			{/if}
		{:else if isGroup(entry)}
			<div role="group" aria-labelledby={groupLabelId(position)} class={classes.group}>
				{#if groupLabel}
					{@render groupLabel({ label: entry.label, props: { id: groupLabelId(position) } })}
				{:else}
					<div id={groupLabelId(position)} class={classes.groupLabel}>{entry.label}</div>
				{/if}
				{#each entry.items as groupItem, groupPosition (groupPosition)}
					{@render menuItem(groupItem, offsets[position] + groupPosition)}
				{/each}
			</div>
		{:else}
			{@render menuItem(entry, offsets[position])}
		{/if}
	{/each}
{/snippet}

{#if trigger}
	{@render trigger({ props: triggerProps, open: popover.open })}
{:else}
	<button {...triggerProps} class={classes.trigger}>{label}</button>
{/if}

{#if popover.mounted}
	{#if popup}
		{@render popup({ props: popupProps, content: body })}
	{:else}
		<div {...popupProps}>{@render body()}</div>
	{/if}
{/if}

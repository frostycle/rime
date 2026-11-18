<script lang="ts" generics="T extends ListOption">
	import type { Snippet } from 'svelte';
	import { entryOffsets, isGroup, isSeparator } from './list-items.js';
	import type {
		ListEntry,
		ListGroupLabelSnippetArgs,
		ListOption,
		ListOptionSnippetArgs,
		ListSeparatorSnippetArgs
	} from './list-types.js';
	import { optionId, type Listbox } from './listbox.svelte.js';

	type Props = {
		items: ListEntry<T>[];
		value: string | null;
		listbox: Listbox<T>;
		idPrefix: string;
		onselect: (option: T) => void;
		classes: { option?: string; separator?: string; group?: string; groupLabel?: string };
		option?: Snippet<[ListOptionSnippetArgs<T>]>;
		separator?: Snippet<[ListSeparatorSnippetArgs]>;
		groupLabel?: Snippet<[ListGroupLabelSnippetArgs]>;
	};

	let {
		items,
		value,
		listbox,
		idPrefix,
		onselect,
		classes,
		option: optionSnippet,
		separator,
		groupLabel
	}: Props = $props();

	const offsets = $derived(entryOffsets(items));

	function optionProps(entry: T, index: number, isSelected: boolean) {
		return {
			...listbox.optionProps(entry, index, optionId(idPrefix, index), onselect),
			'aria-selected': isSelected,
			'data-selected': isSelected ? '' : undefined
		};
	}

	function groupLabelId(position: number): string {
		return `${idPrefix}-group-${position}`;
	}
</script>

{#snippet listOption(entry: T, index: number)}
	{@const isSelected = entry.value === value}
	{@const props = optionProps(entry, index, isSelected)}
	{#if optionSnippet}
		{@render optionSnippet({
			option: entry,
			props,
			selected: isSelected,
			highlighted: listbox.highlighted === index,
			disabled: entry.disabled ?? false
		})}
	{:else}
		<div {...props} class={classes.option}>{entry.label}</div>
	{/if}
{/snippet}

{#each items as entry, position (position)}
	{#if isSeparator(entry)}
		{#if separator}
			{@render separator({ props: { role: 'none' } })}
		{:else}
			<div role="none" class={classes.separator}></div>
		{/if}
	{:else if isGroup(entry)}
		<div role="group" aria-labelledby={groupLabelId(position)} class={classes.group}>
			{#if groupLabel}
				{@render groupLabel({ label: entry.label, props: { id: groupLabelId(position) } })}
			{:else}
				<div id={groupLabelId(position)} class={classes.groupLabel}>{entry.label}</div>
			{/if}
			{#each entry.items as groupOption, groupPosition (groupPosition)}
				{@render listOption(groupOption, offsets[position] + groupPosition)}
			{/each}
		</div>
	{:else}
		{@render listOption(entry, offsets[position])}
	{/if}
{/each}

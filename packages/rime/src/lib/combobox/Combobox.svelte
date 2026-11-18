<script lang="ts" generics="T extends ComboboxOption">
	import { untrack } from 'svelte';
	import { flattenItems } from '../internal/list-items.js';
	import ListboxEntries from '../internal/ListboxEntries.svelte';
	import { Listbox, optionId } from '../internal/listbox.svelte.js';
	import { Popover } from '../internal/popover.svelte.js';
	import type { ComboboxElementProps, ComboboxOption, ComboboxProps } from './types.js';

	let {
		items,
		value = $bindable(null),
		query = $bindable(''),
		onchange,
		id: inputIdProp,
		name,
		placeholder,
		placement = 'bottom-start',
		disabled = false,
		transition = false,
		classes = {},
		input,
		popup,
		option: optionSnippet,
		separator,
		groupLabel
	}: ComboboxProps<T> = $props();

	const id = $props.id();
	const inputId = $derived(inputIdProp ?? `${id}-input`);

	const flatItems = $derived(flattenItems(items));
	const selected = $derived(flatItems.find((entry) => entry.value === value) ?? null);

	const listbox = new Listbox<T>(() => flatItems, { textInput: true });

	const popover = new Popover(id, () => listbox.resetTypeahead(), {
		role: 'listbox',
		animated: () => transition,
		placement: () => placement
	});

	let editing = $state(false);
	let listboxLabel = $state<string>();

	const inputText = $derived(editing ? query : (selected?.label ?? ''));

	function select(entry: T): void {
		if (!popover.open) return;
		editing = false;
		query = '';
		popover.close('commit');
		if (entry.value === value) return;
		value = entry.value;
		onchange?.(entry.value);
	}

	function onInput(event: Event): void {
		editing = true;
		query = (event.currentTarget as HTMLInputElement).value;
		popover.show();
		listbox.highlightFirst();
	}

	function onBlur(): void {
		popover.close('focus-left');
	}

	function labelText(element: HTMLElement | null): string | undefined {
		const labels = (element as HTMLInputElement | null)?.labels ?? [];
		const text = [...labels].map((label) => label.textContent?.trim()).join(' ');
		return text || undefined;
	}

	$effect(() => {
		if (!popover.open) return;
		untrack(() => {
			listboxLabel = labelText(popover.triggerElement);
		});
	});

	$effect(() => {
		for (const entry of flatItems) void entry.disabled;
		untrack(() => {
			if (popover.open) listbox.syncHighlight();
		});
	});

	$effect(() => {
		const index = listbox.highlighted;
		if (!popover.mounted || index === -1) return;
		document.getElementById(optionId(id, index))?.scrollIntoView({ block: 'nearest' });
	});

	$effect(() => {
		if (disabled) untrack(() => popover.close('outside'));
	});

	const inputProps = $derived<ComboboxElementProps>({
		...popover.anchorProps,
		id: inputId,
		type: 'text',
		role: 'combobox',
		autocomplete: 'off',
		'aria-autocomplete': 'list',
		'aria-activedescendant':
			popover.open && listbox.highlighted !== -1 ? optionId(id, listbox.highlighted) : undefined,
		disabled,
		placeholder,
		value: inputText,
		'data-disabled': disabled ? '' : undefined,
		oninput: onInput,
		onblur: onBlur
	});

	const popupProps = $derived<ComboboxElementProps>({
		...popover.contentProps,
		'aria-label': listboxLabel,
		class: classes.popup,
		onmousedown: (event: MouseEvent) => event.preventDefault()
	});
</script>

{#snippet body()}
	<ListboxEntries
		{items}
		{value}
		{listbox}
		idPrefix={id}
		onselect={select}
		{classes}
		option={optionSnippet}
		{separator}
		{groupLabel}
	/>
{/snippet}

{#if input}
	{@render input({ props: inputProps, open: popover.open, selected })}
{:else}
	<input {...inputProps} class={classes.input} />
{/if}

{#if name && !disabled}
	<input type="hidden" {name} value={value ?? ''} />
{/if}

{#if popover.mounted}
	{#if popup}
		{@render popup({ props: popupProps, content: body })}
	{:else}
		<div {...popupProps}>{@render body()}</div>
	{/if}
{/if}

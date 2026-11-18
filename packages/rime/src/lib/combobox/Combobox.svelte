<script lang="ts" generics="T extends ComboboxOption">
	import { untrack } from 'svelte';
	import { isComposing } from '../internal/interaction.js';
	import { flattenItems } from '../internal/list-items.js';
	import ListboxEntries from '../internal/ListboxEntries.svelte';
	import { Listbox, optionId } from '../internal/listbox.svelte.js';
	import { Popover, type CloseReason } from '../internal/popover.svelte.js';
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
		groupLabel,
		empty
	}: ComboboxProps<T> = $props();

	const id = $props.id();
	const inputId = $derived(inputIdProp ?? `${id}-input`);

	const flatItems = $derived(flattenItems(items));
	const selected = $derived(flatItems.find((entry) => entry.value === value) ?? null);

	const listbox = new Listbox<T>(() => flatItems, { textInput: true });

	const popover = new Popover(id, onClose, {
		role: 'listbox',
		animated: () => transition,
		placement: () => placement
	});

	let editing = $state(false);
	let movedByUser = false;
	let listboxLabel = $state<string>();

	const inputText = $derived(editing ? query : (selected?.label ?? ''));
	const hasContent = $derived(flatItems.length > 0 || empty !== undefined);

	function onClose(reason: CloseReason): void {
		listbox.resetTypeahead();
		if (reason === 'escape') endEditing();
	}

	function endEditing(): void {
		editing = false;
		query = '';
	}

	function commit(next: string | null): void {
		endEditing();
		popover.close('commit');
		if (next === value) return;
		value = next;
		onchange?.(next);
	}

	function select(entry: T): void {
		if (popover.open) commit(entry.value);
	}

	function revert(): void {
		endEditing();
		popover.close('escape');
	}

	function highlightForQuery(): void {
		if (query === '') listbox.clearHighlight();
		else listbox.highlightFirst();
	}

	function showWhileEditing(): void {
		if (hasContent) popover.show();
		else popover.close('outside');
	}

	function onInput(event: Event): void {
		editing = true;
		query = (event.currentTarget as HTMLInputElement).value;
		movedByUser = false;
		showWhileEditing();
		highlightForQuery();
	}

	function openFromKeyboard(): void {
		if (editing || !hasContent) return;
		listbox.highlightOnOpen(value);
		movedByUser = true;
		popover.show();
	}

	function onEnter(event: KeyboardEvent): void {
		if (popover.open && listbox.highlighted !== -1) {
			event.preventDefault();
			select(flatItems[listbox.highlighted]);
			return;
		}
		if (!editing) return;
		event.preventDefault();
		if (query === '') commit(null);
		else revert();
	}

	// Escape while the list is open never gets here: the Popover handles it on the document first.
	function onKeydown(event: KeyboardEvent): void {
		if (isComposing(event)) return;
		if (popover.open && listbox.navigate(event)) {
			movedByUser = true;
			return;
		}
		switch (event.key) {
			case 'ArrowDown':
			case 'ArrowUp':
				event.preventDefault();
				openFromKeyboard();
				return;
			case 'Enter':
				onEnter(event);
				return;
			case 'Escape':
				if (!editing) return;
				// This Escape only undoes typing; a surrounding <dialog> or shortcut must not act on it.
				event.preventDefault();
				event.stopPropagation();
				revert();
				return;
		}
	}

	function onBlur(event: FocusEvent): void {
		const next = event.relatedTarget;
		if (next instanceof Node && document.getElementById(id)?.contains(next)) return;
		popover.close('focus-left');
		if (editing && query === '') commit(null);
		else endEditing();
	}

	function onPopupPointerMove(event: PointerEvent): void {
		const hovered = (event.target as Element).closest('[role="option"]');
		if (hovered && hovered.id === optionId(id, listbox.highlighted)) movedByUser = true;
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
			if (editing) showWhileEditing();
			if (!popover.open) return;
			if (movedByUser || !editing) listbox.syncHighlight();
			else highlightForQuery();
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
		onkeydown: onKeydown,
		onblur: onBlur
	});

	const popupProps = $derived<ComboboxElementProps>({
		...popover.contentProps,
		'aria-label': listboxLabel,
		class: classes.popup,
		onmousedown: (event: MouseEvent) => event.preventDefault(),
		onpointermove: onPopupPointerMove
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

<script lang="ts" generics="T extends ComboboxOption">
	import { flushSync, untrack } from 'svelte';
	import { announceChange } from '../internal/form-change.js';
	import { watchFormReset } from '../internal/form-reset.js';
	import { interactionProps, isComposing } from '../internal/interaction.js';
	import { flattenItems, withoutEmptyGroups } from '../internal/list-items.js';
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
		button,
		empty
	}: ComboboxProps<T> = $props();

	const id = $props.id();
	const inputId = $derived(inputIdProp ?? `${id}-input`);

	const flatItems = $derived(flattenItems(items));
	const selected = $derived(flatItems.find((entry) => entry.value === value) ?? null);
	const shownItems = $derived(withoutEmptyGroups(items));

	const knownLabels = new Map<string, string>();
	const selectedLabel = $derived(
		selected?.label ?? (value === null ? undefined : knownLabels.get(value)) ?? ''
	);

	const listbox = new Listbox<T>(() => flatItems, {
		textInput: true,
		onPointerHighlight: () => (movedByUser = true)
	});

	const popover = new Popover(id, onClose, {
		role: 'listbox',
		animated: () => transition,
		placement: () => placement
	});

	let editing = $state(false);
	let dismissed = false;
	let movedByUser = false;
	let listboxLabel = $state<string>();
	let formElement = $state<HTMLInputElement>();

	const inputText = $derived(editing ? query : selectedLabel);
	const isListbox = $derived(flatItems.length > 0);
	const hasContent = $derived(isListbox || empty !== undefined);

	function onClose(reason: CloseReason): void {
		listbox.resetTypeahead();
		if (reason === 'escape') endEditing();
		// Fires on pointerdown, before any blur, so the clear for an emptied input happens here.
		if (reason === 'outside') finishEditing();
	}

	function endEditing(): void {
		editing = false;
		query = '';
	}

	function finishEditing(): void {
		if (editing && query === '') commit(null);
		else endEditing();
	}

	function commit(next: string | null): void {
		endEditing();
		popover.close('commit');
		if (next === value) return;
		value = next;
		announceChange(formElement);
		onchange?.(next);
	}

	function select(entry: T): void {
		if (popover.open) commit(entry.value);
	}

	function revert(): void {
		endEditing();
		popover.close('cancel');
	}

	function highlightForQuery(): void {
		if (query === '') listbox.clearHighlight();
		else listbox.highlightFirst();
	}

	function showWhileEditing(): void {
		if (hasContent) popover.show();
		else popover.close('programmatic');
	}

	function onInput(event: Event): void {
		editing = true;
		dismissed = false;
		query = (event.currentTarget as HTMLInputElement).value;
		movedByUser = false;
		showWhileEditing();
		highlightForQuery();
	}

	function openFromKeyboard(): void {
		if (!hasContent) return;
		dismissed = false;
		if (editing) highlightForQuery();
		else listbox.highlightOnOpen(value);
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
		finishEditing();
	}

	function toggleFromButton(): void {
		if (popover.open) {
			dismissed = editing;
			popover.close('toggle');
			return;
		}
		popover.triggerElement?.focus();
		openFromKeyboard();
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
			if (editing && !dismissed) showWhileEditing();
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
		if (selected) knownLabels.set(selected.value, selected.label);
	});

	const valueAtMount = untrack(() => value);

	$effect(() => {
		const element = popover.triggerElement;
		if (!element) return;
		return watchFormReset(element, () => {
			endEditing();
			value = valueAtMount;
			popover.close('programmatic');
			flushSync();
		});
	});

	$effect(() => {
		if (disabled) untrack(() => popover.close('programmatic'));
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
		defaultValue: selectedLabel,
		'data-disabled': disabled ? '' : undefined,
		oninput: onInput,
		onkeydown: onKeydown,
		onblur: onBlur,
		...interactionProps
	});

	const buttonProps = $derived<ComboboxElementProps>({
		...popover.partProps,
		...interactionProps,
		type: 'button',
		tabindex: -1,
		'aria-hidden': 'true',
		disabled,
		'data-open': popover.open ? '' : undefined,
		'data-disabled': disabled ? '' : undefined,
		onmousedown: (event: MouseEvent) => event.preventDefault(),
		onclick: toggleFromButton
	});

	const popupProps = $derived<ComboboxElementProps>({
		...popover.contentProps,
		role: isListbox ? 'listbox' : undefined,
		'aria-label': isListbox ? listboxLabel : undefined,
		class: classes.popup,
		onmousedown: (event: MouseEvent) => event.preventDefault()
	});
</script>

{#snippet body()}
	{#if flatItems.length === 0 && empty}
		<div role="status">{@render empty({ query })}</div>
	{/if}
	<ListboxEntries
		items={shownItems}
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

{#if button}
	{@render button({ props: buttonProps, open: popover.open })}
{/if}

{#if name && !disabled}
	<input bind:this={formElement} type="hidden" {name} value={value ?? ''} />
{/if}

{#if popover.mounted}
	{#if popup}
		{@render popup({ props: popupProps, content: body })}
	{:else}
		<div {...popupProps}>{@render body()}</div>
	{/if}
{/if}

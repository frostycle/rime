<script lang="ts" generics="T extends SelectOption">
	import { onDestroy, untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { Popover } from '../internal/popover.svelte.js';
	import { ConstraintValidation } from '../internal/constraint-validation.svelte.js';
	import { announceChange } from '../internal/form-change.js';
	import { watchFormReset } from '../internal/form-reset.js';
	import { flattenItems, isTypeaheadKey } from '../internal/list-items.js';
	import ListboxEntries from '../internal/ListboxEntries.svelte';
	import { Listbox, optionId } from '../internal/listbox.svelte.js';
	import type { SelectElementProps, SelectOption, SelectProps } from './types.js';

	const LABELS_KEY = createAttachmentKey();
	const SPACE = ' ';

	let {
		items,
		value = $bindable(null),
		onchange,
		id: triggerIdProp,
		name,
		placeholder,
		placement = 'bottom-start',
		disabled = false,
		required = false,
		transition = false,
		classes = {},
		trigger,
		popup,
		option: optionSnippet,
		separator,
		groupLabel
	}: SelectProps<T> = $props();

	const id = $props.id();
	const triggerId = $derived(triggerIdProp ?? `${id}-trigger`);

	const flatItems = $derived(flattenItems(items));
	const selected = $derived(flatItems.find((entry) => entry.value === value) ?? null);

	const listbox = new Listbox<T>(() => flatItems);

	const popover = new Popover(id, () => listbox.resetTypeahead(), {
		role: 'listbox',
		animated: () => transition,
		placement: () => placement
	});

	let highlightOnShow: (() => void) | null = null;
	let formElement = $state<HTMLInputElement | HTMLSelectElement>();
	const validation = new ConstraintValidation({
		trigger: () => popover.triggerElement,
		required: () => required,
		disabled: () => disabled,
		empty: () => value === null || value === ''
	});
	let listboxLabel = $state<string>();

	function select(entry: T): void {
		if (!popover.open) return;
		popover.close('commit');
		if (entry.value === value) return;
		value = entry.value;
		announceChange(formElement);
		onchange?.(entry.value);
	}

	function selectHighlighted(): void {
		const entry = flatItems[listbox.highlighted];
		if (entry) select(entry);
	}

	function openWith(highlight: () => void): void {
		highlightOnShow = highlight;
		popover.show();
	}

	function onClosedKeydown(event: KeyboardEvent): void {
		switch (event.key) {
			case 'Enter':
			case SPACE:
			case 'ArrowDown':
			case 'ArrowUp':
				event.preventDefault();
				if (event.repeat) return;
				openWith(() => listbox.highlightOnOpen(value));
				return;
			case 'Home':
				event.preventDefault();
				openWith(() => listbox.highlightFirst());
				return;
			case 'End':
				event.preventDefault();
				openWith(() => listbox.highlightLast());
				return;
		}
		if (isTypeaheadKey(event)) {
			event.preventDefault();
			openWith(() => {
				listbox.highlightOnOpen(value);
				listbox.highlightMatch(event.key);
			});
		}
	}

	function onOpenKeydown(event: KeyboardEvent): void {
		if (listbox.navigate(event)) return;
		switch (event.key) {
			case 'Enter':
			case SPACE:
				event.preventDefault();
				if (event.repeat) return;
				if (listbox.highlighted === -1) popover.close('commit');
				else selectHighlighted();
				return;
			case 'Tab':
				selectHighlighted();
				popover.close('focus-left');
				return;
		}
	}

	function onTriggerKeydown(event: KeyboardEvent): void {
		if (popover.open) onOpenKeydown(event);
		else onClosedKeydown(event);
	}

	// Some browsers still click a button on Space keyup after its keydown was prevented.
	function onTriggerKeyup(event: KeyboardEvent): void {
		if (event.key === SPACE) event.preventDefault();
	}

	function onTriggerBlur(event: FocusEvent): void {
		const next = event.relatedTarget;
		if (next instanceof Node && document.getElementById(id)?.contains(next)) return;
		popover.close('focus-left');
	}

	// A label click would otherwise reach the button and open the list, unlike a native <select>.
	// Listening on the document covers labels rendered after the trigger.
	function attachLabels(element: HTMLElement) {
		const onClick = (event: MouseEvent) => {
			const label = event.target instanceof Element ? event.target.closest('label') : null;
			if (label?.control !== element) return;
			event.preventDefault();
			element.focus();
		};
		document.addEventListener('click', onClick, true);
		return () => document.removeEventListener('click', onClick, true);
	}

	function labelsOf(element: HTMLElement | null | undefined): HTMLLabelElement[] {
		return [...((element as HTMLButtonElement | null | undefined)?.labels ?? [])];
	}

	function labelText(): string | undefined {
		const text = labelsOf(popover.triggerElement).map((label) => label.textContent?.trim()).join(' ');
		return text || undefined;
	}

	$effect(() => {
		if (!popover.open) return;
		untrack(() => {
			// Safari does not focus a clicked button, and keys only reach the list through the trigger.
			popover.triggerElement?.focus();
			listboxLabel = labelText();
			const highlight = highlightOnShow ?? (() => listbox.highlightOnOpen(value));
			highlightOnShow = null;
			highlight();
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

	const valueAtMount = untrack(() => value);

	$effect(() => {
		const element = popover.triggerElement;
		if (!element) return;
		return watchFormReset(element, () => {
			value = valueAtMount;
			validation.reset();
		});
	});

	$effect(() => {
		if (disabled) untrack(() => popover.close('programmatic'));
	});

	onDestroy(() => listbox.resetTypeahead());

	const triggerProps = $derived<SelectElementProps>({
		...popover.triggerProps,
		id: triggerId,
		role: 'combobox',
		disabled,
		'aria-activedescendant':
			popover.open && listbox.highlighted !== -1 ? optionId(id, listbox.highlighted) : undefined,
		...validation.triggerProps,
		'data-disabled': disabled ? '' : undefined,
		'data-placeholder': value === null ? '' : undefined,
		onkeydown: onTriggerKeydown,
		onkeyup: onTriggerKeyup,
		onblur: onTriggerBlur,
		[LABELS_KEY]: attachLabels
	});

	const popupProps = $derived<SelectElementProps>({
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

{#if trigger}
	{@render trigger({ props: triggerProps, open: popover.open, selected })}
{:else}
	<button {...triggerProps} class={classes.trigger}>{selected?.label ?? placeholder ?? ''}</button>
{/if}

{#if !disabled}
	{#if required}
		<!-- Hidden inputs are never validated, so required needs a real control. A select whose only
		     option is empty reports valueMissing with the browser's select wording. -->
		<select
			bind:this={formElement}
			{name}
			required
			{...validation.controlProps}
		>
			<!-- WebKit does not revalidate when an option's value changes in place, so it is recreated. -->
			{#key value}
				<option value={value ?? ''}></option>
			{/key}
		</select>
	{:else if name}
		<input bind:this={formElement} type="hidden" {name} value={value ?? ''} />
	{/if}
{/if}

{#if popover.mounted}
	{#if popup}
		{@render popup({ props: popupProps, content: body })}
	{:else}
		<div {...popupProps}>{@render body()}</div>
	{/if}
{/if}

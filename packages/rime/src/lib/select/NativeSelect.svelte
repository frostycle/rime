<script lang="ts" generics="T extends SelectOption">
	import { untrack } from 'svelte';
	import { ConstraintValidation } from '../internal/constraint-validation.svelte.js';
	import { announceChange } from '../internal/form-change.js';
	import { watchFormReset } from '../internal/form-reset.js';
	import { interactionProps } from '../internal/interaction.js';
	import { flattenItems, isGroup, isSeparator, withoutEmptyGroups } from '../internal/list-items.js';
	import type { NativeSelectProps, SelectOption } from './types.js';

	let {
		items,
		value = $bindable(null),
		onchange,
		id: idProp,
		name,
		placeholder,
		disabled = false,
		required = false,
		classes = {}
	}: NativeSelectProps<T> = $props();

	const generatedId = $props.id();
	const id = $derived(idProp ?? generatedId);
	const shownItems = $derived(withoutEmptyGroups(items));
	const missingValue = $derived(
		value !== null && value !== '' && !flattenItems(items).some((option) => option.value === value)
			? value
			: null
	);

	let hiddenInput = $state<HTMLInputElement>();
	let selectElement = $state<HTMLSelectElement>();

	const validation = new ConstraintValidation({
		trigger: () => selectElement ?? null,
		required: () => required,
		disabled: () => disabled,
		empty: () => value === null || value === ''
	});

	const valueAtMount = untrack(() => value);

	// The browser resets a select after the reset event, to the option marked as selected in its
	// markup (defaultSelected), so setting the element from a reset handler would be overwritten.
	$effect(() => {
		void shownItems;
		void missingValue;
		if (!selectElement) return;
		const restored = valueAtMount ?? '';
		const options = [...selectElement.options];
		const target = options.find((option) => option.value === restored);
		for (const option of options) option.defaultSelected = option === target;
	});

	$effect(() => {
		if (!selectElement) return;
		return watchFormReset(selectElement, () => {
			validation.reset();
			value = valueAtMount;
		});
	});

	function pick(next: string): void {
		if (next === value) return;
		value = next;
		announceChange(hiddenInput);
		onchange?.(next);
	}
</script>

{#snippet optionElement(option: T)}
	<option value={option.value} disabled={option.disabled}>{option.label}</option>
{/snippet}

<select
	bind:this={selectElement}
	{id}
	{disabled}
	{required}
	value={value ?? ''}
	class={classes.select}
	data-disabled={disabled ? '' : undefined}
	{...validation.triggerProps}
	oninvalid={validation.recordFailure}
	onchange={(event) => pick(event.currentTarget.value)}
	{...interactionProps}
>
	<!-- Without a selected option, a native select shows and submits its first real one. -->
	<option value="" disabled hidden>{placeholder ?? ''}</option>
	{#if missingValue !== null}
		<option value={missingValue} disabled hidden></option>
	{/if}
	{#each shownItems as entry, index (index)}
		{#if isSeparator(entry)}
			<hr />
		{:else if isGroup(entry)}
			<optgroup label={entry.label}>
				{#each entry.items as option (option.value)}{@render optionElement(option)}{/each}
			</optgroup>
		{:else}
			{@render optionElement(entry)}
		{/if}
	{/each}
</select>

{#if name && !disabled}
	<input bind:this={hiddenInput} type="hidden" {name} value={value ?? ''} />
{/if}

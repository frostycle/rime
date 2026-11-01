<script lang="ts">
	import PickerBase from './PickerBase.svelte';
	import { formatDateRange } from './dates.js';
	import { rangeSelection, type DateRange } from './selection.js';
	import type { DateRangePickerProps } from './types.js';

	let {
		value = $bindable(null),
		locale = 'en-US',
		labels,
		startName,
		endName,
		...rest
	}: DateRangePickerProps = $props();

	const formatLabel = ({ start, end }: DateRange) =>
		formatDateRange(start, end, locale, { dateStyle: 'medium' });
</script>

{#snippet hiddenInputs(current: DateRange | null)}
	{#if startName}<input type="hidden" name={startName} value={current?.start ?? ''} />{/if}
	{#if endName}<input type="hidden" name={endName} value={current?.end ?? ''} />{/if}
{/snippet}

<PickerBase
	bind:value
	{locale}
	labels={{ dialog: 'Choose dates', ...labels }}
	strategy={rangeSelection}
	{formatLabel}
	{hiddenInputs}
	{...rest}
/>

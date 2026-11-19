<script lang="ts">
	import PickerBase, { type FormField } from './PickerBase.svelte';
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

	function fields(current: DateRange | null): FormField[] {
		const entries: FormField[] = [];
		if (startName) entries.push({ name: startName, value: current?.start ?? '' });
		if (endName) entries.push({ name: endName, value: current?.end ?? '' });
		return entries;
	}
</script>

<PickerBase
	bind:value
	{locale}
	labels={{ dialog: 'Choose dates', ...labels }}
	strategy={rangeSelection}
	{formatLabel}
	{fields}
	{...rest}
/>

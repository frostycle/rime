<script lang="ts">
	import PickerBase, { type FormField } from './PickerBase.svelte';
	import { formatDate } from './dates.js';
	import { singleSelection } from './selection.js';
	import type { DatePickerProps } from './types.js';

	let { value = $bindable(null), locale = 'en-US', name, ...rest }: DatePickerProps = $props();

	const formatLabel = (date: string) => formatDate(date, locale, { dateStyle: 'medium' });
	const fields = (current: string | null): FormField[] =>
		name ? [{ name, value: current ?? '' }] : [];
</script>

<PickerBase bind:value {locale} strategy={singleSelection} {formatLabel} {fields} {...rest} />

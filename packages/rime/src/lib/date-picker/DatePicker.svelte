<script lang="ts">
	import PickerBase from './PickerBase.svelte';
	import { formatDate } from './dates.js';
	import { singleSelection } from './selection.js';
	import type { DatePickerProps } from './types.js';

	let { value = $bindable(null), locale = 'en-US', name, ...rest }: DatePickerProps = $props();

	const formatLabel = (date: string) => formatDate(date, locale, { dateStyle: 'medium' });
</script>

{#snippet hiddenInputs(current: string | null)}
	{#if name}<input type="hidden" {name} value={current ?? ''} />{/if}
{/snippet}

<PickerBase bind:value {locale} strategy={singleSelection} {formatLabel} {hiddenInputs} {...rest} />

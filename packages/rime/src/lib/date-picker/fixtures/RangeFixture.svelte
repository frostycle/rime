<script lang="ts">
	import DateRangePicker from '../DateRangePicker.svelte';
	import type { DateRangePickerProps } from '../types';

	let { value = $bindable(null), ...rest }: DateRangePickerProps = $props();
</script>

<DateRangePicker bind:value {...rest}>
	{#snippet trigger({ props, label, clear, value: current })}
		<button {...props}>{label || 'Choose'}</button>
		{#if current}<button type="button" onclick={clear}>Clear</button>{/if}
	{/snippet}
</DateRangePicker>
<output data-testid="value">{value ? `${value.start}..${value.end}` : ''}</output>

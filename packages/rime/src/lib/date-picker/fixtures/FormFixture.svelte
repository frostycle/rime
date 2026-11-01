<script lang="ts">
	import DatePicker from '../DatePicker.svelte';
	import DateRangePicker from '../DateRangePicker.svelte';
	import type { DateRange } from '../selection';

	let {
		kind,
		value = null,
		disabled = false,
		onsubmit
	}: {
		kind: 'single' | 'range';
		value?: string | DateRange | null;
		disabled?: boolean;
		onsubmit?: (event: SubmitEvent) => void;
	} = $props();
</script>

<form {onsubmit}>
	{#if kind === 'single'}
		<DatePicker value={value as string | null} name="due" {disabled} />
	{:else}
		<DateRangePicker value={value as DateRange | null} startName="from" endName="to" {disabled} />
	{/if}
	<button type="submit">Submit</button>
</form>

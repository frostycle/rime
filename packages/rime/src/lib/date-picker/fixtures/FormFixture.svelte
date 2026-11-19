<script lang="ts">
	import DatePicker from '../DatePicker.svelte';
	import DateRangePicker from '../DateRangePicker.svelte';
	import type { DateRange } from '../selection';
	import type { Preset } from '../types';

	let {
		kind,
		value = null,
		disabled = false,
		required = false,
		onchange,
		presets = [],
		onsubmit
	}: {
		kind: 'single' | 'range';
		value?: string | DateRange | null;
		disabled?: boolean;
		required?: boolean;
		onchange?: (value: unknown) => void;
		presets?: Preset<string>[] | Preset<DateRange>[];
		onsubmit?: (event: SubmitEvent) => void;
	} = $props();
</script>

<form {onsubmit}>
	{#if kind === 'single'}
		<DatePicker value={value as string | null} name="due" {disabled} {required} {onchange} presets={presets as Preset<string>[]} />
	{:else}
		<DateRangePicker
			value={value as DateRange | null}
			startName="from"
			endName="to"
			{disabled}
			{required}
			{onchange}
			presets={presets as Preset<DateRange>[]}
		/>
	{/if}
	<button type="submit">Submit</button>
	<button type="reset">Reset</button>
</form>

<script lang="ts">
	import DatePicker from '../DatePicker.svelte';
	import type { DatePickerProps } from '../types';

	let props: DatePickerProps = $props();
</script>

<DatePicker {...props}>
	{#snippet presetList({ presets, select })}
		{#each presets as preset (preset.label)}
			<button type="button" onclick={() => select(preset)}>{preset.label}</button>
		{/each}
	{/snippet}
</DatePicker>

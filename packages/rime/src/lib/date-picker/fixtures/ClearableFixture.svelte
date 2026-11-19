<script lang="ts">
	import DatePicker from '../DatePicker.svelte';

	let {
		value = null,
		disabled = false,
		onchange
	}: { value?: string | null; disabled?: boolean; onchange?: (value: string | null) => void } = $props();
</script>

<form>
	<DatePicker {value} name="due" {disabled} {onchange}>
		{#snippet trigger({ props, label, clear })}
			<button {...props}>{label || 'Choose date'}</button>
			<button type="button" onclick={clear}>Clear</button>
		{/snippet}
	</DatePicker>
	<button type="reset">Reset</button>
</form>

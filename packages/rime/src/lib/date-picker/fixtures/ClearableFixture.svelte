<script lang="ts">
	import DatePicker from '../DatePicker.svelte';

	let { value = null, onchange }: { value?: string | null; onchange?: (value: string | null) => void } =
		$props();
</script>

<form>
	<DatePicker {value} name="due" {onchange}>
		{#snippet trigger({ props, label, clear })}
			<button {...props}>{label || 'Choose date'}</button>
			<button type="button" onclick={clear}>Clear</button>
		{/snippet}
	</DatePicker>
	<button type="reset">Reset</button>
</form>

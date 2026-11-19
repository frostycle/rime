<script lang="ts">
	import DatePicker from '../DatePicker.svelte';
</script>

<form>
	<DatePicker name="due" required>
		{#snippet trigger({ props, label })}
			<div {...props} role="button" data-testid="div-trigger" tabindex="0">{label || 'Choose date'}</div>
		{/snippet}
	</DatePicker>
</form>

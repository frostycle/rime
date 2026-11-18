<script lang="ts">
	import Select from '../Select.svelte';
</script>

<form>
	<Select items={[{ value: 'id', label: 'Indonesia' }]} required>
		{#snippet trigger({ props })}
			<div {...props} data-testid="div-trigger">Pick</div>
		{/snippet}
	</Select>
</form>

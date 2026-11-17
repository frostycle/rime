<script lang="ts">
	import Select from '../Select.svelte';
</script>

<Select items={[{ value: 'id', label: 'Indonesia' }]}>
	{#snippet trigger({ props })}
		<div {...props} data-testid="div-trigger">Pick</div>
	{/snippet}
</Select>

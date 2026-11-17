<script lang="ts">
	import Select from '../Select.svelte';

	let { showLabel = false }: { showLabel?: boolean } = $props();
	const items = [
		{ value: 'id', label: 'Indonesia' },
		{ value: 'jp', label: 'Japan' }
	];
</script>

{#if showLabel}<label for="country">Country</label>{/if}
<Select id="country" {items} />

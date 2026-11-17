<script lang="ts">
	import Select from '../Select.svelte';
	import type { SelectProps } from '../types.js';

	let { value = $bindable(null), ...props }: SelectProps = $props();
</script>

<label for="country">Country</label>
<Select id="country" bind:value {...props} />
<input aria-label="After" />
<output>{value}</output>

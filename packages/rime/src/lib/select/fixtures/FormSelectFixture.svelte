<script lang="ts">
	import Select from '../Select.svelte';
	import type { SelectProps } from '../types.js';

	let {
		value = $bindable(null),
		items = [
			{ value: 'id', label: 'Indonesia' },
			{ value: 'jp', label: 'Japan' }
		],
		...props
	}: Partial<SelectProps> = $props();
</script>

<form>
	<label for="country">Country</label>
	<Select id="country" name="country" {items} bind:value {...props} />
	<button type="reset">Reset</button>
</form>

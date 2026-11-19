<script lang="ts">
	import NativeSelect from '../NativeSelect.svelte';
	import type { NativeSelectProps } from '../types.js';

	let {
		value = $bindable(null),
		items = [
			{ value: 'id', label: 'Indonesia' },
			{ value: 'jp', label: 'Japan' }
		],
		...props
	}: Partial<NativeSelectProps> = $props();
</script>

<form>
	<label for="country">Country</label>
	<NativeSelect id="country" name="country" {items} bind:value {...props} />
	<button type="reset">Reset</button>
</form>
<output>{value}</output>

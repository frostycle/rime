<script lang="ts">
	import Combobox from '../Combobox.svelte';
	import type { ComboboxOption, ComboboxProps } from '../types.js';

	let {
		value = $bindable(null),
		query = $bindable(''),
		all,
		...props
	}: Omit<ComboboxProps, 'items'> & { all: ComboboxOption[] } = $props();

	const visible = $derived(
		all.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))
	);
</script>

<form>
	<label for="timezone">Timezone</label>
	<Combobox id="timezone" name="timezone" items={visible} bind:value bind:query {...props} />
	<button type="reset">Reset</button>
	<span role="status">{value}</span>
	<span data-testid="query">{query}</span>
</form>

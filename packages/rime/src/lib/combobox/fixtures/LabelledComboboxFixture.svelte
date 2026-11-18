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

<label for="timezone">Timezone</label>
<Combobox id="timezone" items={visible} bind:value bind:query {...props} />
<output>{value}</output>
<span data-testid="query">{query}</span>

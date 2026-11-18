<script lang="ts">
	import Combobox from '../Combobox.svelte';
	import type { ComboboxEntry, ComboboxOption, ComboboxProps } from '../types.js';

	let {
		value = $bindable(null),
		query = $bindable(''),
		all,
		...props
	}: Omit<ComboboxProps, 'items'> & { all: ComboboxEntry<ComboboxOption>[] } = $props();

	const visible = $derived(
		all.filter(
			(entry) =>
				'type' in entry || entry.label.toLowerCase().includes(query.toLowerCase())
		)
	);
</script>

<label for="timezone">Timezone</label>
<Combobox id="timezone" items={visible} bind:value bind:query {...props}>
	{#snippet input({ props, open })}
		<input {...props} data-custom-input data-state={open ? 'open' : 'closed'} />
	{/snippet}
	{#snippet button({ props, open })}
		<button {...props} data-custom-button>{open ? 'Hide' : 'Show'}</button>
	{/snippet}
	{#snippet popup({ props, content })}
		<div {...props} data-custom-popup>{@render content()}</div>
	{/snippet}
	{#snippet option({ props, option })}
		<div {...props} data-custom-option>{option.label}</div>
	{/snippet}
	{#snippet separator({ props })}
		<hr {...props} />
	{/snippet}
	{#snippet groupLabel({ props, label })}
		<h4 {...props}>{label}</h4>
	{/snippet}
	{#snippet empty({ query })}
		<p>No timezone matches “{query}”.</p>
	{/snippet}
</Combobox>
<output>{value}</output>
<span data-testid="query">{query}</span>

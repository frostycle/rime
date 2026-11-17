<script lang="ts">
	import Select from '../Select.svelte';

	const items = [
		{ value: 'id', label: 'Indonesia', icon: '*' },
		{ value: 'in', label: 'India', icon: '*' },
		{ type: 'separator' as const },
		{ type: 'group' as const, label: 'Later', items: [{ value: 'th', label: 'Thailand', icon: '*' }] }
	];
</script>

<label for="country">Country</label>
<Select id="country" {items}>
	{#snippet trigger({ props, selected })}
		<button {...props} data-testid="custom-trigger">{selected?.label ?? 'Pick'}</button>
	{/snippet}
	{#snippet popup({ props, content })}
		<section {...props} data-testid="custom-popup">{@render content()}</section>
	{/snippet}
	{#snippet option({ option: entry, props })}
		<div {...props} data-custom><span aria-hidden="true">{entry.icon}</span> {entry.label}</div>
	{/snippet}
	{#snippet separator({ props })}
		<hr {...props} data-testid="custom-separator" />
	{/snippet}
	{#snippet groupLabel({ label, props })}
		<strong {...props} data-testid="custom-group-label">{label}</strong>
	{/snippet}
</Select>

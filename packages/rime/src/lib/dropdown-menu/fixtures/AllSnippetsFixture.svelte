<script lang="ts">
	import DropdownMenu from '../DropdownMenu.svelte';

	const items = [
		{ label: 'Edit', icon: '★' },
		{ type: 'separator' as const },
		{ type: 'group' as const, label: 'Danger', items: [{ label: 'Archive', icon: '■' }] }
	];
</script>

<DropdownMenu {items}>
	{#snippet trigger({ props })}
		<button {...props} data-testid="custom-trigger">Open</button>
	{/snippet}
	{#snippet popup({ props, content })}
		<section {...props} data-testid="custom-popup">{@render content()}</section>
	{/snippet}
	{#snippet item({ item: entry, props })}
		<button {...props} data-testid="custom-item">{entry.icon} {entry.label}</button>
	{/snippet}
	{#snippet separator({ props })}
		<hr {...props} data-testid="custom-separator" />
	{/snippet}
	{#snippet groupLabel({ label, props })}
		<strong {...props} data-testid="custom-group-label">{label}</strong>
	{/snippet}
</DropdownMenu>

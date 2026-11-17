<script lang="ts">
	import { demoCard } from '#lib/styles.js';
	import type { DropdownMenuProps } from '@frostycle/rime/dropdown-menu';
	import AppMenu from './AppMenu.svelte';

	let picked = $state<string | null>(null);

	const pick = (label: string) => () => (picked = label);

	const items: DropdownMenuProps['items'] = [
		{ label: 'Edit', onselect: pick('Edit') },
		{ label: 'Duplicate', onselect: pick('Duplicate') },
		{ label: 'View docs', href: '#usage' },
		{ type: 'separator' },
		{
			type: 'group',
			label: 'Danger zone',
			items: [
				{ label: 'Archive', onselect: pick('Archive') },
				{ label: 'Delete', onselect: pick('Delete'), disabled: true }
			]
		}
	];
</script>

<div class={demoCard}>
	<div class="flex min-h-[260px] flex-col items-start gap-4">
		<AppMenu {items} label="Actions" />
		<p class="m-0 text-sm text-fg-muted">
			<output class="font-mono text-[13px] text-fg">{picked ? `Selected: ${picked}` : 'Nothing selected yet'}</output>
		</p>
	</div>
</div>

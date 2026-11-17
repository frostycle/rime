<script lang="ts">
	import { demoCard } from '#lib/styles.js';
	import type { SelectProps } from '@frostycle/rime/select';
	import AppSelect from './AppSelect.svelte';

	let country = $state<string | null>(null);

	const items: SelectProps['items'] = [
		{ value: 'id', label: 'Indonesia' },
		{ value: 'th', label: 'Thailand' },
		{ type: 'separator' },
		{
			type: 'group',
			label: 'Coming soon',
			items: [{ value: 'vn', label: 'Vietnam', disabled: true }]
		}
	];
</script>

<div class={demoCard}>
	<div class="flex min-h-[260px] flex-col items-start gap-2">
		<label for="country" class="text-sm font-semibold">Country</label>
		<AppSelect id="country" {items} bind:value={country} name="country" placeholder="Choose a country" />
		<p class="m-0 mt-2 text-sm text-fg-muted">
			<output class="font-mono text-[13px] text-fg">value = {country === null ? 'null' : `'${country}'`}</output>
		</p>
	</div>
</div>

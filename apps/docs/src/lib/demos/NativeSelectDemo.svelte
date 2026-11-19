<script lang="ts">
	import { demoCard } from '#lib/styles.js';
	import { NativeSelect, type NativeSelectProps } from '@frostycle/rime/select';

	let country = $state<string | null>(null);

	const items: NativeSelectProps['items'] = [
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
	<div class="flex flex-col items-start gap-2">
		<label for="native-country" class="text-sm font-semibold">Country</label>
		<NativeSelect
			id="native-country"
			{items}
			bind:value={country}
			name="country"
			placeholder="Choose a country"
			classes={{
				select:
					'min-w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 data-hover:bg-gray-50 data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-600 data-disabled:opacity-50 data-invalid:border-red-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:data-hover:bg-gray-700'
			}}
		/>
		<p class="m-0 mt-2 text-sm text-fg-muted">
			<output class="font-mono text-[13px] text-fg">value = {country === null ? 'null' : `'${country}'`}</output>
		</p>
	</div>
</div>

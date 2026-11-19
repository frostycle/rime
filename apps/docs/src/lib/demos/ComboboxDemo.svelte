<script lang="ts">
	import { demoCard } from '#lib/styles.js';
	import type { ComboboxProps } from '@frostycle/rime/combobox';
	import AppCombobox from './AppCombobox.svelte';

	let timezone = $state<string | null>(null);
	let query = $state('');

	const timezones: ComboboxProps['items'] = Intl.supportedValuesOf('timeZone').map((zone) => ({
		value: zone,
		label: zone
	}));

	const contains = (label: string, text: string) => {
		const plain = (value: string) => value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
		return plain(label).includes(plain(text));
	};

	const visible = $derived(timezones.filter((entry) => 'label' in entry && contains(entry.label, query)));
</script>

<div class={demoCard}>
	<div class="flex min-h-[320px] flex-col items-start gap-2">
		<label for="timezone" class="text-sm font-semibold">Timezone</label>
		<AppCombobox
			id="timezone"
			items={visible}
			bind:value={timezone}
			bind:query
			name="timezone"
			placeholder="Search timezones"
		/>
		<p class="m-0 mt-2 text-sm text-fg-muted">
			<output class="font-mono text-[13px] text-fg">value = {timezone === null ? 'null' : `'${timezone}'`}</output>
		</p>
	</div>
</div>

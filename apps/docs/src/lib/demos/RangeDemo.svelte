<script lang="ts">
	import type { DateRange } from '@frostycle/rime/date-picker';
	import DateField from './DateField.svelte';
	import DateRangeField from './DateRangeField.svelte';

	let kind = $state<'range' | 'single'>('range');
	let range = $state<DateRange | null>({ start: '2026-10-05', end: '2026-10-08' });
	let single = $state<string | null>('2026-10-05');

	const bound = $derived(
		kind === 'range' ? (range ? `${range.start} to ${range.end}` : 'none') : (single ?? 'none')
	);
	const tab = 'min-h-10 cursor-pointer rounded-lg px-3.5 text-sm font-semibold aria-pressed:bg-surface aria-pressed:shadow-sm';
</script>

<div class="rounded-2xl border border-line bg-surface p-6">
	<div role="group" aria-label="Picker type" class="inline-flex gap-1 rounded-xl bg-desk p-1">
		<button type="button" class={tab} aria-pressed={kind === 'range'} onclick={() => (kind = 'range')}>Range</button>
		<button type="button" class={tab} aria-pressed={kind === 'single'} onclick={() => (kind = 'single')}>Single</button>
	</div>
	<div class="mt-4 flex min-h-[420px] flex-col items-start gap-4">
		{#if kind === 'range'}
			<DateRangeField bind:value={range} />
		{:else}
			<DateField bind:value={single} />
		{/if}
		<p class="m-0 text-sm text-fg-muted">
			Bound value: <output class="font-mono text-[13px] text-fg">{bound}</output>
		</p>
	</div>
</div>

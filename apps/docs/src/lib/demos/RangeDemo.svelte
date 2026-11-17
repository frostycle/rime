<script lang="ts">
	import type { DateRange } from '@frostycle/rime/date-picker';
	import DateRangeField from './DateRangeField.svelte';

	let value = $state<DateRange | null>({ start: '2026-10-05', end: '2026-10-08' });
</script>

<div class="flex min-h-[460px] flex-col items-start gap-4 rounded-2xl border border-line bg-surface p-6">
	<DateRangeField bind:value months={1} />
	<p class="m-0 text-sm text-fg-muted">
		Bound value:
		<output class="font-mono text-[13px] text-fg">{value ? `${value.start} to ${value.end}` : 'none'}</output>
	</p>
</div>

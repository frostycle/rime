<script lang="ts">
	import type { KeyDoc } from '#lib/reference/types.js';

	let { keys }: { keys: KeyDoc[] } = $props();
</script>

<dl class="m-0 overflow-hidden rounded-2xl border border-line bg-surface">
	{#each keys as { keys: combination, action } (combination)}
		<div class="flex flex-wrap gap-x-5 gap-y-1 border-b border-line px-4 py-[11px] text-sm last:border-b-0">
			<dt class="flex-[0_0_220px]">
				<kbd class="rounded-md border border-line bg-code px-[7px] py-0.5 font-mono text-xs">{combination}</kbd>
			</dt>
			<dd class="m-0 flex-[1_1_260px] text-fg-muted">{action}</dd>
		</div>
	{/each}
</dl>

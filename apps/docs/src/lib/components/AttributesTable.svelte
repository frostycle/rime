<script lang="ts">
	import type { AttributeDoc } from '#lib/reference/types.js';

	let { attributes }: { attributes: AttributeDoc[] } = $props();
	const heading = 'border-b border-line px-4 py-3 text-xs font-semibold text-fg-muted';
</script>

<div class="overflow-x-auto rounded-2xl border border-line bg-surface">
	<table class="w-full min-w-[480px] border-collapse text-left text-sm">
		<thead>
			<tr>
				<th scope="col" class={heading}>Element</th>
				<th scope="col" class={heading}>Attributes</th>
			</tr>
		</thead>
		<tbody>
			{#each attributes as { element, attributes: names } (element)}
				<tr>
					<td class="border-b border-line px-4 py-[11px] whitespace-nowrap">{element}</td>
					<td class="border-b border-line px-4 py-[11px]"><code class="font-mono text-xs">{names}</code></td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

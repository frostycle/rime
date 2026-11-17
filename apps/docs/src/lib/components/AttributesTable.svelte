<script lang="ts">
	import type { AttributeDoc } from '#lib/reference/types.js';

	let { attributes, label }: { attributes: AttributeDoc[]; label: string } = $props();
	const heading = 'border-b border-line px-4 py-3 text-xs font-semibold text-fg-muted';
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -- keyboard users need focus to scroll the table -->
<div class="overflow-x-auto rounded-2xl border border-line bg-surface" role="group" aria-label={label} tabindex="0">
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

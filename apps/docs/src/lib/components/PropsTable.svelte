<script lang="ts">
	import type { PropDoc, ReferenceOf, SnippetDoc } from '#lib/reference/types.js';

	let { reference, label }: { reference: ReferenceOf<object>; label: string } = $props();

	const isPropDoc = (doc: PropDoc | SnippetDoc): doc is PropDoc => 'type' in doc;

	const rows = $derived(
		Object.entries(reference as Record<string, PropDoc | SnippetDoc>).flatMap(([name, doc]) =>
			isPropDoc(doc) ? [{ name, doc }] : []
		)
	);
	const showAppliesTo = $derived(rows.some((row) => row.doc.appliesTo));
	const heading = 'border-b border-line px-4 py-3 text-xs font-semibold text-fg-muted';
	const cell = 'border-b border-line px-4 py-[11px]';
</script>

<div class="overflow-x-auto rounded-2xl border border-line bg-surface">
	<table class="w-full min-w-[560px] border-collapse text-left text-sm">
		<caption class="sr-only">{label}</caption>
		<thead>
			<tr>
				<th scope="col" class={heading}>Prop</th>
				<th scope="col" class={heading}>Type</th>
				{#if showAppliesTo}<th scope="col" class={heading}>Applies to</th>{/if}
				<th scope="col" class={heading}>Notes</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as { name, doc } (name)}
				<tr>
					<td class="{cell} whitespace-nowrap"><code class="font-mono text-[13px] text-accent-fg">{name}</code></td>
					<td class={cell}><code class="font-mono text-xs">{doc.type}</code></td>
					{#if showAppliesTo}<td class="{cell} text-fg-muted">{doc.appliesTo ?? ''}</td>{/if}
					<td class="{cell} text-fg-muted">
						{doc.notes}
						{#if doc.default}Default <code class="font-mono text-xs">{doc.default}</code>.{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<script lang="ts">
	import type { PropDoc, ReferenceOf, SnippetDoc } from '#lib/reference/types.js';

	let { reference }: { reference: ReferenceOf<object> } = $props();

	const isSnippetDoc = (doc: PropDoc | SnippetDoc): doc is SnippetDoc => 'args' in doc;

	const snippets = $derived(
		Object.entries(reference as Record<string, PropDoc | SnippetDoc>).flatMap(([name, doc]) =>
			isSnippetDoc(doc) ? [{ name, doc }] : []
		)
	);
</script>

<ul class="m-0 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
	{#each snippets as { name, doc } (name)}
		<li class="rounded-xl border border-line bg-surface p-4">
			<code class="font-mono text-[13px] font-semibold text-accent-fg">{name}</code>
			<p class="m-0 mt-1.5 font-mono text-xs text-fg-muted">{doc.args}</p>
			{#if doc.notes}<p class="m-0 mt-1.5 text-sm text-fg-muted">{doc.notes}</p>{/if}
		</li>
	{/each}
</ul>

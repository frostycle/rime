<script lang="ts">
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import DocSection from '#lib/components/DocSection.svelte';
	import { inlineCode, prose } from '#lib/styles.js';

	type RecipeFile = { code: string; label: string };

	let { variant, files }: { variant: string; files: RecipeFile[] } = $props();
</script>

<DocSection id="recipe" title="Tailwind recipe">
	<p class={prose}>
		The library ships no Tailwind classes, so there is nothing to configure or override. Copy this wrapper into your
		project and own it. It needs Tailwind CSS v4, whose bare <code class={inlineCode}>{variant}:</code> variants it
		uses; in v3 write <code class={inlineCode}>{`data-[${variant.replace('data-', '')}]:`}</code>.
	</p>
	{#each files as file (file.label)}
		<div class="mt-4"><CodeBlock code={file.code} label={file.label} /></div>
	{/each}
</DocSection>

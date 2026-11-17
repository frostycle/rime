<script lang="ts">
	import type { Snippet } from 'svelte';
	import AttributesTable from '#lib/components/AttributesTable.svelte';
	import DocSection from '#lib/components/DocSection.svelte';
	import KeyboardTable from '#lib/components/KeyboardTable.svelte';
	import PropsTable from '#lib/components/PropsTable.svelte';
	import SnippetList from '#lib/components/SnippetList.svelte';
	import type { ComponentReference } from '#lib/reference/types.js';
	import { inlineCode, prose } from '#lib/styles.js';

	let {
		reference,
		name,
		snippetsNote,
		keyboardNote,
		attributesNote
	}: {
		reference: ComponentReference<object>;
		name: string;
		snippetsNote?: Snippet;
		keyboardNote?: Snippet;
		attributesNote?: Snippet;
	} = $props();
</script>

<DocSection id="props" title="Props">
	<div class="mt-4"><PropsTable reference={reference.props} label={`${name} props`} /></div>
</DocSection>

<DocSection id="snippets" title="Snippets">
	<p class={prose}>All optional. Spread each <code class={inlineCode}>props</code> onto your element.</p>
	<div class="mt-4"><SnippetList reference={reference.props} /></div>
	{@render snippetsNote?.()}
</DocSection>

<DocSection id="keyboard" title="Keyboard">
	{@render keyboardNote?.()}
	<div class="mt-4"><KeyboardTable keys={reference.keyboard} /></div>
</DocSection>

<DocSection id="attributes" title="State attributes">
	<p class={prose}>
		Style state with <code class={inlineCode}>data-*</code> attributes rather than props. They are present or absent,
		with no value.{#if attributesNote}{' '}{@render attributesNote()}{/if}
	</p>
	<div class="mt-4">
		<AttributesTable attributes={reference.attributes} label={`${name} state attributes`} />
	</div>
</DocSection>

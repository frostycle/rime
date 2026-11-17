<script lang="ts">
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import DocSection from '#lib/components/DocSection.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import { inlineCode, prose } from '#lib/styles.js';

	const subpaths = [
		{ path: '@frostycle/rime/date-picker', exports: 'DatePicker, DateRangePicker and the date helpers' },
		{ path: '@frostycle/rime/dropdown-menu', exports: 'DropdownMenu' },
		{ path: '@frostycle/rime/select', exports: 'Select' }
	];

	const example = `<script>
	import { DatePicker } from '@frostycle/rime/date-picker';

	let due = $state(null);
<\/script>

<DatePicker bind:value={due} />`;
</script>

<svelte:head>
	<title>Installation | Rime</title>
</svelte:head>

<PageHeader title="Installation" eyebrow="Getting started">
	{#snippet lede()}
		One package, three subpath imports, and no stylesheet to load.
	{/snippet}
</PageHeader>

<DocSection id="install" title="Install">
	<div class="mt-4 grid gap-3">
		<CodeBlock code="pnpm add @frostycle/rime" label="Install with pnpm" />
		<CodeBlock code="npm install @frostycle/rime" label="Install with npm" />
		<CodeBlock code="yarn add @frostycle/rime" label="Install with yarn" />
	</div>
</DocSection>

<DocSection id="requirements" title="Requirements">
	<p class={prose}>
		Svelte <code class={inlineCode}>^5.29.0</code> is a peer dependency. The popups use the native
		<code class={inlineCode}>popover</code> attribute, so browsers need to support it (Baseline 2024). The automated
		browser suite runs on Chromium, WebKit and Firefox.
	</p>
</DocSection>

<DocSection id="imports" title="Imports">
	<p class={prose}>Each component has its own subpath, so you only import what you use.</p>
	<ul class="mt-4 grid list-none gap-3 p-0">
		{#each subpaths as { path, exports } (path)}
			<li class="rounded-xl border border-line bg-surface p-4">
				<code class="font-mono text-[13px] font-semibold text-accent-fg">{path}</code>
				<p class="m-0 mt-1.5 text-sm text-fg-muted">{exports}</p>
			</li>
		{/each}
	</ul>
</DocSection>

<DocSection id="example" title="A first picker">
	<p class={prose}>
		Values are <code class={inlineCode}>YYYY-MM-DD</code> strings. With no classes it renders unstyled, so continue
		with <a class="text-accent-fg underline" href="/styling">Styling with Tailwind</a>.
	</p>
	<div class="mt-4"><CodeBlock code={example} label="Minimal date picker" /></div>
</DocSection>

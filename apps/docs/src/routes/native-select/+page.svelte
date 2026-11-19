<script lang="ts">
	import AttributesTable from '#lib/components/AttributesTable.svelte';
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import DocSection from '#lib/components/DocSection.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import PropsTable from '#lib/components/PropsTable.svelte';
	import NativeSelectDemo from '#lib/demos/NativeSelectDemo.svelte';
	import { nativeSelect } from '#lib/reference/native-select.js';
	import { inlineCode, prose } from '#lib/styles.js';

	const usage = `<script>
	import { NativeSelect } from '@frostycle/rime/select';

	let country = $state(null);

	const items = [
		{ value: 'id', label: 'Indonesia' },
		{ value: 'th', label: 'Thailand' }
	];
<\/script>

<label for="country">Country</label>
<NativeSelect id="country" {items} bind:value={country} name="country" placeholder="Choose a country" />`;

	const touch = `<script>
	import { MediaQuery } from 'svelte/reactivity';
	import { NativeSelect, Select } from '@frostycle/rime/select';

	const coarse = new MediaQuery('(pointer: coarse)', false);
<\/script>

<label for="country">Country</label>
{#if coarse.current}
	<NativeSelect id="country" {items} bind:value={country} name="country" />
{:else}
	<Select id="country" {items} bind:value={country} name="country" />
{/if}`;
</script>

<svelte:head>
	<title>Native select | Rime</title>
</svelte:head>

<PageHeader title="Native select">
	{#snippet lede()}
		A real <code class={inlineCode}>&lt;select&gt;</code> that takes the same items as
		<a href="/select">Select</a> and submits the same form data. On phones and tablets it opens the operating system's
		own picker.
	{/snippet}
</PageHeader>

<DocSection id="demo" title="Live demo">
	<p class={prose}>Pick a country and watch the bound value change. The open list is drawn by your browser.</p>
	<div class="mt-4"><NativeSelectDemo /></div>
</DocSection>

<DocSection id="usage" title="Usage">
	<p class={prose}>
		The items are Select's: options, separators and labelled groups. Swapping one component for the other with the
		same props keeps the value, the submitted data and what a form reset restores.
	</p>
	<div class="mt-4"><CodeBlock code={usage} label="Native select usage" /></div>
</DocSection>

<DocSection id="touch" title="Native on touch devices">
	<p class={prose}>
		Neither component detects the device. To use the operating system's picker on touch screens, choose the
		component with a media query in your app.
	</p>
	<div class="mt-4"><CodeBlock code={touch} label="Native select on touch devices" /></div>
	<p class={prose}>
		The query is unknown on the server, so it falls back to <code class={inlineCode}>false</code>: touch devices get
		Select until the page hydrates, then switch. Style both the same way to keep the swap from shifting the layout.
	</p>
</DocSection>

<DocSection id="props" title="Props">
	<div class="mt-4"><PropsTable reference={nativeSelect.props} label="Native select props" /></div>
</DocSection>

<DocSection id="attributes" title="State attributes">
	<p class={prose}>
		Style state with <code class={inlineCode}>data-*</code> attributes rather than props. They are present or absent,
		with no value. The browser handles the keyboard.
	</p>
	<div class="mt-4">
		<AttributesTable attributes={nativeSelect.attributes} label="Native select state attributes" />
	</div>
</DocSection>

<DocSection id="forms" title="Forms">
	<p class={prose}>
		With <code class={inlineCode}>name</code>, a hidden input carries the value, empty when it is
		<code class={inlineCode}>null</code>, so the form data matches Select's. A form reset restores the value from when
		the component mounted. With <code class={inlineCode}>required</code>, the browser blocks submit while nothing is
		chosen and shows its message on the select. <code class={inlineCode}>data-invalid</code> appears once a validity
		check fails and stays while the field is empty, until a reset.
	</p>
</DocSection>

<DocSection id="behaviour" title="Behaviour to plan for">
	<p class={prose}>
		<code class={inlineCode}>classes.select</code> styles the closed control only; the open list belongs to the
		operating system. Snippets are not available, because a native option holds only text.
	</p>
	<p class={prose}>
		Select treats an option whose value is <code class={inlineCode}>''</code> as missing under
		<code class={inlineCode}>required</code>. A native select accepts it once picked, so avoid empty values in
		required fields.
	</p>
</DocSection>

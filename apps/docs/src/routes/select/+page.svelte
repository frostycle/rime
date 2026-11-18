<script lang="ts">
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import DocSection from '#lib/components/DocSection.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import RecipeSection from '#lib/components/RecipeSection.svelte';
	import ReferenceSections from '#lib/components/ReferenceSections.svelte';
	import SelectDemo from '#lib/demos/SelectDemo.svelte';
	import selectClasses from '#lib/demos/select-classes.ts?raw';
	import recipe from '#lib/demos/AppSelect.svelte?raw';
	import { select } from '#lib/reference/select.js';
	import { inlineCode, prose } from '#lib/styles.js';

	const usage = `<script>
	import { Select } from '@frostycle/rime/select';

	let country = $state(null);

	const items = [
		{ value: 'id', label: 'Indonesia' },
		{ value: 'th', label: 'Thailand' },
		{ type: 'separator' },
		{
			type: 'group',
			label: 'Coming soon',
			items: [{ value: 'vn', label: 'Vietnam', disabled: true }]
		}
	];
<\/script>

<label for="country">Country</label>
<Select id="country" {items} bind:value={country} name="country" placeholder="Choose a country" />`;

	const recipeUsage = '<AppSelect id="country" {items} bind:value={country} name="country" />';
</script>

<svelte:head>
	<title>Select | Rime</title>
</svelte:head>

<PageHeader title="Select">
	{#snippet lede()}
		A form field that picks one value from a list of options, defined as data. It follows the select-only combobox
		pattern, so keyboard and screen reader users get the behaviour of a native select.
	{/snippet}
</PageHeader>

<DocSection id="demo" title="Live demo">
	<p class={prose}>
		This is the Tailwind wrapper from the recipe below, running. Pick a country and watch the bound value change.
	</p>
	<div class="mt-4"><SelectDemo /></div>
</DocSection>

<DocSection id="usage" title="Usage">
	<p class={prose}>
		An option is <code class={inlineCode}>{'{ value, label, disabled? }'}</code>. A
		<code class={inlineCode}>value</code> with no matching option shows the placeholder and marks nothing selected; the
		component does not reset it.
	</p>
	<div class="mt-4"><CodeBlock code={usage} label="Select usage" /></div>
</DocSection>

<DocSection id="labelling" title="Labelling">
	<p class={prose}>
		Every select needs a <code class={inlineCode}>&lt;label for&gt;</code> pointing at its
		<code class={inlineCode}>id</code>; a combobox does not take its name from its text. Use
		<code class={inlineCode}>&lt;label for&gt;</code> rather than a wrapping
		<code class={inlineCode}>&lt;label&gt;</code>: a wrapping label's text includes the trigger's own text, which would
		put the current value into the list's accessible name. Clicking the label focuses the trigger without opening the
		list. A custom <code class={inlineCode}>trigger</code> snippet must keep the spread
		<code class={inlineCode}>id</code>.
	</p>
	<p class={prose}>
		The list takes its name from the label text when it opens. Naming a custom trigger only with
		<code class={inlineCode}>aria-label</code> or <code class={inlineCode}>aria-labelledby</code> leaves the list
		unnamed, so keep a <code class={inlineCode}>&lt;label for&gt;</code> even then.
	</p>
</DocSection>

<ReferenceSections reference={select} name="Select">
	{#snippet snippetsNote()}
		<p class={prose}>
			Separators render with <code class={inlineCode}>role="none"</code> inside the list, since a listbox may contain
			only options and groups.
		</p>
	{/snippet}
	{#snippet keyboardNote()}
		<p class={prose}>
			Focus stays on the trigger; the highlighted option is announced through
			<code class={inlineCode}>aria-activedescendant</code>. Disabled options are skipped, and hovering an enabled
			option highlights it, so pointer and keyboard share one highlight.
		</p>
	{/snippet}
</ReferenceSections>

<DocSection id="forms" title="Forms">
	<p class={prose}>
		With <code class={inlineCode}>name</code>, a hidden input carries the value, empty when it is
		<code class={inlineCode}>null</code>. A form <code class={inlineCode}>reset</code> restores the value from when the
		component mounted. With <code class={inlineCode}>required</code>, the browser blocks submit while nothing is
		chosen and focus returns to the trigger. <code class={inlineCode}>data-invalid</code> appears only after a failed
		submit, until a pick or a reset.
	</p>
</DocSection>

<RecipeSection
	variant="data-selected"
	files={[
		{ code: selectClasses, label: 'select-classes.ts' },
		{ code: recipe, label: 'AppSelect.svelte' },
		{ code: recipeUsage, label: 'Using AppSelect' }
	]}
/>

<DocSection id="behaviour" title="Behaviour to plan for">
	<p class={prose}>
		Disabling an open select closes it and disables the trigger, so focus falls to
		<code class={inlineCode}>&lt;body&gt;</code>. Move focus yourself if you disable a select while it is in use.
	</p>
</DocSection>

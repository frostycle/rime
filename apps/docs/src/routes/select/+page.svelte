<script lang="ts">
	import AttributesTable from '#lib/components/AttributesTable.svelte';
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import KeyboardTable from '#lib/components/KeyboardTable.svelte';
	import PropsTable from '#lib/components/PropsTable.svelte';
	import SnippetList from '#lib/components/SnippetList.svelte';
	import SelectDemo from '#lib/demos/SelectDemo.svelte';
	import selectClasses from '#lib/demos/select-classes.ts?raw';
	import recipe from '#lib/demos/AppSelect.svelte?raw';
	import { select } from '#lib/reference/select.js';

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

	const h2 = 'mt-14 text-2xl font-bold tracking-tight';
	const prose = 'mt-3 max-w-prose leading-relaxed text-fg-muted';
	const inlineCode = 'font-mono text-[13px] text-fg';
</script>

<svelte:head>
	<title>Select | Rime</title>
</svelte:head>

<p class="text-sm font-semibold text-accent-fg">Components</p>
<h1 class="mt-2 text-4xl font-bold tracking-tight">Select</h1>
<p class="mt-3.5 max-w-2xl text-lg leading-relaxed text-fg-muted">
	A form field that picks one value from a list of options, defined as data. It follows the select-only combobox
	pattern, so keyboard and screen reader users get the behaviour of a native select.
</p>

<section aria-labelledby="demo">
	<h2 id="demo" class={h2}>Live demo</h2>
	<p class={prose}>
		This is the Tailwind wrapper from the recipe below, running. Pick a country and watch the bound value change.
	</p>
	<div class="mt-4"><SelectDemo /></div>
</section>

<section aria-labelledby="usage">
	<h2 id="usage" class={h2}>Usage</h2>
	<p class={prose}>
		An option is <code class={inlineCode}>{'{ value, label, disabled? }'}</code>. A
		<code class={inlineCode}>value</code> with no matching option shows the placeholder and marks nothing selected; the
		component does not reset it.
	</p>
	<div class="mt-4"><CodeBlock code={usage} label="Select usage" /></div>
</section>

<section aria-labelledby="labelling">
	<h2 id="labelling" class={h2}>Labelling</h2>
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
</section>

<section aria-labelledby="props">
	<h2 id="props" class={h2}>Props</h2>
	<div class="mt-4"><PropsTable reference={select.props} label="Select props" /></div>
</section>

<section aria-labelledby="snippets">
	<h2 id="snippets" class={h2}>Snippets</h2>
	<p class={prose}>All optional. Spread each <code class={inlineCode}>props</code> onto your element.</p>
	<div class="mt-4"><SnippetList reference={select.props} /></div>
</section>

<section aria-labelledby="keyboard">
	<h2 id="keyboard" class={h2}>Keyboard</h2>
	<p class={prose}>
		Focus stays on the trigger; the highlighted option is announced through
		<code class={inlineCode}>aria-activedescendant</code>. Disabled options are skipped, and hovering an enabled option
		highlights it, so pointer and keyboard share one highlight.
	</p>
	<div class="mt-4"><KeyboardTable keys={select.keyboard} /></div>
</section>

<section aria-labelledby="attributes">
	<h2 id="attributes" class={h2}>State attributes</h2>
	<p class={prose}>
		Style state with <code class={inlineCode}>data-*</code> attributes rather than props. They are present or absent,
		with no value.
	</p>
	<div class="mt-4"><AttributesTable attributes={select.attributes} label="Select state attributes" /></div>
</section>

<section aria-labelledby="forms">
	<h2 id="forms" class={h2}>Forms</h2>
	<p class={prose}>
		With <code class={inlineCode}>name</code>, a hidden input carries the value, empty when it is
		<code class={inlineCode}>null</code>. A form <code class={inlineCode}>reset</code> restores the value from when the
		component mounted. <code class={inlineCode}>required</code> and browser validation are not supported yet.
	</p>
</section>

<section aria-labelledby="recipe">
	<h2 id="recipe" class={h2}>Tailwind recipe</h2>
	<p class={prose}>
		The library ships no Tailwind classes. Copy this wrapper into your project and own it. It needs Tailwind CSS v4,
		whose bare <code class={inlineCode}>data-selected:</code> variants it uses; in v3 write
		<code class={inlineCode}>data-[selected]:</code>.
	</p>
	<div class="mt-4"><CodeBlock code={selectClasses} label="select-classes.ts" /></div>
	<div class="mt-4"><CodeBlock code={recipe} label="AppSelect.svelte" /></div>
	<div class="mt-4"><CodeBlock code={recipeUsage} label="Using AppSelect" /></div>
</section>

<section aria-labelledby="behaviour">
	<h2 id="behaviour" class={h2}>Behaviour to plan for</h2>
	<p class={prose}>
		Disabling an open select closes it and disables the trigger, so focus falls to
		<code class={inlineCode}>&lt;body&gt;</code>. Move focus yourself if you disable a select while it is in use.
	</p>
</section>

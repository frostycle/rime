<script lang="ts">
	import AttributesTable from '#lib/components/AttributesTable.svelte';
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import KeyboardTable from '#lib/components/KeyboardTable.svelte';
	import PropsTable from '#lib/components/PropsTable.svelte';
	import SnippetList from '#lib/components/SnippetList.svelte';
	import MenuDemo from '#lib/demos/MenuDemo.svelte';
	import menuClasses from '#lib/demos/menu-classes.ts?raw';
	import recipe from '#lib/demos/AppMenu.svelte?raw';
	import { dropdownMenu } from '#lib/reference/dropdown-menu.js';

	const usage = `<script>
	import { DropdownMenu } from '@frostycle/rime/dropdown-menu';

	const items = [
		{ label: 'Edit', onselect: edit },
		{ label: 'View docs', href: '/docs' },
		{ type: 'separator' },
		{
			type: 'group',
			label: 'Danger zone',
			items: [{ label: 'Delete', onselect: remove, disabled: !canDelete }]
		}
	];
<\/script>

<DropdownMenu {items} label="Actions" />`;

	const recipeUsage = '<AppMenu {items} label="Actions" />';

	const h2 = 'mt-14 text-2xl font-bold tracking-tight';
	const prose = 'mt-3 max-w-prose leading-relaxed text-fg-muted';
	const inlineCode = 'font-mono text-[13px] text-fg';
</script>

<svelte:head>
	<title>Dropdown menu | Rime</title>
</svelte:head>

<p class="text-sm font-semibold text-accent-fg">Components</p>
<h1 class="mt-2 text-4xl font-bold tracking-tight">Dropdown menu</h1>
<p class="mt-3.5 max-w-2xl text-lg leading-relaxed text-fg-muted">
	A button that opens a list of actions and links, defined as data and fully usable by keyboard.
</p>

<section aria-labelledby="demo">
	<h2 id="demo" class={h2}>Live demo</h2>
	<p class={prose}>
		This is the Tailwind wrapper from the recipe below, running. Pick an item and the result appears underneath.
	</p>
	<div class="mt-4"><MenuDemo /></div>
</section>

<section aria-labelledby="usage">
	<h2 id="usage" class={h2}>Usage</h2>
	<p class={prose}>
		Items are plain objects: an action has <code class={inlineCode}>onselect</code>, a link has
		<code class={inlineCode}>href</code>. Selecting an item closes the menu and returns focus to the trigger, then calls
		<code class={inlineCode}>onselect</code>, so a handler that opens a dialog can take focus.
	</p>
	<div class="mt-4"><CodeBlock code={usage} label="Dropdown menu usage" /></div>
	<p class={prose}>
		A <code class={inlineCode}>MenuItem</code> is
		<code class={inlineCode}>{'{ label, onselect?, href?, target?, rel?, disabled? }'}</code>. An item with
		<code class={inlineCode}>href</code> is a link, and a disabled link renders without
		<code class={inlineCode}>href</code>.
	</p>
</section>

<section aria-labelledby="props">
	<h2 id="props" class={h2}>Props</h2>
	<div class="mt-4"><PropsTable reference={dropdownMenu.props} label="Dropdown menu props" /></div>
</section>

<section aria-labelledby="snippets">
	<h2 id="snippets" class={h2}>Snippets</h2>
	<p class={prose}>All optional. Spread each <code class={inlineCode}>props</code> onto your element.</p>
	<div class="mt-4"><SnippetList reference={dropdownMenu.props} /></div>
</section>

<section aria-labelledby="keyboard">
	<h2 id="keyboard" class={h2}>Keyboard</h2>
	<div class="mt-4"><KeyboardTable keys={dropdownMenu.keyboard} /></div>
	<p class={prose}>
		Disabled items are skipped. Hovering an enabled item moves focus to it, so pointer and keyboard share one current
		item.
	</p>
</section>

<section aria-labelledby="attributes">
	<h2 id="attributes" class={h2}>State attributes</h2>
	<p class={prose}>
		Style state with <code class={inlineCode}>data-*</code> attributes rather than props. They are present or absent,
		with no value.
	</p>
	<div class="mt-4">
		<AttributesTable attributes={dropdownMenu.attributes} label="Dropdown menu state attributes" />
	</div>
</section>

<section aria-labelledby="recipe">
	<h2 id="recipe" class={h2}>Tailwind recipe</h2>
	<p class={prose}>
		The library ships no Tailwind classes. Copy this wrapper into your project and own it. It needs Tailwind CSS v4,
		whose bare <code class={inlineCode}>data-hover:</code> variants it uses; in v3 write
		<code class={inlineCode}>data-[hover]:</code>.
	</p>
	<div class="mt-4"><CodeBlock code={menuClasses} label="menu-classes.ts" /></div>
	<div class="mt-4"><CodeBlock code={recipe} label="AppMenu.svelte" /></div>
	<div class="mt-4"><CodeBlock code={recipeUsage} label="Using AppMenu" /></div>
</section>

<section aria-labelledby="behaviour">
	<h2 id="behaviour" class={h2}>Behaviour to plan for</h2>
	<ul class="mt-3 max-w-prose list-disc space-y-2 ps-5 leading-relaxed text-fg-muted">
		<li>
			Clicks inside the menu bubble like any native click. If a parent such as a table row handles clicks, stop them on
			a wrapper around the menu.
		</li>
		<li>
			Disabling an open menu closes it and disables the trigger, so focus falls to
			<code class={inlineCode}>&lt;body&gt;</code>. Move focus yourself if you disable a menu while it is in use.
		</li>
		<li>
			Items have no ids, so a recreated list matches the focused item by label. If labels repeat and the list also
			reorders, focus can land on the other item with that label.
		</li>
	</ul>
</section>

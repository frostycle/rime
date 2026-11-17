<script lang="ts">
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import DocSection from '#lib/components/DocSection.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import RecipeSection from '#lib/components/RecipeSection.svelte';
	import ReferenceSections from '#lib/components/ReferenceSections.svelte';
	import MenuDemo from '#lib/demos/MenuDemo.svelte';
	import menuClasses from '#lib/demos/menu-classes.ts?raw';
	import recipe from '#lib/demos/AppMenu.svelte?raw';
	import { dropdownMenu } from '#lib/reference/dropdown-menu.js';
	import { inlineCode, prose } from '#lib/styles.js';

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

</script>

<svelte:head>
	<title>Dropdown menu | Rime</title>
</svelte:head>

<PageHeader title="Dropdown menu">
	{#snippet lede()}
		A button that opens a list of actions and links, defined as data and fully usable by keyboard.
	{/snippet}
</PageHeader>

<DocSection id="demo" title="Live demo">
	<p class={prose}>
		This is the Tailwind wrapper from the recipe below, running. Pick an item and the result appears underneath.
	</p>
	<div class="mt-4"><MenuDemo /></div>
</DocSection>

<DocSection id="usage" title="Usage">
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
</DocSection>

<ReferenceSections reference={dropdownMenu} name="Dropdown menu">
	{#snippet keyboardNote()}
		<p class={prose}>
			Disabled items are skipped. Hovering an enabled item moves focus to it, so pointer and keyboard share one
			current item.
		</p>
	{/snippet}
</ReferenceSections>

<RecipeSection
	variant="data-hover"
	files={[
		{ code: menuClasses, label: 'menu-classes.ts' },
		{ code: recipe, label: 'AppMenu.svelte' },
		{ code: recipeUsage, label: 'Using AppMenu' }
	]}
/>

<DocSection id="behaviour" title="Behaviour to plan for">
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
</DocSection>

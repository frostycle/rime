<script lang="ts">
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import DocSection from '#lib/components/DocSection.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import RecipeSection from '#lib/components/RecipeSection.svelte';
	import StylingAnatomy from '#lib/demos/StylingAnatomy.svelte';
	import pickerClasses from '#lib/demos/picker-classes.ts?raw';
	import recipe from '#lib/demos/DateRangeField.svelte?raw';
	import { inlineCode, prose } from '#lib/styles.js';

	const recipeUsage = '<DateRangeField bind:value={period} months={2} {presets} />';
	const animateUsage = `<DatePicker transition classes={{ popup: 'transition duration-150 data-closed:opacity-0' }} />`;
</script>

<svelte:head>
	<title>Styling with Tailwind | Rime</title>
</svelte:head>

<PageHeader title="Styling with Tailwind" eyebrow="Getting started">
	{#snippet lede()}
		The library sets no colours and ships no classes, so there is nothing to override. Write one styled wrapper per
		project and reuse it.
	{/snippet}
</PageHeader>

<DocSection id="anatomy" title="Date picker anatomy">
	<p class={prose}>
		Each key in <code class={inlineCode}>classes</code> reaches one default-rendered element. Choose a key to find it.
	</p>
	<div class="mt-4"><StylingAnatomy /></div>
</DocSection>

<RecipeSection
	variant="data-selected"
	files={[
		{ code: pickerClasses, label: 'picker-classes.ts' },
		{ code: recipe, label: 'DateRangeField.svelte' },
		{ code: recipeUsage, label: 'Using DateRangeField' }
	]}
/>

<DocSection id="dark-mode" title="Dark mode">
	<p class={prose}>
		Dark mode belongs in the wrapper: the library sets no colours, so it has no theme prop. The recipe above pairs
		each colour with a <code class={inlineCode}>dark:</code> variant.
	</p>
</DocSection>

<DocSection id="animate" title="Animating the popup">
	<p class={prose}>
		Add <code class={inlineCode}>transition</code> to keep the popup mounted until its CSS transition or animation
		ends. Style the closed state with <code class={inlineCode}>data-closed</code>, which applies at the start of
		entering and throughout leaving.
	</p>
	<div class="mt-4"><CodeBlock code={animateUsage} label="Popup transition example" /></div>
	<p class={prose}>
		Use <code class={inlineCode}>data-enter</code> and <code class={inlineCode}>data-leave</code> for different timing
		in each direction. Without <code class={inlineCode}>transition</code>, the popup unmounts as soon as it closes.
		Honour reduced motion in your own CSS, for example with
		<code class={inlineCode}>motion-reduce:transition-none</code>.
	</p>
</DocSection>

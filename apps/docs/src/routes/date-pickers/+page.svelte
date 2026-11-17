<script lang="ts">
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import DocSection from '#lib/components/DocSection.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import RecipeSection from '#lib/components/RecipeSection.svelte';
	import ReferenceSections from '#lib/components/ReferenceSections.svelte';
	import RangeDemo from '#lib/demos/RangeDemo.svelte';
	import pickerClasses from '#lib/demos/picker-classes.ts?raw';
	import recipe from '#lib/demos/DateRangeField.svelte?raw';
	import { datePickers } from '#lib/reference/date-pickers.js';
	import { inlineCode, prose } from '#lib/styles.js';

	const usage = `<script>
	import { DateRangePicker, addDays, today } from '@frostycle/rime/date-picker';

	let period = $state(null);

	const presets = [
		{ label: 'Today', value: () => ({ start: today(), end: today() }) },
		{ label: 'Last 7 days', value: () => ({ start: addDays(today(), -6), end: today() }) }
	];
<\/script>

<DateRangePicker
	bind:value={period}
	months={2}
	{presets}
	locale="id-ID"
	startName="from"
	endName="to"
	classes={{ popup: 'rounded-lg border bg-white p-4', day: 'size-9 data-[selected]:bg-blue-600' }}
>
	{#snippet trigger({ props, label, clear, value })}
		<button {...props}>{label || 'Choose dates'}</button>
		{#if value}<button type="button" onclick={clear}>Clear</button>{/if}
	{/snippet}
</DateRangePicker>`;

	const singleUsage = `<form method="GET">
	<DatePicker bind:value={due} name="due" min={today()} />
</form>`;

	const recipeUsage = '<DateRangeField bind:value={period} months={2} {presets} />';

	const urlValues = `import { isIsoDate } from '@frostycle/rime/date-picker';

const from = url.searchParams.get('from');
const value = isIsoDate(from) ? from : null;`;
</script>

<svelte:head>
	<title>Date pickers | Rime</title>
</svelte:head>

<PageHeader title="Date pickers">
	{#snippet lede()}
		<code class={inlineCode}>DatePicker</code> and <code class={inlineCode}>DateRangePicker</code> share one calendar,
		keyboard model and set of snippets. Values are <code class={inlineCode}>YYYY-MM-DD</code> strings, so a selection
		cannot shift by a day across timezones.
	{/snippet}
</PageHeader>

<DocSection id="demo" title="Live demo">
	<p class={prose}>
		This is the Tailwind wrapper from the recipe below, running. Pick a range and watch the bound value change.
	</p>
	<div class="mt-4"><RangeDemo /></div>
</DocSection>

<DocSection id="usage" title="Usage">
	<p class={prose}>
		A range is <code class={inlineCode}>{'{ start, end }'}</code>. Every snippet is optional, and the trigger snippet
		receives the formatted label and a <code class={inlineCode}>clear</code> function.
	</p>
	<div class="mt-4"><CodeBlock code={usage} label="Date range picker usage" /></div>
	<p class={prose}>
		<code class={inlineCode}>DatePicker</code> takes a single string. With <code class={inlineCode}>name</code> it
		renders a hidden input, so it submits with a form.
	</p>
	<div class="mt-4"><CodeBlock code={singleUsage} label="Date picker usage in a form" /></div>
</DocSection>

<ReferenceSections reference={datePickers} name="Date picker">
	{#snippet attributesNote()}
		<code class={inlineCode}>data-focus</code> appears for keyboard focus only, and
		<code class={inlineCode}>data-hover</code> ignores touch. Disabled elements take neither
		<code class={inlineCode}>data-hover</code> nor <code class={inlineCode}>data-active</code>.
	{/snippet}
</ReferenceSections>

<RecipeSection
	variant="data-selected"
	files={[
		{ code: pickerClasses, label: 'picker-classes.ts' },
		{ code: recipe, label: 'DateRangeField.svelte' },
		{ code: recipeUsage, label: 'Using DateRangeField' }
	]}
/>

<DocSection id="url-values" title="Validating URL values">
	<p class={prose}>An invalid <code class={inlineCode}>value</code> throws, so check anything from a URL first.</p>
	<div class="mt-4"><CodeBlock code={urlValues} label="Validating a date from the URL" /></div>
</DocSection>

<DocSection id="non-modal" title="Non-modal popup">
	<p class={prose}>
		The popup uses the native <code class={inlineCode}>popover</code> attribute, so it is not clipped by
		<code class={inlineCode}>overflow: hidden</code> parents and works inside a modal
		<code class={inlineCode}>&lt;dialog&gt;</code>. It deliberately does not trap focus: tabbing out closes it and
		discards a half-made range. In a two-month view, the Next control sits in the last month's header, so it follows
		the first month's grid in tab order.
	</p>
</DocSection>

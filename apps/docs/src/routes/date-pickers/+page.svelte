<script lang="ts">
	import AttributesTable from '#lib/components/AttributesTable.svelte';
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import KeyboardTable from '#lib/components/KeyboardTable.svelte';
	import PropsTable from '#lib/components/PropsTable.svelte';
	import SnippetList from '#lib/components/SnippetList.svelte';
	import RangeDemo from '#lib/demos/RangeDemo.svelte';
	import recipe from '#lib/demos/DateRangeField.svelte?raw';
	import { datePickers } from '#lib/reference/date-pickers.js';

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

	const recipeUsage = '<DateRangeField bind:value={period} months={2} {presets} />';

	const urlValues = `import { isIsoDate } from '@frostycle/rime/date-picker';

const from = url.searchParams.get('from');
const value = isIsoDate(from) ? from : null;`;

	const h2 = 'mt-14 text-2xl font-bold tracking-tight';
	const prose = 'mt-3 max-w-prose leading-relaxed text-fg-muted';
	const inlineCode = 'font-mono text-[13px] text-fg';
</script>

<svelte:head>
	<title>Date pickers | Rime</title>
</svelte:head>

<p class="text-sm font-semibold text-accent-fg">Components</p>
<h1 class="mt-2 text-4xl font-bold tracking-tight">Date pickers</h1>
<p class="mt-3.5 max-w-2xl text-lg leading-relaxed text-fg-muted">
	<code class={inlineCode}>DatePicker</code> and <code class={inlineCode}>DateRangePicker</code> share one calendar,
	keyboard model and set of snippets. Values are <code class={inlineCode}>YYYY-MM-DD</code> strings, so a selection
	cannot shift by a day across timezones.
</p>

<section aria-labelledby="demo">
	<h2 id="demo" class={h2}>Live demo</h2>
	<p class={prose}>
		This is the Tailwind wrapper from the recipe below, running. Pick a range and watch the bound value change.
	</p>
	<div class="mt-4"><RangeDemo /></div>
</section>

<section aria-labelledby="usage">
	<h2 id="usage" class={h2}>Usage</h2>
	<p class={prose}>
		A range is <code class={inlineCode}>{'{ start, end }'}</code>. Every snippet is optional, and the trigger snippet
		receives the formatted label and a <code class={inlineCode}>clear</code> function.
	</p>
	<div class="mt-4"><CodeBlock code={usage} label="Date range picker usage" /></div>
</section>

<section aria-labelledby="props">
	<h2 id="props" class={h2}>Props</h2>
	<div class="mt-4"><PropsTable reference={datePickers.props} label="Date picker props" /></div>
</section>

<section aria-labelledby="snippets">
	<h2 id="snippets" class={h2}>Snippets</h2>
	<p class={prose}>All optional. Spread each <code class={inlineCode}>props</code> onto your element.</p>
	<div class="mt-4"><SnippetList reference={datePickers.props} /></div>
</section>

<section aria-labelledby="keyboard">
	<h2 id="keyboard" class={h2}>Keyboard</h2>
	<div class="mt-4"><KeyboardTable keys={datePickers.keyboard} /></div>
</section>

<section aria-labelledby="attributes">
	<h2 id="attributes" class={h2}>State attributes</h2>
	<p class={prose}>
		Style state with <code class={inlineCode}>data-*</code> attributes rather than props. They are present or absent,
		with no value. <code class={inlineCode}>data-focus</code> appears for keyboard focus only, and
		<code class={inlineCode}>data-hover</code> ignores touch.
	</p>
	<div class="mt-4"><AttributesTable attributes={datePickers.attributes} label="Date picker state attributes" /></div>
</section>

<section aria-labelledby="recipe">
	<h2 id="recipe" class={h2}>Tailwind recipe</h2>
	<p class={prose}>
		The library ships no Tailwind classes, so there is nothing to configure or override. Copy this wrapper into your
		project and own it. It needs Tailwind CSS v4, whose bare <code class={inlineCode}>data-selected:</code> variants it
		uses; in v3 write <code class={inlineCode}>data-[selected]:</code>.
	</p>
	<div class="mt-4"><CodeBlock code={recipe} label="DateRangeField.svelte" /></div>
	<div class="mt-4"><CodeBlock code={recipeUsage} label="Using DateRangeField" /></div>
</section>

<section aria-labelledby="url-values">
	<h2 id="url-values" class={h2}>Validating URL values</h2>
	<p class={prose}>An invalid <code class={inlineCode}>value</code> throws, so check anything from a URL first.</p>
	<div class="mt-4"><CodeBlock code={urlValues} label="Validating a date from the URL" /></div>
</section>

<section aria-labelledby="non-modal">
	<h2 id="non-modal" class={h2}>Non-modal popup</h2>
	<p class={prose}>
		The popup uses the native <code class={inlineCode}>popover</code> attribute, so it is not clipped by
		<code class={inlineCode}>overflow: hidden</code> parents and works inside a modal
		<code class={inlineCode}>&lt;dialog&gt;</code>. It deliberately does not trap focus: tabbing out closes it and
		discards a half-made range. In a two-month view, the Next control sits in the last month's header, so it follows
		the first month's grid in tab order.
	</p>
</section>

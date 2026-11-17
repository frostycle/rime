<script lang="ts">
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import DateRangeField from '#lib/demos/DateRangeField.svelte';
	import type { DateRange } from '@frostycle/rime/date-picker';

	let period = $state<DateRange | null>({ start: '2026-11-03', end: '2026-11-12' });

	const components = [
		{ href: '/date-pickers', name: 'Date picker', blurb: 'One date, as a timezone-safe string, with presets and form support.' },
		{ href: '/date-pickers', name: 'Date range picker', blurb: 'Two clicks, a live preview, length limits and a multi-month view.' },
		{ href: '/dropdown-menu', name: 'Dropdown menu', blurb: 'Actions, links and groups, with arrow keys and type-to-jump.' },
		{ href: '/select', name: 'Select', blurb: 'One value from a list, labelled like a native field, with form support.' }
	];

	const features = [
		{
			title: 'Keyboard and screen readers',
			blurb: 'Follows the WAI-ARIA patterns, and is tested with axe in real browsers.',
			icon: 'M2.5 5.5h15v9h-15z M5.5 8.5h1M9.5 8.5h1M13.5 8.5h1M6.5 11.5h7'
		},
		{
			title: 'Server rendering',
			blurb: 'Renders on the server, so it works in SvelteKit and in plain Svelte.',
			icon: 'M3 4.5h14v4H3z M3 11.5h14v4H3z M6 6.5h.01M6 13.5h.01'
		},
		{
			title: 'Top-layer popups',
			blurb: 'Never clipped by an overflow container, and safe inside a modal dialog.',
			icon: 'M4 4h12v12H4z M8 8h4v4H8z'
		}
	];

	const stateSample = `<DatePicker
	classes={{
		day: 'size-9 rounded-md data-selected:bg-blue-600 data-today:font-bold data-disabled:opacity-40'
	}}
/>`;
</script>

<svelte:head>
	<title>Rime: headless UI for Svelte 5</title>
</svelte:head>

<section class="grid items-center gap-16 [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))]">
	<div>
		<p class="text-sm font-semibold text-accent-fg">One component. Your styles.</p>
		<h1 class="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Headless, snippet-based UI primitives for Svelte 5.</h1>
		<p class="mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted">
			Rime handles keyboard, focus, positioning and accessibility. You restyle it with snippets and data attributes,
			with no tree of nested parts to compose.
		</p>
		<div class="mt-8 flex flex-wrap items-center gap-3">
			<a
				class="rounded-lg bg-accent px-4.5 py-3 text-[15px] font-semibold text-on-accent no-underline"
				href="/date-pickers">Browse components</a
			>
			<code class="rounded-lg border border-line bg-surface px-3.5 py-3 font-mono text-[13px]">pnpm add @frostycle/rime</code>
		</div>
	</div>
	<div class="min-w-0 rounded-2xl bg-(image:--desk) px-5 py-9 sm:px-8">
		<div class="min-h-[380px]"><DateRangeField bind:value={period} /></div>
	</div>
</section>

<section class="mt-24" aria-labelledby="components">
	<h2 id="components" class="text-3xl font-bold tracking-tight">Components</h2>
	<div class="mt-8 grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))]">
		{#each components as { href, name, blurb } (name)}
			<a class="block rounded-2xl border border-line bg-surface p-7 no-underline" {href}>
				<span class="flex items-center gap-2 text-[17px] font-semibold">
					{name}
				</span>
				<p class="m-0 mt-2 text-sm leading-normal text-fg-muted">{blurb}</p>
			</a>
		{/each}
	</div>
</section>

<section class="mt-24 grid items-center gap-12 [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))]" aria-labelledby="state">
	<div>
		<h2 id="state" class="text-3xl font-bold tracking-tight">Style state, not structure.</h2>
		<p class="mt-4 max-w-prose text-[17px] leading-relaxed text-fg-muted">
			Every interactive element exposes its state as a data attribute, so Tailwind variants or plain CSS can target it
			directly. The library ships no colours and needs no theme prop.
		</p>
	</div>
	<div class="min-w-0"><CodeBlock code={stateSample} label="Styling by state" /></div>
</section>

<section class="mt-24" aria-labelledby="built-in">
	<h2 id="built-in" class="text-3xl font-bold tracking-tight">Built in, on every component</h2>
	<ul class="mt-8 grid list-none gap-6 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))]">
		{#each features as { title, blurb, icon } (title)}
			<li class="rounded-2xl border border-line bg-surface p-7">
				<div class="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent-fg">
					<svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={icon} /></svg>
				</div>
				<h3 class="mt-4 text-base font-semibold">{title}</h3>
				<p class="mt-2 text-sm leading-normal text-fg-muted">{blurb}</p>
			</li>
		{/each}
	</ul>
</section>

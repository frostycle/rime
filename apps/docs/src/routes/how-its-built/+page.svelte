<script lang="ts">
	import PageHeader from '#lib/components/PageHeader.svelte';

	const file = (path: string) => `https://github.com/frostycle/rime/blob/main/${path}`;
	type Evidence = { title: string; detail: string; links: { label: string; href: string }[] };

	const evidence: Evidence[] = [
		{
			title: 'Real browsers, three engines',
			detail: 'The component tests run in Chromium, WebKit and Firefox, not in a simulated DOM.',
			links: [{ label: 'vite.config.ts', href: file('packages/rime/vite.config.ts') }]
		},
		{
			title: 'Accessibility checked with axe',
			detail: 'Each component suite runs axe against the rendered component.',
			links: [
				{ label: 'Date picker', href: file('packages/rime/src/lib/date-picker/a11y.svelte.test.ts') },
				{ label: 'Dropdown menu', href: file('packages/rime/src/lib/dropdown-menu/DropdownMenu.svelte.test.ts') },
				{ label: 'Select', href: file('packages/rime/src/lib/select/Select.svelte.test.ts') }
			]
		},
		{
			title: 'Server rendering and hydration',
			detail: 'Every component has a server-rendering test, and the date picker has a hydration test.',
			links: [
				{ label: 'Date picker SSR', href: file('packages/rime/src/lib/date-picker/ssr.test.ts') },
				{ label: 'Date picker hydration', href: file('packages/rime/src/lib/date-picker/hydration.svelte.test.ts') },
				{ label: 'Dropdown menu SSR', href: file('packages/rime/src/lib/dropdown-menu/ssr.test.ts') },
				{ label: 'Select SSR', href: file('packages/rime/src/lib/select/ssr.test.ts') }
			]
		},
		{
			title: 'One runtime dependency',
			detail: 'The only dependency is Floating UI, used for popup positioning. Svelte is a peer dependency.',
			links: [{ label: 'package.json', href: file('packages/rime/package.json') }]
		},
		{
			title: 'Unit tests in four time zones',
			detail: 'The date logic runs under UTC, New York, Jakarta and Apia.',
			links: [{ label: 'test:unit script', href: file('packages/rime/package.json') }]
		},
		{
			title: 'Release workflow checks',
			detail: 'The release workflow runs the type check, the unit tests and the browser tests before it publishes.',
			links: [{ label: 'release.yml', href: file('.github/workflows/release.yml') }]
		},
		{
			title: 'Signed provenance',
			detail:
				'From 0.1.1, each release is built and published by that workflow with a signed npm provenance statement, which ties the package to the commit it was built from. 0.1.0 was published by hand and has none.',
			links: [{ label: 'Provenance on npm', href: 'https://www.npmjs.com/package/@frostycle/rime/v/0.1.1#provenance' }]
		}
	];
</script>

<svelte:head>
	<title>How it's built | Rime</title>
</svelte:head>

<PageHeader title="How it's built" eyebrow="Getting started">
	{#snippet lede()}
		What backs the claims on the other pages, with a link to the file for each.
	{/snippet}
</PageHeader>

<ul class="mt-10 grid list-none gap-4 p-0">
	{#each evidence as { title, detail, links } (title)}
		<li class="rounded-2xl border border-line bg-surface p-6">
			<h2 class="m-0 text-lg font-semibold">{title}</h2>
			<p class="mt-2 max-w-prose leading-relaxed text-fg-muted">{detail}</p>
			<ul class="mt-3 flex list-none flex-wrap gap-x-5 gap-y-1 p-0 text-sm">
				{#each links as { label, href } (href + label)}
					<li><a class="text-accent-fg underline" {href}>{label}</a></li>
				{/each}
			</ul>
		</li>
	{/each}
	<li class="rounded-2xl border border-line bg-surface p-6">
		<h2 class="m-0 text-lg font-semibold">Checked by hand with VoiceOver</h2>
		<p class="mt-2 max-w-prose leading-relaxed text-fg-muted">
			Each release is checked manually with VoiceOver. That check is not automated, so there is no test file to link.
		</p>
	</li>
</ul>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import DocsNav from '#lib/components/DocsNav.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import '../app.css';

	let { children }: { children: Snippet } = $props();

	const isHome = $derived(page.url.pathname === '/');
</script>

<a
	href="#content"
	class="sr-only rounded-lg bg-accent px-4 py-2 text-on-accent focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10"
>
	Skip to content
</a>

<SiteHeader />

{#if isHome}
	<main id="content" class="mx-auto max-w-7xl px-4 pt-14 pb-24 md:px-8">
		{@render children()}
	</main>
{:else}
	<div class="mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-10 pb-18 md:flex-row md:gap-14 md:px-8">
		<DocsNav />
		<main id="content" class="min-w-0 flex-1">
			{@render children()}
		</main>
	</div>
{/if}

<footer class="border-t border-line">
	<div
		class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-fg-muted md:px-8"
	>
		<span>Rime, by Frostycle. MIT licensed.</span>
		<nav aria-label="Footer" class="flex gap-6">
			<a href="https://github.com/frostycle/rime" class="hover:text-accent-fg">GitHub</a>
			<a href="https://www.npmjs.com/package/@frostycle/rime" class="hover:text-accent-fg">npm</a>
		</nav>
	</div>
</footer>

<script lang="ts">
	import { page } from '$app/state';

	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? 'Page not found' : 'Error'} | Rime</title>
</svelte:head>

<p class="text-sm font-semibold text-accent-fg">{page.status}</p>
<h1 class="mt-2 text-4xl font-bold tracking-tight">
	{notFound ? 'Page not found' : 'Something went wrong'}
</h1>
<p class="mt-3.5 text-lg text-fg-muted">
	{notFound
		? 'There is no page at this address. It may have moved, or the link may be mistyped.'
		: 'This page could not be shown. Try again in a moment.'}
</p>
<a
	href="/"
	class="mt-8 inline-block rounded-lg bg-accent px-4.5 py-3 font-semibold text-on-accent"
>
	Back to home
</a>

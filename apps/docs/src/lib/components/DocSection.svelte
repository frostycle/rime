<script lang="ts">
	import type { Snippet } from 'svelte';

	let { id, title, children }: { id: string; title: string; children: Snippet } = $props();
</script>

<section aria-labelledby={id}>
	<h2 {id} class="mt-14 text-2xl font-bold tracking-tight">{title}</h2>
	{@render children()}
</section>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, lede, eyebrow = 'Components' }: { title: string; lede: Snippet; eyebrow?: string } = $props();
</script>

<p class="text-sm font-semibold text-accent-fg">{eyebrow}</p>
<h1 class="mt-2 text-4xl font-bold tracking-tight">{title}</h1>
<p class="mt-3.5 max-w-2xl text-lg leading-relaxed text-fg-muted">{@render lede()}</p>

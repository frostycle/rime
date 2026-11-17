<script lang="ts">
	import { page } from '$app/state';
	import { NAV } from '#lib/site.ts';
</script>

<nav aria-label="Documentation" class="text-sm md:w-60 md:shrink-0">
	{#each NAV as group, index (group.heading)}
		<p class="mb-2 text-xs font-semibold text-fg-muted {index > 0 ? 'mt-6' : ''}">{group.heading}</p>
		{#each group.links as link (link.href)}
			<a
				href={link.href}
				aria-current={page.url.pathname === link.href ? 'page' : undefined}
				class="block rounded-lg px-2.5 py-1.75 hover:bg-hover aria-[current=page]:bg-accent-soft aria-[current=page]:font-semibold aria-[current=page]:text-accent-fg"
			>
				{link.label}
			</a>
		{/each}
	{/each}
</nav>

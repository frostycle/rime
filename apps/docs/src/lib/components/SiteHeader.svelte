<script lang="ts">
	import ThemeToggle from './ThemeToggle.svelte';
</script>

<header class="border-b border-line">
	<div class="mx-auto flex max-w-7xl items-center gap-x-8 gap-y-3 px-4 py-3.5 md:px-8">
		<a href="/" class="flex items-center gap-2.5 text-lg font-bold tracking-tight">
			<span class="flex size-8 items-center justify-center rounded-lg bg-accent text-on-accent">
				<svg
					viewBox="0 0 20 20"
					width="20"
					height="20"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<path
						d="M10 2.5v15M3.5 6.25l13 7.5M16.5 6.25l-13 7.5M10 5.5L8.2 4M10 5.5L11.8 4M10 14.5l-1.8 1.5M10 14.5l1.8 1.5"
					/>
				</svg>
			</span>
			Rime
		</a>
		<div class="ml-auto flex items-center gap-2">
			<ThemeToggle />
			<a
				href="https://github.com/frostycle/rime"
				class="rounded-lg border border-line px-3.5 py-2 text-sm font-medium hover:bg-hover"
			>
				GitHub
			</a>
		</div>
	</div>
</header>

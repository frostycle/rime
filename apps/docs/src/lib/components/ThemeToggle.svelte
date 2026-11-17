<script lang="ts">
	function toggleTheme() {
		const root = document.documentElement;
		const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
		root.dataset.theme = next;
		try {
			localStorage.setItem('rime-theme', next);
		} catch {
			// Storage can be blocked by the browser; the switch still applies to this page.
		}
	}
</script>

<button
	type="button"
	aria-label="Switch theme"
	onclick={toggleTheme}
	class="flex size-10 cursor-pointer items-center justify-center rounded-full text-fg-muted hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
>
	<svg
		viewBox="0 0 20 20"
		width="20"
		height="20"
		fill="none"
		stroke="currentColor"
		stroke-width="1.6"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<circle cx="10" cy="10" r="3.5" />
		<path
			d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M16 4l-1.4 1.4M5.4 14.6 4 16M16 16l-1.4-1.4M5.4 5.4 4 4"
		/>
	</svg>
</button>

<script lang="ts">
	let { code, label }: { code: string; label: string } = $props();
</script>

<div class="overflow-x-auto rounded-2xl border border-line bg-code">
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -- keyboard users need focus to scroll the code -->
	<pre role="group" class="m-0 p-4 text-[13px] leading-relaxed" aria-label={label} tabindex="0"><code
			class="font-mono">{code}</code
		></pre>
</div>

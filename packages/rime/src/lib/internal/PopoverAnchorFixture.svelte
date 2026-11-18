<script lang="ts">
	import { Popover } from './popover.svelte.js';

	let { expose }: { expose: (popover: Popover) => void } = $props();

	const id = $props.id();

	// svelte-ignore state_referenced_locally
	const popover = new Popover(id, () => {}, { role: 'listbox' });
	// svelte-ignore state_referenced_locally
	expose(popover);
</script>

<input {...popover.anchorProps} aria-label="Field" data-testid="anchor" />
<button {...popover.partProps} data-testid="part">Toggle</button>
{#if popover.mounted}
	<div {...popover.contentProps} data-testid="content"></div>
{/if}
<button data-testid="outside">Outside</button>

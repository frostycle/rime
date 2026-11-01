<script lang="ts">
	import { Popover, type CloseReason, type PopoverOptions } from './popover.svelte.js';

	let {
		onClose,
		options,
		expose
	}: {
		onClose: (reason: CloseReason) => void;
		options?: PopoverOptions;
		expose: (popover: Popover) => void;
	} = $props();

	const id = $props.id();

	// svelte-ignore state_referenced_locally
	const popover = new Popover(id, onClose, options);
	// svelte-ignore state_referenced_locally
	expose(popover);
</script>

<button {...popover.triggerProps} data-testid="trigger">Open</button>
{#if popover.mounted}
	<div {...popover.contentProps} data-testid="content">
		<button data-testid="inside">Inside</button>
	</div>
{/if}
<button data-testid="outside">Outside</button>
<input aria-label="After" />

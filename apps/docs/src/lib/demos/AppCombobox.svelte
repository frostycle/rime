<script lang="ts" generics="T extends ComboboxOption">
	import { Combobox, type ComboboxOption, type ComboboxProps } from '@frostycle/rime/combobox';
	import { comboboxClasses } from './combobox-classes.js';

	let { value = $bindable(null), query = $bindable(''), ...props }: ComboboxProps<T> = $props();
</script>

<div class="relative inline-block">
	<Combobox transition classes={comboboxClasses} bind:value bind:query {...props}>
		{#snippet button({ props: buttonProps })}
			<button
				{...buttonProps}
				class="absolute inset-y-0 right-0 px-2.5 text-gray-500 data-disabled:opacity-50 dark:text-gray-400"
			>
				<svg viewBox="0 0 20 20" class="size-4 fill-none stroke-current stroke-2" aria-hidden="true">
					<path d="M5 8l5 5 5-5" />
				</svg>
			</button>
		{/snippet}
		{#snippet empty({ query: typed })}
			<p class="m-0 px-2.5 py-1.5 text-gray-500 dark:text-gray-400">No match for “{typed}”.</p>
		{/snippet}
	</Combobox>
</div>

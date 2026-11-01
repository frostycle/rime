<script lang="ts">
	import DatePicker from '../DatePicker.svelte';

	let value = $state<string | null>('2026-10-15');
	const presets = [{ label: 'Preset', value: () => '2026-10-20' }];
</script>

<DatePicker bind:value {presets}>
	{#snippet trigger({ props, label })}
		<button {...props} data-testid="custom-trigger">{label}</button>
	{/snippet}
	{#snippet popup({ props, content })}
		<section {...props} data-testid="custom-popup">{@render content()}</section>
	{/snippet}
	{#snippet header({ title, titleProps, previousProps, nextProps })}
		<div data-testid="custom-header">
			{#if previousProps}<button {...previousProps}>Back</button>{/if}
			<span {...titleProps}>{title}</span>
			{#if nextProps}<button {...nextProps}>Forward</button>{/if}
		</div>
	{/snippet}
	{#snippet grid({ weeks, props, renderDay })}
		<div {...props} data-testid="custom-grid">
			{#each weeks as week, index (index)}
				<div role="row">
					{#each week as date, column (column)}
						<span role="gridcell">
							{#if date}{@render renderDay(date)}{/if}
						</span>
					{/each}
				</div>
			{/each}
		</div>
	{/snippet}
	{#snippet day({ props, dayNumber })}
		<button {...props} data-testid="custom-day">{dayNumber}</button>
	{/snippet}
	{#snippet presetList({ presets: items, select })}
		<div data-testid="custom-presets">
			{#each items as item (item.label)}
				<button type="button" onclick={() => select(item)}>{item.label}</button>
			{/each}
		</div>
	{/snippet}
</DatePicker>
<output data-testid="value">{value}</output>

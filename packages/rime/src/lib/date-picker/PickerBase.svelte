<script lang="ts" generics="V">
	import { untrack, type Snippet } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { interactionProps } from '../internal/interaction.js';
	import { Popover } from '../internal/popover.svelte.js';
	import { Calendar, type CalendarLabels } from './calendar.svelte.js';
	import type { MonthGrid } from './month-grid.js';
	import type { SelectionStrategy } from './selection.js';
	import type { CommonPickerProps, ElementProps, Preset, ResolvedPreset } from './types.js';

	const DEFAULT_LABELS: CalendarLabels = {
		previousMonth: 'Previous month',
		nextMonth: 'Next month',
		dialog: 'Choose date',
		inRange: 'in selected range'
	};
	const ROOT_KEY = createAttachmentKey();

	type Props = CommonPickerProps<V> & {
		strategy: SelectionStrategy<V>;
		formatLabel: (value: V) => string;
		hiddenInputs?: Snippet<[V | null]>;
		minDays?: number;
		maxDays?: number;
	};

	let {
		value = $bindable(null),
		onchange,
		min,
		max,
		isDateDisabled,
		minDays,
		maxDays,
		months = 1,
		presets = [],
		locale = 'en-US',
		weekStartsOn,
		labels,
		disabled = false,
		transition = false,
		classes = {},
		trigger,
		popup,
		header,
		grid,
		day,
		presetList,
		strategy,
		formatLabel,
		hiddenInputs
	}: Props = $props();

	const id = $props.id();

	const validatedValue = $derived.by(() => {
		strategy.assertValid(value);
		return value;
	});
	const resolvedLabels = $derived({ ...DEFAULT_LABELS, ...labels });
	const constraints = $derived({ min, max, isDateDisabled, minDays, maxDays });
	const label = $derived(validatedValue === null ? '' : formatLabel(validatedValue));

	let root: HTMLElement | null = null;

	const popover = new Popover(id, () => calendar.reset(), { animated: () => transition });

	const calendar = new Calendar<V>(() => ({
		...constraints,
		strategy,
		value: validatedValue,
		months,
		locale,
		weekStartsOn,
		labels: resolvedLabels,
		rtl: () => root !== null && getComputedStyle(root).direction === 'rtl',
		commit
	}));

	function commit(next: V): void {
		if (disabled) return;
		value = next;
		onchange?.(next);
		popover.close('commit');
	}

	function clear(): void {
		if (disabled) return;
		value = null;
		onchange?.(null);
	}

	function selectPreset(preset: Preset<V>): void {
		const next = preset.value();
		if (strategy.isValueAllowed(next, constraints)) commit(next);
	}

	function attachRoot(element: HTMLElement) {
		root = element;
		calendar.setRoot(element);
	}

	$effect(() => {
		if (popover.open) untrack(() => calendar.show());
	});

	$effect(() => {
		if (disabled) untrack(() => popover.close('outside'));
	});

	const valueAtMount = untrack(() => value);

	$effect(() => {
		const form = popover.triggerElement?.closest('form');
		if (!form) return;
		const restore = () => {
			value = valueAtMount;
		};
		form.addEventListener('reset', restore);
		return () => form.removeEventListener('reset', restore);
	});

	$effect(() => {
		void validatedValue;
		untrack(() => calendar.syncToValue());
	});

	const triggerProps = $derived<ElementProps>({
		...popover.triggerProps,
		disabled,
		'data-disabled': disabled ? '' : undefined
	});
	const popupProps = $derived<ElementProps>({
		...popover.contentProps,
		'aria-label': resolvedLabels.dialog,
		class: classes.popup,
		[ROOT_KEY]: attachRoot
	});
	const resolvedPresets = $derived<ResolvedPreset<V>[]>(
		presets.map((preset) => ({
			...preset,
			disabled: !strategy.isValueAllowed(preset.value(), constraints)
		}))
	);

	function titleId(index: number): string {
		return `${id}-title-${index}`;
	}

	function titlePropsOf(index: number): ElementProps {
		return { id: titleId(index), 'aria-live': 'polite' };
	}

	function previousPropsOf(index: number): ElementProps | null {
		if (index !== 0) return null;
		return {
			type: 'button',
			'aria-label': resolvedLabels.previousMonth,
			onclick: () => calendar.previousMonth(),
			...interactionProps
		};
	}

	function nextPropsOf(index: number): ElementProps | null {
		if (index !== calendar.grids.length - 1) return null;
		return {
			type: 'button',
			'aria-label': resolvedLabels.nextMonth,
			onclick: () => calendar.nextMonth(),
			...interactionProps
		};
	}

	function gridPropsOf(index: number): ElementProps {
		return { role: 'grid', 'aria-labelledby': titleId(index) };
	}
</script>

{#snippet dayCell(date: string)}
	{@const props = calendar.dayProps(date)}
	{#if day}
		{@render day({ ...calendar.dayState(date), props })}
	{:else}
		<button {...props} class={classes.day}>{calendar.dayState(date).dayNumber}</button>
	{/if}
{/snippet}

{#snippet defaultHeader(monthGrid: MonthGrid, index: number)}
	{@const previousProps = previousPropsOf(index)}
	{@const nextProps = nextPropsOf(index)}
	<div class={classes.header}>
		{#if previousProps}
			<button {...previousProps} class={classes.nav}><span aria-hidden="true">‹</span></button>
		{/if}
		<div {...titlePropsOf(index)} class={classes.title}>{monthGrid.title}</div>
		{#if nextProps}
			<button {...nextProps} class={classes.nav}><span aria-hidden="true">›</span></button>
		{/if}
	</div>
{/snippet}

{#snippet defaultGrid(monthGrid: MonthGrid, index: number)}
	<table {...gridPropsOf(index)} class={classes.grid}>
		<thead>
			<tr>
				{#each monthGrid.weekdays as weekday (weekday.long)}
					<th scope="col" abbr={weekday.long} class={classes.weekday}>{weekday.short}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each monthGrid.weeks as week, weekIndex (weekIndex)}
				<tr>
					{#each week as date, column (column)}
						<td class={classes.cell}>
							{#if date}{@render dayCell(date)}{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
{/snippet}

{#snippet body()}
	<div class={classes.body}>
		{#if presets.length > 0}
			{#if presetList}
				{@render presetList({ presets: resolvedPresets, select: selectPreset })}
			{:else}
				<div class={classes.presets}>
					{#each resolvedPresets as preset (preset.label)}
						<button
							type="button"
							class={classes.preset}
							disabled={preset.disabled}
							onclick={() => selectPreset(preset)}
							{...interactionProps}
						>
							{preset.label}
						</button>
					{/each}
				</div>
			{/if}
		{/if}
		{#each calendar.grids as monthGrid, index (monthGrid.month)}
			<div class={classes.month}>
				{#if header}
					{@render header({
						title: monthGrid.title,
						titleProps: titlePropsOf(index),
						previousProps: previousPropsOf(index),
						nextProps: nextPropsOf(index)
					})}
				{:else}
					{@render defaultHeader(monthGrid, index)}
				{/if}
				{#if grid}
					{@render grid({
						month: monthGrid.month,
						weekdays: monthGrid.weekdays,
						weeks: monthGrid.weeks,
						props: gridPropsOf(index),
						renderDay: dayCell
					})}
				{:else}
					{@render defaultGrid(monthGrid, index)}
				{/if}
			</div>
		{/each}
	</div>
{/snippet}

{#if trigger}
	{@render trigger({
		props: triggerProps,
		label,
		value: validatedValue,
		open: popover.open,
		clear
	})}
{:else}
	<button {...triggerProps} class={classes.trigger}>{label || resolvedLabels.dialog}</button>
{/if}

{#if popover.mounted}
	{#if popup}
		{@render popup({ props: popupProps, content: body })}
	{:else}
		<div {...popupProps}>{@render body()}</div>
	{/if}
{/if}

{#if !disabled}
	{@render hiddenInputs?.(validatedValue)}
{/if}

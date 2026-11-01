<script lang="ts">
	import { page } from '$app/state';
	import { DropdownMenu, type MenuClasses, type MenuEntry } from '@frostycle/rime/dropdown-menu';
	import {
		addDays,
		DatePicker,
		DateRangePicker,
		isIsoDate,
		today,
		type DateRange,
		type PickerClasses
	} from '@frostycle/rime/date-picker';

	let theme = $state<'light' | 'dark'>('light');
	let report = $state<DateRange | null>(null);
	let due = $state<string | null>(null);
	let custom = $state<string | null>(null);
	let lastAction = $state<string | null>(null);

	const focusRing = 'outline-blue-700 dark:outline-blue-300';
	const buttonBase = `cursor-pointer rounded-md border bg-white px-3 py-2 text-slate-900 dark:bg-slate-800 dark:text-slate-100 ${focusRing}`;
	const button = `${buttonBase} border-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-slate-600`;
	const popupSurface =
		'rounded-lg border border-slate-300 bg-white text-slate-900 shadow-lg dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100';
	const dayStates = `size-9 cursor-pointer data-focus:outline-2 data-focus:outline-offset-2 data-today:font-bold data-today:underline data-in-range:bg-blue-100 data-range-start:bg-blue-700 data-range-start:text-white data-range-end:bg-blue-700 data-range-end:text-white data-selected:bg-blue-700 data-selected:text-white data-disabled:cursor-not-allowed data-disabled:opacity-40 dark:data-in-range:bg-blue-900 dark:data-range-start:bg-blue-300 dark:data-range-start:text-slate-900 dark:data-range-end:bg-blue-300 dark:data-range-end:text-slate-900 dark:data-selected:bg-blue-300 dark:data-selected:text-slate-900 ${focusRing}`;
	const sectionTitle = 'mb-3 font-bold';
	const note = 'mt-4 text-slate-600 dark:text-slate-300';

	const classes: PickerClasses = {
		trigger: `${buttonBase} border-slate-300 data-focus:outline-2 data-focus:outline-offset-2 dark:border-slate-600`,
		popup: `${popupSurface} p-4`,
		body: 'flex flex-wrap gap-6',
		header: 'mb-2 flex items-center gap-2',
		title: 'flex-1 text-center font-semibold',
		nav: `cursor-pointer rounded px-2 py-1 data-focus:outline-2 data-focus:outline-offset-2 ${focusRing}`,
		weekday: 'text-xs font-medium text-slate-600 dark:text-slate-300',
		day: `rounded ${dayStates}`,
		presets: 'flex flex-col gap-1',
		preset: `cursor-pointer rounded px-2 py-1 text-start focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`
	};

	const rangePresets = [
		{ label: 'Today', value: () => ({ start: today(), end: today() }) },
		{ label: 'Last 7 days', value: () => ({ start: addDays(today(), -6), end: today() }) },
		{ label: 'Last 30 days', value: () => ({ start: addDays(today(), -29), end: today() }) }
	];
	const datePresets = [
		{ label: 'Today', value: () => today() },
		{ label: 'In a week', value: () => addDays(today(), 7) }
	];

	const menuClasses: MenuClasses = {
		trigger: classes.trigger,
		popup: `${popupSurface} min-w-48 p-1.5 outline-none transition duration-150 ease-out data-closed:-translate-y-1 data-closed:opacity-0 motion-reduce:transition-none`,
		item: 'block w-full cursor-pointer rounded px-2.5 py-1.5 text-start outline-none data-hover:bg-blue-100 data-focus:bg-blue-700 data-focus:text-white data-disabled:cursor-not-allowed data-disabled:opacity-50 dark:data-hover:bg-blue-900 dark:data-focus:bg-blue-300 dark:data-focus:text-slate-900',
		separator: 'mx-1 my-1.5 h-px bg-slate-300 dark:bg-slate-600',
		groupLabel: 'px-2.5 pt-1.5 pb-1 text-xs font-semibold text-slate-600 dark:text-slate-300'
	};

	const menuItems: MenuEntry[] = [
		{ label: 'Edit', onselect: () => (lastAction = 'Edit') },
		{ label: 'Duplicate', onselect: () => (lastAction = 'Duplicate') },
		{ label: 'View on GitHub', href: 'https://github.com/frostycle/rime', target: '_blank', rel: 'noreferrer' },
		{ type: 'separator' },
		{
			type: 'group',
			label: 'Danger zone',
			items: [
				{ label: 'Archive', onselect: () => (lastAction = 'Archive') },
				{ label: 'Delete', disabled: true }
			]
		}
	];

	function isoParam(name: string): string | null {
		const param = page.url.searchParams.get(name);
		return isIsoDate(param) ? param : null;
	}

	const filterStart = $derived(isoParam('from'));
	const filterEnd = $derived(isoParam('to'));
	const filter = $derived(
		filterStart && filterEnd && filterStart <= filterEnd
			? { start: filterStart, end: filterEnd }
			: null
	);
</script>

<svelte:head>
	<title>Rime playground</title>
</svelte:head>

<main
	data-theme={theme}
	class="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-900 dark:text-slate-100"
>
	<div class="mx-auto max-w-3xl space-y-8">
		<header class="flex items-center justify-between gap-4">
			<h1 class="text-2xl font-bold">@frostycle/rime</h1>
			<button
				type="button"
				class={button}
				onclick={() => (theme = theme === 'light' ? 'dark' : 'light')}
			>
				{theme === 'light' ? 'Dark' : 'Light'} theme
			</button>
		</header>

		<section>
			<h2 class={sectionTitle}>Filter bar in an overflow hidden container</h2>
			<form
				method="GET"
				class="flex gap-2 overflow-hidden rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800"
			>
				<DateRangePicker value={filter} startName="from" endName="to" {classes} />
				<button type="submit" class={button}>Apply</button>
			</form>
			<p class={note}>Applied: <output>{filter ? `${filter.start} to ${filter.end}` : 'none'}</output></p>
		</section>

		<section>
			<h2 class={sectionTitle}>Report range, two months with presets</h2>
			<DateRangePicker bind:value={report} months={2} presets={rangePresets} {classes} />
			<p class={note}>Value: <output>{report ? `${report.start} to ${report.end}` : 'none'}</output></p>
		</section>

		<section>
			<h2 class={sectionTitle}>Single date in a form</h2>
			<form method="GET" class="flex gap-2">
				<DatePicker bind:value={due} name="due" presets={datePresets} {classes} />
				<button type="reset" class={button}>Reset</button>
			</form>
			<p class={note}>Value: <output>{due ?? 'none'}</output></p>
		</section>

		<section>
			<h2 class={sectionTitle}>Customised with snippets</h2>
			<DatePicker bind:value={custom} {classes}>
				{#snippet trigger({ props, label, clear, value })}
					<button
						{...props}
						class="{buttonBase} mr-2 border-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-blue-300"
					>
						{label || 'Pick a day'}
					</button>
					{#if value}<button type="button" class={button} onclick={clear}>Clear</button>{/if}
				{/snippet}
				{#snippet day({ props, dayNumber, isToday })}
					<button {...props} class="rounded-full {dayStates}">
						{dayNumber}{#if isToday}<span aria-hidden="true">•</span>{/if}
					</button>
				{/snippet}
			</DatePicker>
		</section>

		<section>
			<h2 class={sectionTitle}>Dropdown menu</h2>
			<DropdownMenu items={menuItems} label="Actions" transition classes={menuClasses} />
			<p class={note}>Last action: <output>{lastAction ?? 'none'}</output></p>
		</section>
	</div>
</main>

# @frostycle/rime

Headless, snippet-based UI primitives for Svelte 5: a small API with no nested components. The library applies no styles except inline popup positioning.

## Install

```sh
pnpm add @frostycle/rime
```

Requires `svelte@^5.29.0` and a browser with the `popover` attribute (Baseline 2024). The automated browser suite runs on Chromium, WebKit and Firefox.

## Date pickers

```svelte
<script>
	import { DateRangePicker, addDays, today } from '@frostycle/rime/date-picker';

	let period = $state(null);

	const presets = [
		{ label: 'Today', value: () => ({ start: today(), end: today() }) },
		{ label: 'Last 7 days', value: () => ({ start: addDays(today(), -6), end: today() }) }
	];
</script>

<DateRangePicker
	bind:value={period}
	months={2}
	{presets}
	locale="id-ID"
	startName="from"
	endName="to"
	classes={{ popup: 'rounded-lg border bg-white p-4', day: 'size-9 data-[selected]:bg-blue-600' }}
>
	{#snippet trigger({ props, label, clear, value })}
		<button {...props}>{label || 'Choose dates'}</button>
		{#if value}<button type="button" onclick={clear}>Clear</button>{/if}
	{/snippet}
</DateRangePicker>
```

Values are `YYYY-MM-DD` strings, never `Date` objects, so a selection cannot shift by a day across timezones. A range is `{ start, end }`.

## Dropdown menu

A button that opens a list of actions and links, defined as data.

```svelte
<script>
	import { DropdownMenu } from '@frostycle/rime/dropdown-menu';

	const items = [
		{ label: 'Edit', onselect: edit },
		{ label: 'View docs', href: '/docs' },
		{ type: 'separator' },
		{
			type: 'group',
			label: 'Danger zone',
			items: [{ label: 'Delete', onselect: remove, disabled: !canDelete }]
		}
	];
</script>

<DropdownMenu {items} label="Actions" />
```

## Select

A button that opens a list of options and sets one value, defined as data.

```svelte
<script>
	import { Select } from '@frostycle/rime/select';

	let country = $state(null);

	const items = [
		{ value: 'id', label: 'Indonesia' },
		{ value: 'th', label: 'Thailand' },
		{ type: 'separator' },
		{
			type: 'group',
			label: 'Coming soon',
			items: [{ value: 'vn', label: 'Vietnam', disabled: true }]
		}
	];
</script>

<label for="country">Country</label>
<Select id="country" {items} bind:value={country} name="country" placeholder="Choose a country" />
```

## Combobox

A text input that narrows a list as the user types and sets one value. You filter `items` yourself from the bound `query`.

```svelte
<script>
	import { Combobox } from '@frostycle/rime/combobox';

	let timezone = $state(null);
	let query = $state('');

	const visible = $derived(timezones.filter((zone) => contains(zone.label, query)));
</script>

<label for="timezone">Timezone</label>
<Combobox id="timezone" items={visible} bind:value={timezone} bind:query name="timezone" placeholder="Search timezones" />
```

## Documentation

Props, snippets, keyboard support, state attributes and Tailwind recipes are on [https://rime.frostycle.com](https://rime.frostycle.com).

- [Combobox](https://rime.frostycle.com/combobox)
- [Date pickers](https://rime.frostycle.com/date-pickers)
- [Dropdown menu](https://rime.frostycle.com/dropdown-menu)
- [Select](https://rime.frostycle.com/select)
- [Styling](https://rime.frostycle.com/styling)

## License

MIT

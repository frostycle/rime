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

### Props

| Prop | Type | Applies to | Notes |
|---|---|---|---|
| `value` | `string \| null`, or `{ start, end } \| null` | both | Bindable. Malformed values and reversed ranges throw. |
| `onchange` | `(value) => void` | both | Fires on user commits and `clear`, not when the parent sets `value`. |
| `min`, `max` | `string` | both | Inclusive. |
| `isDateDisabled` | `(date: string) => boolean` | both | A range may span disabled dates; only its endpoints are checked. |
| `minDays`, `maxDays` | `number` | range | Length counting both endpoints. |
| `months` | `number` | both | Default `1`. |
| `presets` | `{ label, value: () => V }[]` | both | Commit on click. Disabled when the result breaks the constraints. |
| `locale` | `string` | both | Default `en-US`. |
| `weekStartsOn` | `0`–`6` | both | Default from the locale, otherwise Sunday. |
| `labels` | `{ previousMonth, nextMonth, dialog, inRange }` | both | Accessible names. `dialog` also labels the default trigger when empty; `inRange` is appended to the name of days inside a range. |
| `disabled` | `boolean` | both | Renders no hidden inputs. |
| `transition` | `boolean` | both | Keeps the popup mounted through its CSS transition. Default `false`. |
| `name` | `string` | single | Renders a hidden input. |
| `startName`, `endName` | `string` | range | Render two hidden inputs, for `?from=…&to=…` filter forms. |
| `classes` | `{ trigger, popup, body, month, header, title, nav, grid, weekday, cell, day, presets, preset }` | both | Classes for default-rendered elements. |

### Snippets

All optional. Spread each `props` onto your element.

| Snippet | Arguments |
|---|---|
| `trigger` | `props, label, value, open, clear` |
| `popup` | `props, content` (render `content` for the default body) |
| `header` | `title, titleProps, previousProps, nextProps`, per month. `previousProps` is `null` except on the first month, `nextProps` except on the last. |
| `grid` | `month, weekdays, weeks, props, renderDay`, per month. `weeks` holds `null` outside that month. Call `{@render renderDay(date)}` for each date. |
| `day` | `date, dayNumber, props, selected, inRange, rangeStart, rangeEnd, preview, isToday, disabled`. Spread `props` onto a `<button>`: Enter and Space rely on its native click. |
| `presetList` | `presets` (each with `disabled`), `select` |

### State attributes

Style state with `data-*` attributes rather than props. They are present or absent, with no value.

| Element | Attributes |
|---|---|
| Trigger | `data-open`, `data-disabled`, `data-hover`, `data-focus`, `data-active` |
| Popup | `data-open`, plus `data-closed`, `data-enter` and `data-leave` with `transition` |
| Day | `data-selected`, `data-in-range`, `data-range-start`, `data-range-end`, `data-preview`, `data-today`, `data-disabled`, `data-hover`, `data-focus`, `data-active` |
| Previous, next, default presets | `data-hover`, `data-focus`, `data-active` |

`data-focus` appears for keyboard focus only. `data-hover` ignores touch, and disabled elements take neither `data-hover` nor `data-active`.

### Animating the popup

Add `transition` to keep the popup mounted until its CSS transition or animation ends. Style the closed state with `data-closed`, which applies at the start of entering and throughout leaving:

```svelte
<DatePicker transition classes={{ popup: 'transition duration-150 data-closed:opacity-0' }} />
```

Use `data-enter` and `data-leave` for different timing in each direction. Without `transition`, the popup unmounts as soon as it closes. Honour reduced motion in your own CSS, for example with `motion-reduce:transition-none`.

### Tailwind recipe

The library ships no Tailwind classes, so there is nothing to configure or override. Copy this wrapper into your project and own it. It needs Tailwind CSS v4, whose bare `data-selected:` variants it uses; in v3 write `data-[selected]:`.

```svelte
<!-- src/lib/components/DateRangeField.svelte -->
<script lang="ts">
	import {
		DateRangePicker,
		type DateRangePickerProps,
		type PickerClasses
	} from '@frostycle/rime/date-picker';

	let { value = $bindable(null), ...rest }: DateRangePickerProps = $props();

	const classes: PickerClasses = {
		trigger:
			'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 data-hover:bg-gray-50 data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-600 data-open:border-blue-600 data-disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:data-hover:bg-gray-700',
		popup:
			'rounded-lg border border-gray-200 bg-white p-4 text-gray-900 shadow-lg transition duration-150 ease-out data-closed:-translate-y-1 data-closed:opacity-0 motion-reduce:transition-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100',
		body: 'flex flex-wrap gap-6',
		presets: 'flex flex-col gap-1',
		preset:
			'rounded-md px-2 py-1 text-start text-sm data-hover:bg-gray-100 data-focus:outline-2 data-focus:outline-blue-600 disabled:opacity-40 dark:data-hover:bg-gray-700',
		header: 'mb-2 flex items-center gap-2',
		title: 'flex-1 text-center text-sm font-semibold',
		nav: 'size-8 rounded-md data-hover:bg-gray-100 data-focus:outline-2 data-focus:outline-blue-600 dark:data-hover:bg-gray-700',
		weekday: 'pb-1 text-xs font-medium text-gray-500 dark:text-gray-400',
		cell: 'p-0',
		day: 'size-9 rounded-md text-sm data-hover:bg-gray-100 data-focus:outline-2 data-focus:outline-blue-600 data-today:font-bold data-in-range:rounded-none data-in-range:bg-blue-100 data-range-start:rounded-s-md data-range-end:rounded-e-md data-range-start:bg-blue-600 data-range-start:text-white data-range-end:bg-blue-600 data-range-end:text-white data-selected:bg-blue-600 data-selected:text-white data-disabled:opacity-40 dark:data-hover:bg-gray-700 dark:data-in-range:bg-blue-900 dark:data-range-start:bg-blue-600 dark:data-range-end:bg-blue-600 dark:data-selected:bg-blue-600'
	};
</script>

<DateRangePicker bind:value transition {classes} {...rest} />
```

```svelte
<DateRangeField bind:value={period} months={2} {presets} />
```

### Validating URL values

An invalid `value` throws, so check anything from a URL first:

```ts
import { isIsoDate } from '@frostycle/rime/date-picker';

const from = url.searchParams.get('from');
const value = isIsoDate(from) ? from : null;
```

### Non-modal popup

The popup uses the native `popover` attribute, so it is not clipped by `overflow: hidden` parents and works inside a modal `<dialog>`. It deliberately does not trap focus: tabbing out closes it and discards a half-made range. In a two-month view, the Next control sits in the last month's header, so it follows the first month's grid in tab order.

### Styling

Write one styled wrapper per project and reuse it, as in the Tailwind recipe above. Dark mode belongs in that wrapper: the library sets no colours, so it has no theme prop.

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

Selecting an item closes the menu and returns focus to the trigger, then calls `onselect`, so a handler that opens a dialog can take focus.

### Props

| Prop | Type | Notes |
|---|---|---|
| `items` | `(T \| MenuSeparator \| MenuGroup<T>)[]` | Required. `T extends MenuItem`, so extra fields such as an icon flow into the `item` snippet. |
| `label` | `string` | Text of the default trigger. Default `Menu`. |
| `placement` | `Placement` from `@floating-ui/dom` | Default `bottom-start`. |
| `disabled` | `boolean` | Disables the trigger, and closes the menu if it is open. |
| `transition` | `boolean` | Keeps the popup mounted through its CSS transition, as on the date pickers. |
| `classes` | `{ trigger, popup, item, separator, group, groupLabel }` | Classes for default-rendered elements. |

`MenuItem` is `{ label, onselect?, href?, target?, rel?, disabled? }`. An item with `href` is a link, and a disabled link renders without `href`.

### Snippets

All optional. Spread each `props` onto your element.

| Snippet | Arguments |
|---|---|
| `trigger` | `props, open` |
| `popup` | `props, content` (render `content` for the default body) |
| `item` | `item, props, disabled`. Spread `props` onto a `<button>`, or an `<a>` when `item.href` is set. |
| `separator` | `props` |
| `groupLabel` | `label, props` |

### Keyboard

| Key | Action |
|---|---|
| Enter, Space, Down on the trigger | Open and focus the first enabled item |
| Up on the trigger | Open and focus the last enabled item |
| Down, Up | Move between enabled items, wrapping at the ends |
| Home, End | Go to the first or last enabled item |
| Printable characters | Jump to the next enabled item starting with what was typed |
| Enter, Space | Activate the current item |
| Escape | Close and return focus to the trigger |
| Tab | Close and let focus move on |

Disabled items are skipped. Hovering an enabled item moves focus to it, so pointer and keyboard share one current item.

### State attributes

| Element | Attributes |
|---|---|
| Trigger | `data-open`, `data-disabled`, `data-hover`, `data-focus`, `data-active` |
| Popup | `data-open`, plus `data-closed`, `data-enter` and `data-leave` with `transition` |
| Item | `data-disabled`, `data-hover`, `data-focus`, `data-active` |

### Tailwind recipe

Copy this wrapper into your project and own it. It needs Tailwind CSS v4.

```svelte
<!-- src/lib/components/ActionMenu.svelte -->
<script lang="ts" generics="T extends MenuItem">
	import {
		DropdownMenu,
		type DropdownMenuProps,
		type MenuClasses,
		type MenuItem
	} from '@frostycle/rime/dropdown-menu';

	let props: DropdownMenuProps<T> = $props();

	const classes: MenuClasses = {
		trigger:
			'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 data-hover:bg-gray-50 data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-600 data-open:border-blue-600 data-disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:data-hover:bg-gray-700',
		popup:
			'min-w-48 rounded-lg border border-gray-200 bg-white p-1.5 text-sm text-gray-900 shadow-lg transition duration-150 ease-out outline-none data-closed:-translate-y-1 data-closed:opacity-0 motion-reduce:transition-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100',
		item: 'block w-full rounded-md px-2.5 py-1.5 text-start outline-none data-hover:bg-gray-100 data-focus:bg-blue-600 data-focus:text-white data-disabled:opacity-50 dark:data-hover:bg-gray-700 dark:data-focus:bg-blue-500',
		separator: 'mx-1 my-1.5 h-px bg-gray-200 dark:bg-gray-700',
		groupLabel: 'px-2.5 pt-1.5 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400'
	};
</script>

<DropdownMenu transition {classes} {...props} />
```

### Behaviour to plan for

- Clicks inside the menu bubble like any native click. If a parent such as a table row handles clicks, stop them on a wrapper around the menu.
- Disabling an open menu closes it and disables the trigger, so focus falls to `<body>`. Move focus yourself if you disable a menu while it's in use.
- Items have no ids, so a recreated list matches the focused item by label. If labels repeat and the list also reorders, focus can land on the other item with that label.

## Select

A button that opens a list of options and sets one value, defined as data. It follows the select-only combobox pattern: focus stays on the trigger.

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

### Labelling

Every select needs a `<label for>` pointing at its `id`; a combobox does not take its name from its text. Use `<label for>` rather than a wrapping `<label>`: a wrapping label's text includes the trigger's own text, which would put the current value into the list's accessible name. Clicking the label focuses the trigger without opening the list. A custom `trigger` snippet must keep the spread `id`.

The list takes its name from the `<label>` text when it opens. Naming a custom trigger only with `aria-label` or `aria-labelledby` leaves the list unnamed, so keep a `<label for>` even then.

### Props

| Prop | Type | Notes |
|---|---|---|
| `items` | `(T \| SelectSeparator \| SelectGroup<T>)[]` | Required. `T extends SelectOption`, so extra fields such as an icon flow into the `option` snippet. |
| `value` | `string \| null` | Bindable. Default `null`, meaning nothing is selected. |
| `onchange` | `(value: string \| null) => void` | Called when the user picks a different value. |
| `id` | `string` | The trigger's id, so `<label for>` names the field. Defaults to a generated id. |
| `name` | `string` | Renders a hidden input carrying the value, empty when `null`. |
| `placeholder` | `string` | Trigger text while the value is `null`. |
| `placement` | `Placement` from `@floating-ui/dom` | Default `bottom-start`. |
| `disabled` | `boolean` | Disables the trigger, closes the list if it is open, and renders no hidden input. |
| `transition` | `boolean` | Keeps the popup mounted through its CSS transition, as on the date pickers. |
| `classes` | `{ trigger, popup, option, separator, group, groupLabel }` | Classes for default-rendered elements. |

`SelectOption` is `{ value, label, disabled? }`. A `value` with no matching option shows the placeholder and marks nothing selected; the component does not reset it. A form `reset` restores the value from when the component mounted. `required` and browser validation are not supported yet.

### Snippets

All optional. Spread each `props` onto your element.

| Snippet | Arguments |
|---|---|
| `trigger` | `props, open, selected` (the selected option, or `null`) |
| `popup` | `props, content` (render `content` for the default body) |
| `option` | `option, props, selected, highlighted, disabled` |
| `separator` | `props` |
| `groupLabel` | `label, props` |

Separators render with `role="none"` inside the list, since a listbox may contain only options and groups.

### Keyboard

| Key | Action |
|---|---|
| Enter, Space, Down, Up on the trigger | Open the list |
| Home, End on the trigger | Open with the first or last enabled option highlighted |
| Printable characters on the trigger | Open at the first matching enabled option |
| Down, Up | Move between enabled options, stopping at the ends |
| Home, End | Go to the first or last enabled option |
| Page Down, Page Up | Move ten enabled options |
| Printable characters | Jump to the next enabled option starting with what was typed. Typed text resets after 500 ms, repeating one character cycles through matches, and Space counts as typed text while it is being collected |
| Enter, Space | Select the highlighted option and close |
| Tab | Select the highlighted option, close, and let focus move on |
| Escape | Close without changing the value |

Focus stays on the trigger; the highlighted option is announced through `aria-activedescendant`. Disabled options are skipped. Hovering an enabled option highlights it, so pointer and keyboard share one highlight.

### State attributes

| Element | Attributes |
|---|---|
| Trigger | `data-open`, `data-disabled`, `data-placeholder`, `data-hover`, `data-focus`, `data-active` |
| Popup | `data-open`, plus `data-closed`, `data-enter` and `data-leave` with `transition` |
| Option | `data-highlighted`, `data-selected`, `data-disabled` |

### Tailwind recipe

Copy this wrapper into your project and own it. It needs Tailwind CSS v4.

```svelte
<!-- src/lib/components/AppSelect.svelte -->
<script lang="ts" generics="T extends SelectOption">
	import {
		Select,
		type SelectClasses,
		type SelectOption,
		type SelectProps
	} from '@frostycle/rime/select';

	let { value = $bindable(null), ...props }: SelectProps<T> = $props();

	const classes: SelectClasses = {
		trigger:
			'min-w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-start text-sm text-gray-900 data-hover:bg-gray-50 data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-600 data-open:border-blue-600 data-placeholder:text-gray-500 data-disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:data-hover:bg-gray-700',
		popup:
			'min-w-48 rounded-lg border border-gray-200 bg-white p-1.5 text-sm text-gray-900 shadow-lg transition duration-150 ease-out outline-none data-closed:-translate-y-1 data-closed:opacity-0 motion-reduce:transition-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100',
		option:
			'block w-full rounded-md px-2.5 py-1.5 text-start data-highlighted:bg-gray-100 data-selected:font-semibold data-disabled:opacity-50 dark:data-highlighted:bg-gray-700',
		separator: 'mx-1 my-1.5 h-px bg-gray-200 dark:bg-gray-700',
		groupLabel: 'px-2.5 pt-1.5 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400'
	};
</script>

<Select transition {classes} bind:value {...props} />
```

### Behaviour to plan for

- Disabling an open select closes it and disables the trigger, so focus falls to `<body>`. Move focus yourself if you disable a select while it's in use.

## License

MIT

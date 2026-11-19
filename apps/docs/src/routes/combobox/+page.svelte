<script lang="ts">
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import DocSection from '#lib/components/DocSection.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import RecipeSection from '#lib/components/RecipeSection.svelte';
	import ReferenceSections from '#lib/components/ReferenceSections.svelte';
	import ComboboxDemo from '#lib/demos/ComboboxDemo.svelte';
	import comboboxClasses from '#lib/demos/combobox-classes.ts?raw';
	import recipe from '#lib/demos/AppCombobox.svelte?raw';
	import { combobox } from '#lib/reference/combobox.js';
	import { inlineCode, prose } from '#lib/styles.js';

	const usage = `<script>
	import { Combobox } from '@frostycle/rime/combobox';

	let timezone = $state(null);
	let query = $state('');

	const visible = $derived(timezones.filter((zone) => contains(zone.label, query)));
<\/script>

<label for="timezone">Timezone</label>
<Combobox id="timezone" items={visible} bind:value={timezone} bind:query name="timezone" placeholder="Search timezones">
	{#snippet empty({ query })}<p>No timezone matches “{query}”.</p>{/snippet}
</Combobox>`;

	const containsRecipe = `const plain = (text) => text.toLowerCase().normalize('NFD').replace(/\\p{Diacritic}/gu, '');

const contains = (label, query) => plain(label).includes(plain(query));`;

	const serverSearch = `<script>
	import { Combobox } from '@frostycle/rime/combobox';

	const saved = { value: 'id', label: 'Indonesia' };

	let country = $state(saved.value);
	let query = $state('');
	let results = $state([]);

	$effect(() => {
		const controller = new AbortController();
		fetch(\`/api/countries?q=\${encodeURIComponent(query)}\`, { signal: controller.signal })
			.then((response) => response.json())
			.then((found) => (results = found));
		return () => controller.abort();
	});

	const items = $derived(query === '' ? [saved, ...results.filter((r) => r.value !== saved.value)] : results);
<\/script>

<label for="country">Country</label>
<Combobox id="country" {items} bind:value={country} bind:query />`;

	const recipeUsage =
		'<AppCombobox id="timezone" items={visible} bind:value={timezone} bind:query name="timezone" />';
</script>

<svelte:head>
	<title>Combobox | Rime</title>
</svelte:head>

<PageHeader title="Combobox">
	{#snippet lede()}
		A form field where the user types to narrow a list and picks one value from it. It follows the WAI-ARIA combobox
		pattern with list autocomplete: focus stays in the input while the highlighted option is announced.
	{/snippet}
</PageHeader>

<DocSection id="demo" title="Live demo">
	<p class={prose}>
		This is the Tailwind wrapper from the recipe below, running over every IANA timezone. Type part of a name, such as
		<code class={inlineCode}>jakar</code>, and pick one.
	</p>
	<div class="mt-4"><ComboboxDemo /></div>
</DocSection>

<DocSection id="usage" title="Usage">
	<p class={prose}>
		Items are the same data as <a href="/select">Select</a>: options, separators and labelled groups. Unlike Select,
		you filter them. Bind <code class={inlineCode}>query</code> to the typed text and pass the options to show as
		<code class={inlineCode}>items</code>. The value is always one of the options; free text is not a value.
	</p>
	<div class="mt-4"><CodeBlock code={usage} label="Combobox usage" /></div>
</DocSection>

<DocSection id="filtering" title="Filtering">
	<p class={prose}>
		The component has no matching rules of its own. Each change to <code class={inlineCode}>query</code> with text in it
		highlights the first enabled option, so Enter picks the best match. This is the case- and accent-insensitive "contains" filter the
		demo uses.
	</p>
	<div class="mt-4"><CodeBlock code={containsRecipe} label="Contains filter" /></div>
	<p class={prose}>
		To search a server, fetch the results yourself and pass them as <code class={inlineCode}>items</code> with no
		further filtering. While <code class={inlineCode}>query</code> is empty, include the current option in
		<code class={inlineCode}>items</code>. The input takes its label from the option with the selected value, and
		a value whose option was never in <code class={inlineCode}>items</code> shows an empty input.
	</p>
	<div class="mt-4"><CodeBlock code={serverSearch} label="Server search" /></div>
	<p class={prose}>
		There is no fetching, debouncing or loading state. The <code class={inlineCode}>empty</code> snippet receives
		<code class={inlineCode}>query</code>, so render "Searching…" from your own flag. When a filter removes the
		selected option, the input keeps the label of the option most recently picked or found.
	</p>
</DocSection>

<DocSection id="labelling" title="Labelling">
	<p class={prose}>
		The input is a labelable element, so <code class={inlineCode}>&lt;label for&gt;</code> pointing at its
		<code class={inlineCode}>id</code> names it, and clicking the label focuses it. The list takes the same label text
		as its accessible name when it opens. A custom <code class={inlineCode}>input</code> snippet must keep the spread
		<code class={inlineCode}>id</code>.
	</p>
	<p class={prose}>
		The input has <code class={inlineCode}>role="combobox"</code>, <code class={inlineCode}>aria-autocomplete="list"</code>,
		<code class={inlineCode}>aria-expanded</code>, <code class={inlineCode}>aria-controls</code> while open and
		<code class={inlineCode}>aria-activedescendant</code> while an option is highlighted. The list, options, groups and
		separators are exactly Select's. The optional toggle button is hidden from assistive technology and outside the tab
		order, because the input already opens the list with Down.
	</p>
</DocSection>

<ReferenceSections reference={combobox} name="Combobox">
	{#snippet snippetsNote()}
		<p class={prose}>
			While <code class={inlineCode}>empty</code> shows, the popup has no <code class={inlineCode}>listbox</code> role and
			the message is rendered in a <code class={inlineCode}>role="status"</code> element. Nothing is highlighted then.
		</p>
	{/snippet}
	{#snippet keyboardNote()}
		<p class={prose}>
			Focus never leaves the input; the highlighted option is announced through
			<code class={inlineCode}>aria-activedescendant</code>. Disabled options are skipped, and hovering an enabled
			option highlights it. Escape and Enter during IME composition, including Safari's keyCode 229, are ignored.
			Unlike Select, Tab does not pick: the highlight follows typing, so committing on Tab would pick by accident.
		</p>
	{/snippet}
</ReferenceSections>

<DocSection id="forms" title="Forms">
	<p class={prose}>
		With <code class={inlineCode}>name</code>, a hidden input carries the value, empty when it is
		<code class={inlineCode}>null</code>. The text input has no <code class={inlineCode}>name</code>, so what the user
		typed is never submitted. A pick or a clear fires bubbling <code class={inlineCode}>input</code> then
		<code class={inlineCode}>change</code> from the hidden input, like a native select. A form
		<code class={inlineCode}>reset</code> restores the value from when the component mounted and sets
		<code class={inlineCode}>query</code> to <code class={inlineCode}>''</code>. The input has
		<code class={inlineCode}>autocomplete="off"</code> so the browser's suggestions do not cover the list. There is no
		<code class={inlineCode}>required</code> yet.
	</p>
	<p class={prose}>
		Emptying the input and leaving the field, or pressing Enter with nothing highlighted, sets the value to
		<code class={inlineCode}>null</code> and calls <code class={inlineCode}>onchange(null)</code>. Leaving with other
		text that was not picked restores the selected label and keeps the value.
	</p>
</DocSection>

<RecipeSection
	variant="data-highlighted"
	files={[
		{ code: comboboxClasses, label: 'combobox-classes.ts' },
		{ code: recipe, label: 'AppCombobox.svelte' },
		{ code: recipeUsage, label: 'Using AppCombobox' }
	]}
/>

<DocSection id="behaviour" title="Behaviour to plan for">
	<p class={prose}>
		While the user is not editing, the input shows the selected label. Typing replaces it with the typed text and
		sets <code class={inlineCode}>query</code>; a pick, Escape, leaving the field, clicking outside the list or a form
		reset set <code class={inlineCode}>query</code> back to <code class={inlineCode}>''</code>. Leaving or clicking
		outside with the input emptied clears the value. The component never rewrites the input while the user types, and
		an emptied input highlights nothing until Down or Up.
	</p>
	<p class={prose}>
		When <code class={inlineCode}>items</code> has no options, the <code class={inlineCode}>empty</code> snippet is
		shown in the open list. Without it the list closes, and reopens when options return while the user is still
		typing. Closing the list with the toggle button keeps the typed text, and results arriving later do not reopen it
		until the user types again or presses Down or Up. When <code class={inlineCode}>items</code> change without a <code class={inlineCode}>query</code> change,
		such as late server results, the highlight stays on an option the user moved to; otherwise it goes to the first
		enabled option. Separators left at either end of the list, or next to each other, by groups your filter emptied
		are not rendered.
	</p>
	<p class={prose}>
		Disabling an open combobox closes it and disables the input, so focus falls to
		<code class={inlineCode}>&lt;body&gt;</code>. Move focus yourself if you disable one while it is in use. Free-text
		values, several values, opening on focus and virtualised lists are not supported.
	</p>
</DocSection>

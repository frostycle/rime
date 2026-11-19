<script lang="ts">
	import { flushSync } from 'svelte';
	import NativeSelect from '../NativeSelect.svelte';
	import type { SelectEntry } from '../types.js';

	let value = $state<string | null>('jp');
	let items = $state<SelectEntry[]>([{ value: 'id', label: 'Indonesia' }]);
	let seen = $state('');

	function addJapan() {
		items = [...items, { value: 'jp', label: 'Japan' }];
		flushSync();
		seen = document.querySelector('select')!.value;
	}
</script>

<form>
	<label for="country">Country</label>
	<NativeSelect id="country" name="country" {items} bind:value />
	<button type="button" onclick={addJapan}>Add Japan</button>
	<button type="reset">Reset</button>
</form>
<p data-testid="seen">{seen}</p>

<script lang="ts">
	import Select from '../Select.svelte';

	let { required = false, paneStyle = '' }: { required?: boolean; paneStyle?: string } = $props();
	const items = [
		{ value: 'id', label: 'Indonesia' },
		{ value: 'jp', label: 'Japan' }
	];
</script>

<form>
	<div data-testid="pane" style="height: 200px; overflow: auto; {paneStyle}">
		<div style="height: 3000px"></div>
		<label for="country">Country</label>
		<Select id="country" name="country" {items} {required} />
	</div>
</form>

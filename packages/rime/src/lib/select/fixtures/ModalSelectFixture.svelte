<script lang="ts">
	import Select from '../Select.svelte';
</script>

<dialog data-testid="modal" {@attach (element) => element.showModal()}>
	<label for="country">Country</label>
	<Select id="country" items={[{ value: 'id', label: 'Indonesia' }]} />
</dialog>

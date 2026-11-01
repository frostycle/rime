<script lang="ts">
	import DropdownMenu from '../DropdownMenu.svelte';
</script>

<dialog data-testid="modal" {@attach (element) => element.showModal()}>
	<DropdownMenu items={[{ label: 'Edit' }]} />
</dialog>

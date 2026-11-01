<script lang="ts">
	import DatePicker from '../DatePicker.svelte';
</script>

<dialog data-testid="modal" {@attach (element) => element.showModal()}>
	<DatePicker value="2026-10-15" />
</dialog>

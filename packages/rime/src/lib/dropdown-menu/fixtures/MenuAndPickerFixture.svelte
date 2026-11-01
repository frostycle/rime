<script lang="ts">
	import DatePicker from '../../date-picker/DatePicker.svelte';
	import DropdownMenu from '../DropdownMenu.svelte';
</script>

<DropdownMenu items={[{ label: 'Edit' }]} />
<DatePicker value="2026-10-15" />

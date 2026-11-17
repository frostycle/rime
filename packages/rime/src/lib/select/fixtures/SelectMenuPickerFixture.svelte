<script lang="ts">
	import DatePicker from '../../date-picker/DatePicker.svelte';
	import DropdownMenu from '../../dropdown-menu/DropdownMenu.svelte';
	import Select from '../Select.svelte';
</script>

<label for="country">Country</label>
<Select id="country" items={[{ value: 'id', label: 'Indonesia' }]} />
<DropdownMenu items={[{ label: 'Edit' }]} />
<DatePicker value="2026-10-15" />

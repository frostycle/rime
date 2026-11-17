<script lang="ts">
	import { DatePicker, type DatePickerProps } from '@frostycle/rime/date-picker';
	import { pickerClasses } from './picker-classes.js';

	let { value = $bindable(null), ...rest }: DatePickerProps = $props();
</script>

<DatePicker bind:value transition classes={pickerClasses} {...rest} />

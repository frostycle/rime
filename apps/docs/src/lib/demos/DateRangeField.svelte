<script lang="ts">
	import { DateRangePicker, type DateRangePickerProps } from '@frostycle/rime/date-picker';
	import { pickerClasses } from './picker-classes.js';

	let { value = $bindable(null), ...rest }: DateRangePickerProps = $props();
</script>

<DateRangePicker bind:value transition classes={pickerClasses} {...rest} />

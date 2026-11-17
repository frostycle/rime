<script lang="ts" generics="T extends SelectOption">
	import { Select, type SelectOption, type SelectProps } from '@frostycle/rime/select';
	import { selectClasses } from './select-classes.js';

	let { value = $bindable(null), ...props }: SelectProps<T> = $props();
</script>

<Select transition classes={selectClasses} bind:value {...props} />

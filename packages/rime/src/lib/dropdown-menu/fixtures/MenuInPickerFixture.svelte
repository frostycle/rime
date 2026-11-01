<script lang="ts">
	import DatePicker from '../../date-picker/DatePicker.svelte';
	import DropdownMenu from '../DropdownMenu.svelte';
</script>

<DatePicker value="2026-10-15">
	{#snippet popup({ props, content })}
		<div {...props}>
			{@render content()}
			<DropdownMenu items={[{ label: 'Edit' }]} />
		</div>
	{/snippet}
</DatePicker>

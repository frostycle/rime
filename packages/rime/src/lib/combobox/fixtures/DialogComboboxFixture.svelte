<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import LabelledComboboxFixture from './LabelledComboboxFixture.svelte';

	let props: ComponentProps<typeof LabelledComboboxFixture> = $props();
</script>

<dialog data-testid="modal" {@attach (element) => element.showModal()}>
	<LabelledComboboxFixture {...props} />
</dialog>

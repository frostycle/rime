<script lang="ts" generics="T extends MenuItem">
	import { DropdownMenu, type DropdownMenuProps, type MenuItem } from '@frostycle/rime/dropdown-menu';
	import { menuClasses } from './menu-classes.js';

	let props: DropdownMenuProps<T> = $props();
</script>

<DropdownMenu transition classes={menuClasses} {...props} />

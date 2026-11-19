import { flushSync } from 'svelte';

// A native <select> fires these on a user pick, and form-level listeners (SvelteKit remote form
// fields, dirty tracking) depend on them. The flush puts the new value in the field first.
export function announceChange(field: HTMLElement | undefined): void {
	flushSync();
	field?.dispatchEvent(new Event('input', { bubbles: true }));
	field?.dispatchEvent(new Event('change', { bubbles: true }));
}

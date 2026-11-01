import { createAttachmentKey } from 'svelte/attachments';

function isDisabled(element: HTMLElement): boolean {
	return element.matches(':disabled, [aria-disabled="true"]');
}

// Set on the DOM rather than through state, so hovering does not re-render every day cell.
function trackInteraction(element: HTMLElement) {
	const controller = new AbortController();
	const listen = <K extends keyof HTMLElementEventMap>(
		type: K,
		listener: (event: HTMLElementEventMap[K]) => void
	) => element.addEventListener(type, listener, { signal: controller.signal });
	const release = () => element.removeAttribute('data-active');

	listen('pointerenter', (event) => {
		if (event.pointerType !== 'touch' && !isDisabled(element)) {
			element.setAttribute('data-hover', '');
		}
	});
	listen('pointerleave', () => {
		element.removeAttribute('data-hover');
		release();
	});
	listen('pointerdown', () => {
		if (!isDisabled(element)) element.setAttribute('data-active', '');
	});
	listen('pointerup', release);
	listen('pointercancel', release);
	listen('focus', () => {
		element.toggleAttribute('data-focus', element.matches(':focus-visible'));
	});
	listen('blur', () => element.removeAttribute('data-focus'));

	return () => controller.abort();
}

export const interactionProps = { [createAttachmentKey()]: trackInteraction };

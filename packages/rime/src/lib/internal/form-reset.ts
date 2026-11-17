export function watchFormReset(element: HTMLElement, restore: () => void): () => void {
	const form = element.closest('form');
	if (!form) return () => {};
	form.addEventListener('reset', restore);
	return () => form.removeEventListener('reset', restore);
}

export function createPointerMoveFilter(): { moved(event: PointerEvent): boolean; reset(): void } {
	let last: { x: number; y: number } | null = null;
	return {
		// Items that scroll or appear under a parked pointer fire pointerenter, and WebKit also sends
		// pointermove, so only a changed position counts as the user moving.
		moved({ clientX: x, clientY: y }) {
			const moved = last?.x !== x || last?.y !== y;
			last = { x, y };
			return moved;
		},
		reset() {
			last = null;
		}
	};
}

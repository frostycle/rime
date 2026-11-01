import { firstEnabled, lastEnabled, matchTypeahead, stepEnabled } from './menu-items.js';
import type { MenuItem } from './types.js';
import { interactionProps } from '../internal/interaction.js';

const TYPEAHEAD_RESET_MS = 500;
const INDEX_ATTRIBUTE = 'data-menu-index';

export type MenuOptions<T extends MenuItem> = {
	items: () => T[];
	onTab: () => void;
};

export class Menu<T extends MenuItem> {
	#items: () => T[];
	#onTab: () => void;
	#root: HTMLElement | null = null;
	#typed = '';
	#typedTimer: ReturnType<typeof setTimeout> | undefined;
	#focusWithin = false;
	#focusedItem: T | null = null;
	#lastPointer: { x: number; y: number } | null = null;

	constructor({ items, onTab }: MenuOptions<T>) {
		this.#items = items;
		this.#onTab = onTab;
	}

	setRoot(element: HTMLElement): () => void {
		this.#root = element;
		const controller = new AbortController();
		element.addEventListener(
			'focusin',
			() => {
				this.#focusWithin = true;
				this.#focusedItem = this.#items()[this.#currentIndex()] ?? null;
			},
			{ signal: controller.signal }
		);
		// A removed item reports a null relatedTarget, and syncFocus must still recover from that.
		element.addEventListener(
			'focusout',
			({ relatedTarget }) => {
				if (relatedTarget instanceof Node && !element.contains(relatedTarget)) {
					this.#focusWithin = false;
				}
			},
			{ signal: controller.signal }
		);
		element.addEventListener('pointerleave', () => (this.#lastPointer = null), {
			signal: controller.signal
		});
		return () => {
			controller.abort();
			this.#root = null;
			this.#focusWithin = false;
		};
	}

	focusFirst(): void {
		this.#focusIndex(firstEnabled(this.#items()));
	}

	focusLast(): void {
		this.#focusIndex(lastEnabled(this.#items()));
	}

	syncFocus(): void {
		if (!this.#focusWithin) return;
		const items = this.#items();
		const index = this.#indexOfFocusedItem(items);
		const target = index !== -1 && !items[index].disabled ? index : firstEnabled(items);
		this.#focusedItem = items[target] ?? null;
		if (target !== this.#currentIndex()) this.#focusIndex(target);
	}

	resetTypeahead(): void {
		clearTimeout(this.#typedTimer);
		this.#typed = '';
	}

	itemProps(item: T, index: number, activate: (item: T) => void): Record<string | symbol, unknown> {
		const disabled = item.disabled ?? false;
		const link = item.href !== undefined;
		return {
			role: 'menuitem',
			tabindex: -1,
			type: link ? undefined : 'button',
			href: disabled ? undefined : item.href,
			target: link ? item.target : undefined,
			rel: link ? item.rel : undefined,
			'aria-disabled': disabled ? 'true' : undefined,
			'data-disabled': disabled ? '' : undefined,
			[INDEX_ATTRIBUTE]: index,
			onmousedown: (event: MouseEvent) => {
				if (disabled) event.preventDefault();
			},
			onclick: (event: MouseEvent) => {
				if (disabled) event.preventDefault();
				else activate(item);
			},
			onpointermove: (event: PointerEvent) => {
				if (this.#isRealPointerMove(event) && !disabled && event.pointerType !== 'touch') {
					(event.currentTarget as HTMLElement).focus();
				}
			},
			...interactionProps
		};
	}

	onKeydown = (event: KeyboardEvent): void => {
		// A key held on the trigger repeats onto the item that opening just focused.
		if (event.repeat && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			return;
		}
		const items = this.#items();
		const current = this.#currentIndex();
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				this.#focusIndex(stepEnabled(items, current, 1));
				return;
			case 'ArrowUp':
				event.preventDefault();
				this.#focusIndex(stepEnabled(items, current < 0 ? 0 : current, -1));
				return;
			case 'Home':
				event.preventDefault();
				this.focusFirst();
				return;
			case 'End':
				event.preventDefault();
				this.focusLast();
				return;
			case 'Tab':
				this.#onTab();
				return;
		}
		if (event.key === ' ' && this.#typed === '') {
			this.#activateWithSpace(event);
			return;
		}
		if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
			event.preventDefault();
			this.#typeahead(event.key, current);
		}
	};

	// Items that scroll or appear under a parked pointer fire pointerenter, and WebKit also sends
	// pointermove, so only a changed position counts as the user moving.
	#isRealPointerMove({ clientX: x, clientY: y }: PointerEvent): boolean {
		const moved = this.#lastPointer?.x !== x || this.#lastPointer?.y !== y;
		this.#lastPointer = { x, y };
		return moved;
	}

	#indexOfFocusedItem(items: T[]): number {
		const focused = this.#focusedItem;
		if (!focused) return -1;
		const current = this.#currentIndex();
		const sameObject = items[current] === focused ? current : items.indexOf(focused);
		if (sameObject !== -1) return sameObject;
		// Recreated items, such as from $derived, are new objects, so the label identifies them.
		if (items[current]?.label === focused.label) return current;
		return items.findIndex(({ label }) => label === focused.label);
	}

	// Buttons click natively on Space. Anything else, including an empty menu, would scroll the page.
	#activateWithSpace(event: KeyboardEvent): void {
		const target = event.target as HTMLElement;
		if (target.tagName === 'BUTTON') return;
		event.preventDefault();
		if (target !== this.#root) target.click();
	}

	#typeahead(character: string, current: number): void {
		clearTimeout(this.#typedTimer);
		this.#typed += character;
		this.#typedTimer = setTimeout(() => (this.#typed = ''), TYPEAHEAD_RESET_MS);
		const match = matchTypeahead(this.#items(), this.#typed, current);
		if (match !== -1) this.#focusIndex(match);
	}

	#currentIndex(): number {
		const active = document.activeElement;
		if (!active || !this.#root?.contains(active)) return -1;
		const value = active.closest(`[${INDEX_ATTRIBUTE}]`)?.getAttribute(INDEX_ATTRIBUTE);
		return value == null ? -1 : Number(value);
	}

	#focusIndex(index: number): void {
		if (index === -1) {
			this.#root?.focus();
			return;
		}
		this.#root?.querySelector<HTMLElement>(`[${INDEX_ATTRIBUTE}="${index}"]`)?.focus();
	}
}

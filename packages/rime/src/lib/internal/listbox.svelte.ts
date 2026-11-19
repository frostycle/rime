import {
	firstEnabled,
	isTypeaheadKey,
	lastEnabled,
	matchTypeahead,
	moveEnabled
} from './list-items.js';
import type { ListOption } from './list-types.js';
import { createPointerMoveFilter } from './pointer.js';

const TYPEAHEAD_RESET_MS = 500;
const PAGE_SIZE = 10;

export function optionId(prefix: string, index: number): string {
	return `${prefix}-option-${index}`;
}

export class Listbox<T extends ListOption> {
	#items: () => T[];
	#textInput: boolean;
	#onPointerHighlight: () => void;
	#highlightedValue: string | null = null;
	#typed = '';
	#typedTimer: ReturnType<typeof setTimeout> | undefined;
	#pointer = createPointerMoveFilter();

	highlighted = $state(-1);

	constructor(
		items: () => T[],
		options: { textInput?: boolean; onPointerHighlight?: () => void } = {}
	) {
		this.#items = items;
		this.#textInput = options.textInput ?? false;
		this.#onPointerHighlight = options.onPointerHighlight ?? (() => {});
	}

	highlightOnOpen(value: string | null): void {
		const items = this.#items();
		const selected = items.findIndex((option) => option.value === value);
		this.#highlight(selected !== -1 && !items[selected].disabled ? selected : firstEnabled(items));
	}

	highlightFirst(): void {
		this.#highlight(firstEnabled(this.#items()));
	}

	highlightLast(): void {
		this.#highlight(lastEnabled(this.#items()));
	}

	clearHighlight(): void {
		this.#highlight(-1);
	}

	highlightMatch(character: string): void {
		this.#typeahead(character, -1);
	}

	navigate(event: KeyboardEvent): boolean {
		const step = this.#stepFor(event.key);
		if (step !== null) {
			event.preventDefault();
			this.#highlight(moveEnabled(this.#items(), this.highlighted, step));
			return true;
		}
		if (this.#textInput) return false;
		switch (event.key) {
			case 'Home':
				event.preventDefault();
				this.highlightFirst();
				return true;
			case 'End':
				event.preventDefault();
				this.highlightLast();
				return true;
		}
		if (event.key === ' ' && this.#typed === '') return false;
		if (!isTypeaheadKey(event)) return false;
		event.preventDefault();
		this.#typeahead(event.key, this.highlighted);
		return true;
	}

	syncHighlight(): void {
		const items = this.#items();
		const kept = items.findIndex((option) => option.value === this.#highlightedValue);
		this.#highlight(kept !== -1 && !items[kept].disabled ? kept : firstEnabled(items));
	}

	resetTypeahead(): void {
		clearTimeout(this.#typedTimer);
		this.#typed = '';
	}

	optionProps(
		option: T,
		index: number,
		id: string,
		select: (option: T) => void
	): Record<string | symbol, unknown> {
		const disabled = option.disabled ?? false;
		return {
			id,
			role: 'option',
			'aria-disabled': disabled ? 'true' : undefined,
			'data-disabled': disabled ? '' : undefined,
			'data-highlighted': this.highlighted === index ? '' : undefined,
			onclick: () => {
				if (!disabled) select(option);
			},
			onpointermove: (event: PointerEvent) => {
				if (this.#pointer.moved(event) && !disabled && event.pointerType !== 'touch') {
					this.#highlight(index);
					this.#onPointerHighlight();
				}
			}
		};
	}

	#stepFor(key: string): number | null {
		switch (key) {
			case 'ArrowDown':
				return 1;
			case 'ArrowUp':
				return -1;
			case 'PageDown':
				return PAGE_SIZE;
			case 'PageUp':
				return -PAGE_SIZE;
			default:
				return null;
		}
	}

	#typeahead(character: string, from: number): void {
		clearTimeout(this.#typedTimer);
		this.#typed += character;
		this.#typedTimer = setTimeout(() => (this.#typed = ''), TYPEAHEAD_RESET_MS);
		const match = matchTypeahead(this.#items(), this.#typed, from);
		if (match !== -1) this.#highlight(match);
	}

	#highlight(index: number): void {
		this.highlighted = index;
		this.#highlightedValue = this.#items()[index]?.value ?? null;
	}
}

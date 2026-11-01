import { autoUpdate, computePosition, flip, shift, type Placement } from '@floating-ui/dom';
import { createAttachmentKey } from 'svelte/attachments';
import { interactionProps } from './interaction.js';

export type CloseReason = 'commit' | 'escape' | 'outside' | 'focus-left';

export type PopoverOptions = {
	animated?: () => boolean;
	role?: 'dialog' | 'menu';
	placement?: () => Placement;
};

const PHASE_ATTRIBUTES = ['data-closed', 'data-enter', 'data-leave'];

// Popups can nest, and each listens on document, so Escape must go to the newest one only.
const openPopovers: Popover[] = [];

function removeFromOpen(popover: Popover): void {
	const position = openPopovers.indexOf(popover);
	if (position !== -1) openPopovers.splice(position, 1);
}

async function settleAnimations(element: HTMLElement): Promise<void> {
	await Promise.allSettled(element.getAnimations({ subtree: true }).map(({ finished }) => finished));
}

export class Popover {
	#id: string;
	#onClose: (reason: CloseReason) => void;
	#animated: () => boolean;
	#role: 'dialog' | 'menu';
	#placement: () => Placement;
	#triggerKey = createAttachmentKey();
	#contentKey = createAttachmentKey();
	#triggerElement: HTMLElement | null = null;
	#contentElement: HTMLElement | null = null;
	#openAtPointerDown: boolean | null = null;
	#transitionRun = 0;

	open = $state(false);
	mounted = $state(false);

	constructor(id: string, onClose: (reason: CloseReason) => void, options: PopoverOptions = {}) {
		this.#id = id;
		this.#onClose = onClose;
		this.#animated = options.animated ?? (() => false);
		this.#role = options.role ?? 'dialog';
		this.#placement = options.placement ?? (() => 'bottom-start');
	}

	get triggerProps(): Record<string | symbol, unknown> {
		return {
			type: 'button',
			'aria-haspopup': this.#role,
			'aria-expanded': this.open,
			'aria-controls': this.open ? this.#id : undefined,
			'data-open': this.open ? '' : undefined,
			onpointerdown: this.#onTriggerPointerDown,
			onclick: this.#onTriggerClick,
			[this.#triggerKey]: this.#attachTrigger,
			...interactionProps
		};
	}

	get contentProps(): Record<string | symbol, unknown> {
		return {
			id: this.#id,
			// Not "auto": the browser hides those instantly on light dismiss, which rules out a
			// leave transition, so outside clicks are handled in #onDocumentPointerDown instead.
			popover: 'manual',
			role: this.#role,
			'data-open': this.open ? '' : undefined,
			onfocusout: this.#onFocusOut,
			[this.#contentKey]: this.#attachContent
		};
	}

	get triggerElement(): HTMLElement | null {
		return this.#triggerElement;
	}

	show(): void {
		this.open = true;
		this.mounted = true;
		removeFromOpen(this);
		openPopovers.push(this);
		if (this.#contentElement) this.#cancelLeave(this.#contentElement);
	}

	close(reason: CloseReason): void {
		if (!this.open) return;
		this.open = false;
		removeFromOpen(this);
		// Safari does not focus buttons on click, so focus must be returned explicitly.
		if (reason === 'commit' || reason === 'escape') this.#triggerElement?.focus();
		this.#onClose(reason);
		if (this.#animated() && this.#contentElement) void this.#leave(this.#contentElement);
		else this.mounted = false;
	}

	#attachTrigger = (element: HTMLElement) => {
		this.#triggerElement = element;
		return () => {
			this.#triggerElement = null;
		};
	};

	#attachContent = (element: HTMLElement) => {
		this.#contentElement = element;
		Object.assign(element.style, {
			position: 'fixed',
			margin: '0',
			top: '0',
			left: '0',
			right: 'auto',
			bottom: 'auto'
		});
		const animated = this.#animated();
		if (animated) element.setAttribute('data-closed', '');
		element.showPopover();
		if (animated) void this.#enter(element);
		const stopPositioning = this.#triggerElement
			? autoUpdate(this.#triggerElement, element, () => this.#position(element))
			: undefined;
		document.addEventListener('keydown', this.#onDocumentKeydown, true);
		document.addEventListener('pointerdown', this.#onDocumentPointerDown, true);
		return () => {
			stopPositioning?.();
			document.removeEventListener('keydown', this.#onDocumentKeydown, true);
			document.removeEventListener('pointerdown', this.#onDocumentPointerDown, true);
			removeFromOpen(this);
			this.#contentElement = null;
		};
	};

	async #enter(element: HTMLElement): Promise<void> {
		const run = ++this.#transitionRun;
		element.setAttribute('data-enter', '');
		// Forces the closed styles to apply first; otherwise the browser sees no change to transition.
		void element.offsetHeight;
		element.removeAttribute('data-closed');
		await settleAnimations(element);
		if (run === this.#transitionRun) element.removeAttribute('data-enter');
	}

	async #leave(element: HTMLElement): Promise<void> {
		const run = ++this.#transitionRun;
		element.inert = true;
		element.removeAttribute('data-enter');
		element.setAttribute('data-closed', '');
		element.setAttribute('data-leave', '');
		await settleAnimations(element);
		if (run === this.#transitionRun) this.mounted = false;
	}

	#cancelLeave(element: HTMLElement): void {
		this.#transitionRun++;
		element.inert = false;
		for (const attribute of PHASE_ATTRIBUTES) element.removeAttribute(attribute);
	}

	async #position(element: HTMLElement): Promise<void> {
		if (!this.#triggerElement) return;
		const { x, y } = await computePosition(this.#triggerElement, element, {
			strategy: 'fixed',
			placement: this.#placement(),
			middleware: [flip(), shift()]
		});
		element.style.left = `${x}px`;
		element.style.top = `${y}px`;
	}

	// Pressing the trigger moves focus out of the popup, which closes it before the click arrives,
	// so the click would reopen it without this record of the earlier state.
	#onTriggerPointerDown = () => {
		this.#openAtPointerDown = this.open;
	};

	#onTriggerClick = () => {
		const wasOpen = this.#openAtPointerDown ?? this.open;
		this.#openAtPointerDown = null;
		if (wasOpen) this.close('outside');
		else this.show();
	};

	// Handled at keydown so the reason is known; preventDefault keeps a surrounding <dialog> open.
	#onDocumentKeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape' || openPopovers.at(-1) !== this) return;
		event.preventDefault();
		event.stopImmediatePropagation();
		this.close('escape');
	};

	#onDocumentPointerDown = (event: PointerEvent) => {
		const target = event.target;
		if (!(target instanceof Node)) return;
		if (this.#contentElement?.contains(target) || this.#triggerElement?.contains(target)) return;
		this.close('outside');
	};

	// A null relatedTarget is not a departure: clicking non-focusable popup content produces it.
	#onFocusOut = (event: FocusEvent) => {
		const next = event.relatedTarget;
		if (next instanceof Node && !this.#contentElement?.contains(next)) this.close('focus-left');
	};
}

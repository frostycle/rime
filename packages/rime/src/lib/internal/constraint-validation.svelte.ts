const CONTROL_STYLE =
	'position: fixed; top: 0; left: 0; opacity: 0; pointer-events: none; width: 1px; height: 1px; margin: 0; border: 0; padding: 0; appearance: none';

export type ConstraintValidationOptions = {
	trigger: () => HTMLElement | null;
	required: () => boolean;
	disabled: () => boolean;
	empty: () => boolean;
};

export class ConstraintValidation {
	#options: ConstraintValidationOptions;
	#failed = $state(false);

	readonly controlProps: Record<string, unknown>;

	constructor(options: ConstraintValidationOptions) {
		this.#options = options;
		this.controlProps = {
			tabindex: -1,
			'aria-hidden': 'true',
			style: CONTROL_STYLE,
			onfocus: this.#onControlFocus,
			oninvalid: () => (this.#failed = true)
		};
	}

	get invalid(): boolean {
		const { required, disabled, empty } = this.#options;
		return this.#failed && required() && !disabled() && empty();
	}

	// No aria-required: ARIA does not allow it on a plain button trigger, so callers whose trigger
	// role permits it add it themselves.
	get triggerProps(): Record<string, unknown> {
		const invalid = this.invalid;
		return {
			'aria-invalid': invalid ? 'true' : undefined,
			'data-invalid': invalid ? '' : undefined
		};
	}

	reset(): void {
		this.#failed = false;
	}

	// The browser focuses the first invalid control on a blocked submit and places its message by
	// that control's box. Covering the trigger only then keeps the control fixed and 1px (no page
	// scroll) the rest of the time; measuring after placement corrects for an ancestor that a
	// transform makes the containing block.
	#onControlFocus = (event: FocusEvent) => {
		const trigger = this.#options.trigger();
		if (!trigger) return;
		trigger.focus();
		// WebKit does not scroll a control focused from inside another control's focus handler.
		trigger.scrollIntoView({ block: 'nearest', inline: 'nearest' });
		const control = event.currentTarget as HTMLElement;
		const goal = trigger.getBoundingClientRect();
		control.style.left = '0px';
		control.style.top = '0px';
		const origin = control.getBoundingClientRect();
		control.style.left = `${goal.left - origin.left}px`;
		control.style.top = `${goal.top - origin.top}px`;
		control.style.width = `${goal.width}px`;
		control.style.height = `${goal.height}px`;
	};
}

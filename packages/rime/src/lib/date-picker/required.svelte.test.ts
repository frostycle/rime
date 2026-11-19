import { expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import FormFixture from './fixtures/FormFixture.svelte';
import RequiredCustomTriggerFixture from './fixtures/RequiredCustomTriggerFixture.svelte';

type Kind = 'single' | 'range';

const form = () => document.querySelector('form')!;
const data = () => Object.fromEntries(new FormData(form()));
const emptyTrigger = (kind: Kind) =>
	page.getByRole('button', { name: kind === 'single' ? 'Choose date' : 'Choose dates' });
const validatedInput = () => document.querySelector<HTMLInputElement>('input[type="text"][required]');
const chosen: Record<Kind, string | { start: string; end: string }> = {
	single: '2026-10-15',
	range: { start: '2026-10-01', end: '2026-10-31' }
};

async function pick(kind: Kind) {
	await emptyTrigger(kind).click();
	const days = page.getByRole('grid').getByRole('button');
	await days.nth(0).click();
	if (kind === 'range') await days.nth(1).click();
	await expect.element(page.getByRole('grid')).not.toBeInTheDocument();
}

function submitSpy() {
	const onsubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
	form().addEventListener('submit', onsubmit);
	return onsubmit;
}

test.each<Kind>(['single', 'range'])('required blocks submit while nothing is chosen (%s)', async (kind) => {
	await render(FormFixture, { kind, required: true });
	expect(form().checkValidity()).toBe(false);
});

test.each<Kind>(['single', 'range'])('required passes once a value is picked (%s)', async (kind) => {
	await render(FormFixture, { kind, required: true });
	await pick(kind);
	expect(form().checkValidity()).toBe(true);
});

test.each<Kind>(['single', 'range'])(
	'the submitted data is identical with and without required (%s)',
	async (kind) => {
		for (const value of [chosen[kind], null]) {
			const { rerender, unmount } = await render(FormFixture, { kind, value });
			const recorded = data();
			await rerender({ required: true });
			expect(data()).toEqual(recorded);
			unmount();
		}
	}
);

test.each<Kind>(['single', 'range'])(
	'a disabled required picker neither validates nor submits (%s)',
	async (kind) => {
		await render(FormFixture, { kind, required: true, disabled: true });
		expect(form().checkValidity()).toBe(true);
		expect(data()).toEqual({});
	}
);

test.each<Kind>(['single', 'range'])(
	'the trigger has no aria-required, which ARIA does not allow on a button (%s)',
	async (kind) => {
		await render(FormFixture, { kind, required: true });
		await expect.element(emptyTrigger(kind)).not.toHaveAttribute('aria-required');
	}
);

test.each<Kind>(['single', 'range'])('a blocked submit focuses the trigger (%s)', async (kind) => {
	await render(FormFixture, { kind, required: true });
	const onsubmit = submitSpy();
	form().requestSubmit();
	await expect.element(emptyTrigger(kind)).toHaveFocus();
	expect(onsubmit).not.toHaveBeenCalled();
});

test.each<Kind>(['single', 'range'])(
	'the invalid state appears only after validation fails (%s)',
	async (kind) => {
		await render(FormFixture, { kind, required: true });
		await expect.element(emptyTrigger(kind)).not.toHaveAttribute('data-invalid');
		await expect.element(emptyTrigger(kind)).not.toHaveAttribute('aria-invalid');
		form().checkValidity();
		await expect.element(emptyTrigger(kind)).toHaveAttribute('data-invalid');
		await expect.element(emptyTrigger(kind)).toHaveAttribute('aria-invalid', 'true');
	}
);

test.each<Kind>(['single', 'range'])('picking a value clears the invalid state (%s)', async (kind) => {
	await render(FormFixture, { kind, required: true });
	form().checkValidity();
	await pick(kind);
	const trigger = page.getByRole('button').first();
	await expect.element(trigger).not.toHaveAttribute('data-invalid');
	await expect.element(trigger).not.toHaveAttribute('aria-invalid');
});

test.each<Kind>(['single', 'range'])('form reset clears the invalid state (%s)', async (kind) => {
	await render(FormFixture, { kind, required: true });
	form().checkValidity();
	await expect.element(emptyTrigger(kind)).toHaveAttribute('data-invalid');
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect.element(emptyTrigger(kind)).not.toHaveAttribute('data-invalid');
	await expect.element(emptyTrigger(kind)).not.toHaveAttribute('aria-invalid');
});

test.each<Kind>(['single', 'range'])('a value set from outside clears the invalid state (%s)', async (kind) => {
	const { rerender } = await render(FormFixture, { kind, required: true });
	form().checkValidity();
	await expect.element(emptyTrigger(kind)).toHaveAttribute('data-invalid');
	await rerender({ value: chosen[kind] });
	const trigger = page.getByRole('button').first();
	await expect.element(trigger).not.toHaveAttribute('data-invalid');
	await expect.element(trigger).not.toHaveAttribute('aria-invalid');
});

test.each<Kind>(['single', 'range'])('turning required off clears the invalid state (%s)', async (kind) => {
	const { rerender } = await render(FormFixture, { kind, required: true });
	form().checkValidity();
	await expect.element(emptyTrigger(kind)).toHaveAttribute('data-invalid');
	await rerender({ required: false });
	await expect.element(emptyTrigger(kind)).not.toHaveAttribute('data-invalid');
	expect(validatedInput()).toBeNull();
});

test('a range with only its first day clicked still blocks submit', async () => {
	await render(FormFixture, { kind: 'range', required: true });
	const onsubmit = submitSpy();
	await emptyTrigger('range').click();
	await page.getByRole('grid').getByRole('button').nth(0).click();
	form().requestSubmit();
	await expect.element(emptyTrigger('range')).toHaveFocus();
	expect(onsubmit).not.toHaveBeenCalled();
});

test('the invalid state reaches a custom trigger', async () => {
	await render(RequiredCustomTriggerFixture);
	form().checkValidity();
	const trigger = page.getByTestId('div-trigger');
	await expect.element(trigger).toHaveAttribute('aria-invalid', 'true');
	await expect.element(trigger).toHaveAttribute('data-invalid');
});

test('the validated input is nameless and hidden from assistive technology', async () => {
	await render(FormFixture, { kind: 'single', required: true });
	const input = validatedInput()!;
	expect(input.hasAttribute('name')).toBe(false);
	expect(input.getAttribute('tabindex')).toBe('-1');
	expect(input.getAttribute('aria-hidden')).toBe('true');
	expect(input.getAttribute('autocomplete')).toBe('off');
});

test('after a blocked submit the validated input covers the trigger', async () => {
	const { rerender } = await render(FormFixture, { kind: 'single' });
	const withoutRequired = document.documentElement.scrollHeight;
	await rerender({ required: true });
	expect(document.documentElement.scrollHeight).toBe(withoutRequired);
	submitSpy();
	form().requestSubmit();
	await expect.element(emptyTrigger('single')).toHaveFocus();
	const trigger = emptyTrigger('single').element().getBoundingClientRect();
	const anchor = validatedInput()!.getBoundingClientRect();
	expect(anchor.left).toBeCloseTo(trigger.left, 0);
	expect(anchor.top).toBeCloseTo(trigger.top, 0);
	expect(anchor.width).toBeCloseTo(trigger.width, 0);
	expect(anchor.height).toBeCloseTo(trigger.height, 0);
});

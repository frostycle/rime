import type { PropDoc, ReferenceOf } from './types.js';

type Two = { a?: string; b: number };
const doc = { type: 'string', notes: '' } satisfies PropDoc;

// @ts-expect-error every prop must be documented
export const missing: ReferenceOf<Two> = { a: doc };
// @ts-expect-error documented names must exist on the props type
export const extra: ReferenceOf<Two> = { a: doc, b: doc, c: doc };
export const complete: ReferenceOf<Two> = { a: doc, b: doc };

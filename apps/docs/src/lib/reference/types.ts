export type PropDoc = {
	type: string;
	default?: string;
	notes: string;
	appliesTo?: 'both' | 'single' | 'range';
};

export type SnippetDoc = { args: string; notes?: string };

export type ReferenceOf<P> = { readonly [K in keyof Required<P>]: PropDoc | SnippetDoc };

export type KeyDoc = { keys: string; action: string };

export type AttributeDoc = { element: string; attributes: string };

export type ComponentReference<P> = {
	props: ReferenceOf<P>;
	keyboard: KeyDoc[];
	attributes: AttributeDoc[];
};

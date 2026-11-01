import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { expect, test } from 'vitest';
import pkg from '../../../package.json';

test('the package has one runtime dependency and the right exports', () => {
	expect(Object.keys(pkg.dependencies)).toEqual(['@floating-ui/dom']);
	expect(pkg.peerDependencies.svelte).toBe('^5.29.0');
	expect(Object.keys(pkg.exports)).toEqual(['./date-picker', './dropdown-menu']);
	expect(pkg.publishConfig.access).toBe('public');
});

test('test fixtures are left out of the published files', () => {
	expect(pkg.files).toContain('!dist/**/fixtures/**');
	expect(pkg.files).toContain('!dist/**/*Fixture*');
});

test('relative imports are fully specified, or published types degrade under NodeNext', () => {
	const libRoot = resolve('src/lib');
	const sources = readdirSync(libRoot, { recursive: true, encoding: 'utf8' }).filter(
		(file) => /\.(ts|svelte)$/.test(file) && !/\.test\.|\.d\.ts$|Fixture|fixtures/.test(file)
	);
	const unresolved = sources.flatMap((file) => {
		const specifiers = readFileSync(join(libRoot, file), 'utf8').matchAll(/from '(\.[^']+)'/g);
		return [...specifiers]
			.map(([, specifier]) => specifier)
			.filter((specifier) => {
				const target = resolve(libRoot, dirname(file), specifier);
				return !existsSync(target) && !existsSync(target.replace(/\.js$/, '.ts'));
			})
			.map((specifier) => `${file}: ${specifier}`);
	});
	expect(sources.length).toBeGreaterThan(5);
	expect(unresolved).toEqual([]);
});

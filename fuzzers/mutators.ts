import { evaluateXPath } from 'fontoxpath';

/**
 * Generates a random number number between 0 and {@link upper}.
 *
 * @param upper - The upper bound of the random number.
 * @returns The generated random number.
 */
export function rand(upper: number): number {
	return Math.floor(Math.random() * upper);
}

/**
 * Pick a random language XPath, XQuery, XQuery UF.
 *
 * @returns The randomly selected language.
 */
export function randomLanguage(): string {
	const idx = rand(3);
	switch (idx) {
		case 0:
			return evaluateXPath.XPATH_3_1_LANGUAGE;
		case 1:
			return evaluateXPath.XQUERY_3_1_LANGUAGE;
		case 2:
			return evaluateXPath.XQUERY_UPDATE_3_1_LANGUAGE;
		default:
			throw new Error('Out of bounds');
	}
}

export enum BACKEND {
	EXPRESSION = 'expression',
	JS_CODEGEN = 'js-codegen',
}

/**
 * Pick a random backend.
 *
 * @returns The randomly selected backend.
 */
export function randomBackend(): BACKEND {
	const index = rand(2);
	switch (index) {
		case 0:
			return BACKEND.EXPRESSION;
		case 1:
			return BACKEND.JS_CODEGEN;
		default:
			throw new Error('Out of bounds');
	}
}

const STRING_POOL =
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-[]{}()<>,./?:;"\'|\\!@#$%^&*+=';
function randomString(len: number): string {
	let str = '';
	for (let ii = 0; ii < len; ii++) {
		str += STRING_POOL.charAt(rand(STRING_POOL.length));
	}
	return str;
}

/**
 * Mutate a random number of characters.
 *
 * @param input - The input string which to mutate.
 * @returns Returns the mutated string.
 */
export function mutateCharactersInPlace(input: string): string {
	for (let ii = 0; ii < rand(4) + 1; ii++) {
		const idx = rand(input.length);
		const replacement = randomString(1);
		input = input.substr(0, idx) + replacement + input.substr(idx + replacement.length);
	}
	return input;
}

/**
 * Mutate the input string.
 *
 * @param input - The input string which to mutate.
 * @returns Returns the mutated string.
 */
export function mutateString(input: string): string {
	let arr = input.split('');
	// 1 in 20 chance to reverse the input
	if (rand(20) === 0) {
		arr = arr.reverse();
	}

	// 1 in 4 chance to delete random range of chars from the input
	if (rand(4) === 0) {
		arr.splice(rand(arr.length), rand(arr.length));
	}

	// 1 in 4 chance to insert random range of chars
	if (rand(4) === 0) {
		const insertions = randomString(rand(arr.length)).split('');
		const args: any[] = [rand(arr.length), 0];
		arr.splice.apply(arr, args.concat(insertions));
	}

	input = arr.join('');
	return input;
}

import {
	complete,
	delimited,
	error,
	followed,
	map,
	not,
	okWithValue,
	optional,
	or,
	Parser,
	ParseResult,
	peek,
	plus,
	preceded,
	star,
	then,
	token,
} from 'prsc';
import { IAST } from '../astHelper';
import { parse } from '../xPathParser';
import { mainModule } from './prscXQuery';

export const whitespace: Parser<string> = map(star(token(' ')), (x) => x.join(''));
export const whitespacePlus: Parser<string> = map(plus(token(' ')), (x) => x.join(''));

export function surrounded<T, S>(parser: Parser<T>, around: Parser<S>): Parser<T> {
	return delimited(around, parser, around);
}

export function precededMultiple<T, S>(before: Parser<S>[], parser: Parser<T>): Parser<T> {
	return before.reverse().reduce((prev, curr) => preceded(curr, prev), parser);
}

export function wrapArray<T>(parser: Parser<T>): Parser<[T]> {
	return map(parser, (x) => [x]);
}

export function binaryOperator(
	exp: Parser<IAST>,
	operator: Parser<string>,
	constructionFn?: (lhs: IAST, rhs: [string, IAST][]) => IAST
): Parser<IAST> {
	return then(
		exp,
		star(then(surrounded(operator, whitespace), exp, (a, b) => [a, b])),
		constructionFn
			? constructionFn
			: (lhs: IAST, rhs: [string, IAST][]) =>
					rhs.reduce(
						(lh, rh) => [rh[0], ['firstOperand', lh], ['secondOperand', rh[1]]],
						lhs
					)
	);
}

export function nonRepeatableBinaryOperator(
	exp: Parser<IAST>,
	operator: Parser<string>,
	firstArgName: string = 'firstOperand',
	secondArgName: string = 'secondOperand'
): Parser<IAST> {
	return then(
		exp,
		optional(then(surrounded(operator, whitespace), exp, (a, b) => [a, b])),
		(lhs: IAST, rhs: [string, IAST] | null) => {
			if (rhs === null) {
				return lhs;
			}
			return [rhs[0], [firstArgName, lhs], [secondArgName, rhs[1]]];
		}
	);
}

export function alias(tokenNames: string[], name: string): Parser<string> {
	return map(or(tokenNames.map(token)), (_) => name);
}

export function regex(reg: RegExp): Parser<string> {
	return (input: string, offset: number): ParseResult<string> => {
		const match = reg.exec(input.substring(offset));
		if (match && match.index === 0) {
			return okWithValue(offset + match[0].length, match[0]);
		} else {
			return error(offset, [reg.source], false);
		}
	};
}

export function isAttributeTest(test: IAST): boolean {
	return test[0] === 'attributeTest' || test[0] === 'schemaAttributeTest';
}

function assertValidCodePoint(codePoint: number) {
	if (
		(codePoint >= 0x1 && codePoint <= 0xd7ff) ||
		(codePoint >= 0xe000 && codePoint <= 0xfffd) ||
		(codePoint >= 0x10000 && codePoint <= 0x10ffff)
	) {
		return;
	}
	throw new Error(
		'XQST0090: The character reference ' +
			codePoint +
			' (' +
			codePoint.toString(16) +
			') does not reference a valid codePoint.'
	);
}

export function parseCharacterReferences(input: string): string {
	// TODO: this is not supported in xpath
	return input.replace(/(&[^;]+);/g, (match) => {
		if (/^&#x/.test(match)) {
			const codePoint = parseInt(match.slice(3, -1), 16);
			assertValidCodePoint(codePoint);
			return String.fromCodePoint(codePoint);
		}

		if (/^&#/.test(match)) {
			const codePoint = parseInt(match.slice(2, -1), 10);
			assertValidCodePoint(codePoint);
			return String.fromCodePoint(codePoint);
		}

		switch (match) {
			case '&lt;':
				return '<';
			case '&gt;':
				return '>';
			case '&amp;':
				return '&';
			case '&quot;':
				return String.fromCharCode(34);
			case '&apos;':
				return String.fromCharCode(39);
		}
		throw new Error('XPST0003: Unknown character reference: "' + match + '"');
	});
}

export function wrapInSequenceExprIfNeeded(exp: IAST): IAST {
	switch (exp[0]) {
		// These expressions do not have to be wrapped (are allowed in a filterExpr)
		case 'constantExpr':
		case 'varRef':
		case 'contextItemExpr':
		case 'functionCallExpr':
		case 'sequenceExpr':
		case 'elementConstructor':
		case 'computedElementConstructor':
		case 'computedAttributeConstructor':
		case 'computedDocumentConstructor':
		case 'computedTextConstructor':
		case 'computedCommentConstructor':
		case 'computedNamespaceConstructor':
		case 'computedPIConstructor':
		case 'orderedExpr':
		case 'unorderedExpr':
		case 'namedFunctionRef':
		case 'inlineFunctionExpr':
		case 'dynamicFunctionInvocationExpr':
		case 'mapConstructor':
		case 'arrayConstructor':
		case 'stringConstructor':
		case 'unaryLookup':
			return exp;
	}
	return ['sequenceExpr', exp];
}

export const assertAdjacentOpeningTerminal: Parser<string> = peek(
	// TODO: add other whitespace characters
	or([token('('), token('"'), token("'"), token(' ')])
);

export const unimplemented: Parser<IAST> = wrapArray(token('unimplemented'));

// 1: Module - https://www.w3.org/TR/xquery-31/#doc-xquery31-Module
export function parseUsingPrsc(xpath: string): ParseResult<IAST> {
	const parser: Parser<IAST> = map(mainModule, (x) => ['module', x]);
	return complete(parser)(xpath, 0);
}

const query = '@*';

const prscResult = parseUsingPrsc(query);

if (prscResult.success === true) {
	const old = parse(query, { outputDebugInfo: false, xquery: true });
	const prsc = prscResult.value;
	if (JSON.stringify(old) !== JSON.stringify(prsc)) {
		console.log('DIFFER');
		console.log('OLD');
		console.log(JSON.stringify(old, null, 4));
		console.log('PRSC');
		console.log(JSON.stringify(prsc, null, 4));
	} else {
		console.log('CORRECT!');
		console.log(JSON.stringify(prsc, null, 4));
	}
} else {
	console.log('Failed to parse:');
	console.log(prscResult.expected);
}
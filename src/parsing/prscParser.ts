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
import { IAST } from './astHelper';
import parseExpression from './parseExpression';

const whitespace: Parser<string> = map(star(token(' ')), (x) => x.join(''));
const whitespacePlus: Parser<string> = map(plus(token(' ')), (x) => x.join(''));

function surrounded<T, S>(parser: Parser<T>, around: Parser<S>): Parser<T> {
	return delimited(around, parser, around);
}

function precededMultiple<T, S>(before: Parser<S>[], parser: Parser<T>): Parser<T> {
	return before.reverse().reduce((prev, curr) => preceded(curr, prev), parser);
}

function wrapArray<T>(parser: Parser<T>): Parser<[T]> {
	return map(parser, (x) => [x]);
}

function binaryOperator(
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

function nonRepeatableBinaryOperator(exp: Parser<IAST>, operator: Parser<string>): Parser<IAST> {
	return then(
		exp,
		optional(then(surrounded(operator, whitespace), exp, (a, b) => [a, b])),
		(lhs: IAST, rhs: [string, IAST] | null) => {
			if (rhs === null) {
				return lhs;
			}
			return [rhs[0], ['firstOperand', lhs], ['secondOperand', rhs[1]]];
		}
	);
}

function alias(tokenNames: string[], name: string): Parser<string> {
	return map(or(tokenNames.map(token)), (_) => name);
}

function regex(reg: RegExp): Parser<string> {
	return (input: string, offset: number): ParseResult<string> => {
		const match = reg.exec(input.substring(offset));
		if (match && match.index === 0) {
			return okWithValue(offset + match[0].length, match[0]);
		} else {
			return error(offset, [reg.source], false);
		}
	};
}

function isAttributeTest(nodeTest: IAST): boolean {
	return nodeTest[0] === 'attributeTest' || nodeTest[0] === 'schemaAttributeTest';
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

function parseCharacterReferences(input: string): string {
	// TODO: this is not supported in xpath

	return input.replace(/(&[^;]+);/g, function (match) {
		if (/^&#x/.test(match)) {
			var codePoint = parseInt(match.slice(3, -1), 16);
			assertValidCodePoint(codePoint);
			return String.fromCodePoint(codePoint);
		}

		if (/^&#/.test(match)) {
			var codePoint = parseInt(match.slice(2, -1), 10);
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

function wrapInSequenceExprIfNeeded(exp: IAST): IAST {
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

const assertAdjacentOpeningTerminal: Parser<string> = peek(
	// TODO: add other whitespace characters
	or([token('('), token('"'), token("'"), token(' ')])
);

const unimplemented: Parser<IAST> = wrapArray(token('unimplemented'));

const predicate: Parser<IAST> = preceded(
	token('['),
	followed(surrounded(expr, whitespace), token(']'))
);

const forwardAxis: Parser<string> = map(
	or(
		[
			'child::',
			'descendant::',
			'attribute::',
			'self::',
			'descendant-or-self::',
			'following-sibling::',
			'following::',
		].map(token)
	),
	(x: string) => x.substring(0, x.length - 2)
);

const reverseAxis: Parser<string> = map(
	or(
		['parent::', 'ancestor::', 'preceding-sibling::', 'preceding::', 'ancestor-or-self::'].map(
			token
		)
	),
	(x: string) => x.substring(0, x.length - 2)
);

const documentTest: Parser<IAST> = unimplemented;

const elementTest: Parser<IAST> = unimplemented;

const attributeTest: Parser<IAST> = unimplemented;

const schemaElementTest: Parser<IAST> = unimplemented;

const piTest: Parser<IAST> = unimplemented;

const commentTest: Parser<IAST> = wrapArray(alias(['comment()'], 'commentTest'));

const textTest: Parser<IAST> = wrapArray(alias(['text()'], 'textTest'));

const namespaceNodeTest: Parser<IAST> = wrapArray(alias(['namespace-node()'], 'namespaceTest'));

const anyKindTest: Parser<IAST> = wrapArray(alias(['node()'], 'anyKindTest'));

const kindTest: Parser<IAST> = or([
	documentTest,
	elementTest,
	attributeTest,
	schemaElementTest,
	piTest,
	commentTest,
	textTest,
	namespaceNodeTest,
	anyKindTest,
]);

const ncNameStartChar: Parser<string> = or([
	regex(
		/[A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
	),
	then(regex(/[\uD800-\uDB7F]/), regex(/[\uDC00-\uDFFF]/), (a, b) => a + b),
]);

const ncNameChar: Parser<string> = or([
	ncNameStartChar,
	regex(/[\-\.0-9\xB7\u0300-\u036F\u203F\u2040]/),
]);

const ncName: Parser<string> = then(ncNameStartChar, star(ncNameChar), (a, b) => a + b.join(''));

const localPart: Parser<string> = ncName;

const unprefixedName: Parser<IAST> = wrapArray(localPart);

const xmlPrefix: Parser<string> = ncName;

// TODO: give this better types
const prefixedName: Parser<any> = then(
	xmlPrefix,
	preceded(token(':'), localPart),
	(prefix, local) => [{ ['prefix']: prefix }, local]
);

// TODO: give this better types
const qName: Parser<any> = or([prefixedName, unprefixedName]);

// TODO: add uri qualified name
const eqName: Parser<IAST> = or([qName]) as Parser<IAST>;

const wildcard: Parser<IAST> = or([
	map(preceded(token('*:'), ncName), (x) => [
		'Wildcard',
		['star'],
		['NCName', x],
	]) as Parser<IAST>,
	wrapArray(alias(['*'], 'Wildcard')),
	// TODO: implement bracedURILiteral
	map(followed(ncName, token(':*')), (x) => [
		'Wildcard',
		['NCName', x],
		['star'],
	]) as Parser<IAST>,
]);

const nameTest: Parser<IAST> = map(or([wildcard, eqName]), (x: IAST) => ['nameTest', ...x]);

const nodeTest: Parser<IAST> = or([kindTest, nameTest]);

const abbrevForwardStep: Parser<IAST> = then(optional(token('@')), nodeTest, (a, b) => {
	return a !== null || isAttributeTest(b)
		? ['stepExpr', ['xpathAxis', 'attribute'], b]
		: ['stepExpr', ['xpathAxis', 'child'], b];
});

const forwardStep: Parser<IAST> = or([
	then(forwardAxis, nodeTest, (axis, test) => ['stepExpr', ['xpathAxis', axis], test]),
	abbrevForwardStep,
]);

const reverseStep: Parser<IAST> = then(reverseAxis, nodeTest, (axis, test) => [
	'stepExpr',
	['xpathAxis', axis],
	test,
]);

const predicateList: Parser<IAST | undefined> = map(
	star(preceded(whitespace, predicate)),
	(x: IAST[]) => (x.length > 0 ? ['predicates', ...x] : undefined)
);

const axisStep: Parser<IAST> = then(
	or([forwardStep, reverseStep]),
	predicateList,
	(a: IAST, b: IAST | undefined) => (b === undefined ? a : (a.concat([b]) as IAST))
);

const digits: Parser<string> = regex(/[0-9]+/);

const doubleLiteral: Parser<IAST> = unimplemented;

const decimalLiteral: Parser<IAST> = or([
	map(preceded(token('.'), digits), (x) => ['decimalConstantExpr', ['value', '.' + x]]),
	then(followed(digits, token('.')), optional(digits), (first, second) => [
		'decimalConstantExpr',
		['value', first + '.' + (second !== null ? second : '')],
	]),
]);

const integerLiteral: Parser<IAST> = map(
	digits,
	(x) => ['integerConstantExpr', ['value', x]] as IAST
);

const numericLiteral: Parser<IAST> = followed(
	or([doubleLiteral, decimalLiteral, integerLiteral]),
	peek(not(regex(/[a-zA-Z]/), ['no alphabetical characters after numeric literal']))
);

const escapeQuot: Parser<string> = alias(['""'], '"');

const escapeApos: Parser<string> = alias(["''"], "'");

// TODO: add check for xquery
const stringLiteral: Parser<string> = or([
	// TODO: add more advanced string literals
	map(surrounded(star(or([escapeQuot, regex(/[^\"]/)])), token('"')), (x) => x.join('')),
	map(surrounded(star(or([escapeApos, regex(/[^']/)])), token("'")), (x) => x.join('')),
]);

const literal: Parser<IAST> = or([
	numericLiteral,
	map(stringLiteral, (x) => ['stringConstantExpr', ['value', parseCharacterReferences(x)]]),
]);

const varName: Parser<IAST> = eqName;

const varRef: Parser<IAST> = map(preceded(token('$'), varName), (x) => ['varRef', ['name', ...x]]);

const parenthesizedExpr: Parser<IAST> = or([
	delimited(token('('), surrounded(expr, whitespace), token(')')),
	map(delimited(token('('), whitespace, token(')')), (_) => ['sequenceExpr']),
]);

const contextItemExpr: Parser<IAST> = map(
	followed(
		token('.'),
		peek(not(token('.'), ['context item should not be followed by another .']))
	),
	(_) => ['contextItemExpr']
);

const reservedFunctionNames = or([
	token('array'),
	token('attribute'),
	token('comment'),
	token('document-node'),
	token('element'),
	token('empty-sequence'),
	token('function'),
	token('if'),
	token('item'),
	token('map'),
	token('namespace-node'),
	token('node'),
	token('processing-instruction'),
	token('schema-attribute'),
	token('schema-element'),
	token('switch'),
	token('text'),
	token('typeswitch'),
]);

const argumentPlaceholder: Parser<IAST> = wrapArray(alias(['?'], 'argumentPlaceholder'));

const argument: Parser<IAST> = or([exprSingle, argumentPlaceholder]);

const argumentList: Parser<IAST[]> = delimited(
	token('('),
	surrounded(
		optional(
			then(
				argument,
				star(preceded(surrounded(token(','), whitespace), argument)),
				(first, following) => [first, ...following]
			)
		),
		whitespace
	),
	token(')')
);

const functionCall: Parser<IAST> = preceded(
	not(
		then(
			reservedFunctionNames,
			then(whitespace, token('('), (_a, _b) => undefined),
			(_a, _b) => undefined
		),
		['cannot use reseved keyword for function names']
	),
	then(eqName, preceded(whitespace, argumentList), (name, args) => [
		'functionCallExpr',
		['functionName', ...name],
		['arguments', ...args],
	])
);

// TODO: add other variants
const primaryExpr: Parser<IAST> = or([
	literal,
	varRef,
	parenthesizedExpr,
	contextItemExpr,
	functionCall,
]);

// TODO: actually add the postfix expr
const postfixExprWithStep: Parser<IAST> = unimplemented;

const stepExprWithForcedStep: Parser<IAST> = or([
	map(postfixExprWithStep, (x) => ['stepExpr', ...x]),
	axisStep,
]);

const postfixExprWithoutStep: Parser<IAST> = followed(
	primaryExpr,
	not(
		peek(
			preceded(
				whitespace,
				or([
					// TODO: add predicate before and lookup after
					argumentList,
				])
			)
		),
		['predicate', 'argument list', 'lookup']
	)
);

const stepExprWithoutStep: Parser<IAST> = postfixExprWithoutStep;

// TODO: add other variants
const relativePathExpr: Parser<IAST> = or([
	stepExprWithoutStep,
	map(stepExprWithForcedStep, (x) => ['pathExpr', x]),
]);

const absolutePathExpr: Parser<IAST> = unimplemented;

const pathExpr: Parser<IAST> = or([relativePathExpr, absolutePathExpr]);

const validateExpr: Parser<IAST> = unimplemented;

const extensionExpr: Parser<IAST> = unimplemented;

// TODO: wrap in stacktrace
const simpleMapExpr: Parser<IAST> = binaryOperator(
	pathExpr,
	token('!'),
	(lhs: IAST, rhs: [string, IAST][]) => {
		if (rhs.length === 0) {
			return lhs;
		} else {
			return [
				'simpleMapExpr',
				lhs[0] === 'pathExpr'
					? lhs
					: ['pathExpr', ['stepExpr', ['filterExpr', wrapInSequenceExprIfNeeded(lhs)]]],
			].concat(
				rhs.map((value) => {
					const item: IAST = value[1];
					return item[0] === 'pathExpr'
						? item
						: [
								'pathExpr',
								['stepExpr', ['filterExpr', wrapInSequenceExprIfNeeded(item)]],
						  ];
				})
			) as IAST;
		}
	}
);

const valueExpr: Parser<IAST> = or([validateExpr, extensionExpr, simpleMapExpr]);

const unaryExpr: Parser<IAST> = or([
	then(
		or([alias(['-'], 'unaryMinusOp'), alias(['+'], 'unaryPlusOp')]),
		preceded(whitespace, unaryExprIndirect),
		(op, value) => [op, ['operand', value]]
	),
	valueExpr,
]);

function unaryExprIndirect(input: string, offset: number): ParseResult<IAST> {
	return unaryExpr(input, offset);
}

const arrowExpr: Parser<IAST> = unaryExpr;

const typeName: Parser<IAST> = eqName;

const simpleTypeName: Parser<IAST> = typeName;

const singleType: Parser<IAST> = then(simpleTypeName, optional(token('?')), (typeName, optional) =>
	optional !== null
		? ['singleType', ['atomicType', ...typeName], ['optional']]
		: ['singleType', ['atomicType', ...typeName]]
);

const castExpr: Parser<IAST> = then(
	arrowExpr,
	optional(
		precededMultiple(
			[
				whitespace,
				token('cast'),
				whitespacePlus,
				token('as'),
				assertAdjacentOpeningTerminal,
				whitespace,
			],
			singleType
		)
	),
	(lhs, rhs) => (rhs !== null ? ['castExpr', ['argExpr', lhs], rhs] : lhs)
);

const castableExpr: Parser<IAST> = then(
	castExpr,
	optional(
		precededMultiple(
			[
				whitespace,
				token('castable'),
				whitespacePlus,
				token('as'),
				assertAdjacentOpeningTerminal,
				whitespace,
			],
			singleType
		)
	),
	(lhs, rhs) => (rhs !== null ? ['castableExpr', ['argExpr', lhs], rhs] : lhs)
);

const atomicOrUnionType: Parser<IAST> = map(eqName, (x) => ['atomicType', ...x]);

// TODO: add other tests
const itemType: Parser<IAST> = or([
	kindTest,
	wrapArray(alias(['item()'], 'anyItemType')),
	atomicOrUnionType,
]);

const occurrenceIndicator: Parser<string> = or(['?', '*', '+'].map(token));

const sequenceType: Parser<any> = or([
	map(token('empty-sequence()'), (_) => [['voidSequenceType']]),
	then(itemType, optional(occurrenceIndicator), (type, occurrence) => [
		type,
		...(occurrence !== null ? [['occurrenceIndicator', occurrence]] : []),
	]),
]);

const treatExpr: Parser<IAST> = then(
	castableExpr,
	optional(
		precededMultiple(
			[
				whitespace,
				token('treat'),
				whitespacePlus,
				token('as'),
				assertAdjacentOpeningTerminal,
				whitespace,
			],
			sequenceType
		)
	),
	(lhs, rhs) => (rhs !== null ? ['treatExpr', ['argExpr', lhs], ['sequenceType', ...rhs]] : lhs)
);

const instanceofExpr: Parser<IAST> = then(
	treatExpr,
	optional(
		precededMultiple(
			[
				whitespace,
				token('instance'),
				whitespacePlus,
				token('of'),
				assertAdjacentOpeningTerminal,
				whitespace,
			],
			map(token('integer'), (x) => [x])
		)
	),
	(lhs, rhs) =>
		rhs !== null ? ['instanceOfExpr', ['argExpr', lhs], ['sequenceType', ...rhs]] : lhs
);

const intersectExpr: Parser<IAST> = binaryOperator(
	instanceofExpr,
	followed(
		or([alias(['intersect'], 'intersectOp'), alias(['except'], 'excetpOp')]),
		assertAdjacentOpeningTerminal
	)
);

const unionExpr: Parser<IAST> = binaryOperator(
	intersectExpr,
	or([
		alias(['|'], 'unionOp'),
		followed(alias(['union'], 'unionOp'), assertAdjacentOpeningTerminal),
	])
);

const multiplicativeExpr: Parser<IAST> = binaryOperator(
	unionExpr,
	or([
		alias(['*'], 'multiplyOp'),
		alias(['div'], 'divOp'),
		alias(['idiv'], 'idivOp'),
		alias(['mod'], 'modOp'),
	])
);

const additiveExpr: Parser<IAST> = binaryOperator(
	multiplicativeExpr,
	or([alias(['-'], 'subtractOp'), alias(['+'], 'addOp')])
);

const rangeExpr: Parser<IAST> = nonRepeatableBinaryOperator(
	additiveExpr,
	alias(['to'], 'rangeSequenceExpr')
);

const stringConcatExpr: Parser<IAST> = binaryOperator(
	rangeExpr,
	alias(['||'], 'stringConcatenateOp')
);

const valueCompare: Parser<string> = map(
	or([token('eq'), token('ne'), token('lt'), token('le'), token('gt'), token('ge')]),
	(x) => x + 'Op'
);

const nodeCompare: Parser<string> = or([
	alias(['is'], 'isOp'),
	alias(['<<'], 'nodeBeforeOp'),
	alias(['>>'], 'nodeAfterOp'),
]);

const generalCompare: Parser<string> = or([
	alias(['='], 'equalOp'),
	alias(['!='], 'notEqualOp'),
	alias(['<='], 'lessThanOrEqualOp'),
	alias(['<'], 'lessThanOp'),
	alias(['>='], 'greaterThanOrEqualOp'),
	alias(['>'], 'greaterThanOp'),
]);

const comparisonExpr: Parser<IAST> = nonRepeatableBinaryOperator(
	stringConcatExpr,
	or([valueCompare, nodeCompare, generalCompare])
);

const andExpr: Parser<IAST> = binaryOperator(comparisonExpr, alias(['and'], 'andOp'));

const orExpr: Parser<IAST> = binaryOperator(andExpr, alias(['or'], 'orOp'));

// TODO: add support for flwor, quantified, switch, typeswitch, if, insert, delete, rename, replace, and copymodify
function exprSingle(input: string, offset: number): ParseResult<IAST> {
	return orExpr(input, offset);
}

function expr(input: string, offset: number): ParseResult<IAST> {
	return binaryOperator(exprSingle, token(','), (lhs, rhs) => {
		return rhs.length === 0 ? lhs : ['sequenceExpr', lhs, ...rhs];
	})(input, offset);
}

const queryBody: Parser<IAST> = map(expr, (x) => ['queryBody', x]);

// TODO: add prolog
const mainModule: Parser<IAST> = map(queryBody, (x) => ['mainModule', x]);

export function parseUsingPrsc(xpath: string): ParseResult<IAST> {
	const parser: Parser<IAST> = map(mainModule, (x) => ['module', x]);
	return complete(parser)(xpath, 0);
}

//const query = "'test'";
//
//const prscResult = parseUsingPrsc(query);
//
//if (prscResult.success === true) {
//	const old = parseExpression(query, {});
//	const prsc = prscResult.value;
//	if (JSON.stringify(old) !== JSON.stringify(prsc)) {
//		console.log('DIFFER');
//		console.log('OLD');
//		console.log(JSON.stringify(old, null, 4));
//		console.log('PRSC');
//		console.log(JSON.stringify(prsc, null, 4));
//	} else {
//		console.log('CORRECT!');
//		console.log(JSON.stringify(prsc, null, 4));
//	}
//} else {
//	console.log('Failed to parse:');
//	console.log(prscResult.expected);
//}

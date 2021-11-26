import {
	error,
	complete,
	followed,
	peek,
	map,
	optional,
	or,
	Parser,
	ParseResult,
	preceded,
	star,
	then,
	token,
	okWithValue,
	delimited,
} from 'prsc';
import { IAST } from './astHelper';
import parseExpression from './parseExpression';

const whitespace: Parser<string[]> = star(token(' '));

function surrounded<T, S>(parser: Parser<T>, around: Parser<S>): Parser<T> {
	return delimited(around, parser, around);
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

const assertAdjacentOpeningTerminal: Parser<string> = peek(
	// TODO: add other whitespace characters
	or([token('('), token('"'), token("'"), token(' ')])
);

const unimplemented: Parser<IAST> = map(token('unimplemented'), (x) => [x]);

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

const kindTest: Parser<IAST> = unimplemented;

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

const ncNameStartChar: Parser<string> = or([
	regex(
		/[A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
	),
	then(regex(/[\uD800-\uDB7F]/), regex(/[\uDC00-\uDFFF]/), (a, b) => a + b),
]);

// FIXME: ncNameStartChar seems to be working but combining that with otiher chars breaks the code
// Take for example: `ncName('test', 0)`
const ncNameChar: Parser<string> = or([
	ncNameStartChar,
	regex(/[\-\.0-9\xB7\u0300-\u036F\u203F\u2040]/),
]);

const ncName: Parser<string> = then(ncNameStartChar, star(ncNameChar), (a, b) => a + b.join(''));

const localPart: Parser<string> = ncName;

const unprefixedName: Parser<IAST> = map(localPart, (x) => [x]);

// TODO: add prefixed name
const qName: Parser<IAST> = unprefixedName;

// TODO: add uri qualified name
const eqName: Parser<IAST> = qName;

const nameTest: Parser<IAST> = map(
	or([
		// TODO: implement wildcard
		eqName,
	]),
	(x: IAST) => ['nameTest', ...x]
);

const nodeTest: Parser<IAST> = or([kindTest, nameTest]);

// TODO: add abbrev forward step
const forwardStep: Parser<IAST> = then(forwardAxis, nodeTest, (axis, test) => [
	'stepExpr',
	['xpathAxis', axis],
	test,
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

// TODO: add other variants
const stepExprWithForcedStep: Parser<IAST> = axisStep;

// TODO: add other variants
const relativePathExpr: Parser<IAST> = or([map(stepExprWithForcedStep, (x) => ['pathExpr', x])]);

const absolutePathExpr: Parser<IAST> = unimplemented;

const pathExpr: Parser<IAST> = or([relativePathExpr, absolutePathExpr]);

const validateExpr: Parser<IAST> = unimplemented;

const extensionExpr: Parser<IAST> = unimplemented;

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

// TODO: adjacent opening terminal
const castExpr: Parser<IAST> = arrowExpr;

// TODO: adjacent opening terminal
const castableExpr: Parser<IAST> = castExpr;

// TODO: adjacent opening terminal
const treatExpr: Parser<IAST> = castableExpr;

// TODO: adjacent opening terminal
const instanceofExpr: Parser<IAST> = treatExpr;

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
const exprSingle: Parser<IAST> = orExpr;

// TODO: add support for sequence expressions
function expr(input: string, offset: number): ParseResult<IAST> {
	return exprSingle(input, offset);
}

const queryBody: Parser<IAST> = map(expr, (x) => ['queryBody', x]);

// TODO: add prolog
const mainModule: Parser<IAST> = map(queryBody, (x) => ['mainModule', x]);

export function parseUsingPrsc(xpath: string): ParseResult<IAST> {
	const parser: Parser<IAST> = map(mainModule, (x) => ['module', x]);
	return complete(parser)(xpath, 0);
}

const query = '-parent::p';

const prscResult = parseUsingPrsc(query);

if (prscResult.success === true) {
	const old = parseExpression(query, {});
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


import {
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
} from 'prsc';
import { IAST } from './astHelper';

const whitespace: Parser<string[]> = star(token(' '));

function surrounded<T, S>(parser: Parser<T>, around: Parser<S>): Parser<T> {
	return preceded(around, followed(parser, around));
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

// TODO: add other whitespace characters
const assertAdjacentOpeningTerminal: Parser<string> = peek(
	or([token('('), token('"'), token("'"), token(' ')])
);

const pathExpr: Parser<IAST> = map(token('unimplemented'), (x) => [x]);

const validateExpr: Parser<IAST> = map(token('unimplemented'), (x) => [x]);

const extensionExpr: Parser<IAST> = map(token('unimplemented'), (x) => [x]);

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
const expr: Parser<IAST> = exprSingle;

const queryBody: Parser<IAST> = map(expr, (x) => ['queryBody', x]);

// TODO: add prolog
const mainModule: Parser<IAST> = map(queryBody, (x) => ['mainModule', x]);

export function parseUsingPrsc(xpath: string): ParseResult<IAST> {
	return complete(mainModule)(xpath, 0);
}

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
import {
	unimplemented,
	wrapArray,
	alias,
	regex,
	isAttributeTest,
	surrounded,
	parseCharacterReferences,
	precededMultiple,
	whitespace,
	whitespacePlus,
	wrapInSequenceExprIfNeeded,
	binaryOperator,
	assertAdjacentOpeningTerminal,
	nonRepeatableBinaryOperator,
} from './prscParser';

import {
	ncName,
	qName,
	eqName,
	reservedFunctionNames,
	typeName,
	simpleTypeName,
} from './prscNames';

// 113: ForwardAxis - https://www.w3.org/TR/xquery-31/#doc-xquery31-ForwardAxis
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

// 116: ReverseAxis - https://www.w3.org/TR/xquery-31/#doc-xquery31-ReverseAxis
const reverseAxis: Parser<string> = map(
	or(
		['parent::', 'ancestor::', 'preceding-sibling::', 'preceding::', 'ancestor-or-self::'].map(
			token
		)
	),
	(x: string) => x.substring(0, x.length - 2)
);

const predicate: Parser<IAST> = preceded(
	token('['),
	followed(surrounded(expr, whitespace), token(']'))
);

// 40: ExprSingle
// https://www.w3.org/TR/xquery-31/#doc-xquery31-ExprSingle
function exprSingle(input: string, offset: number): ParseResult<IAST> {
	// TODO: add support for flwor, quantified, switch, typeswitch, if, insert, delete, rename, replace, and copymodify
	return orExpr(input, offset);
}

// 39: Expr
// https://www.w3.org/TR/xquery-31/#doc-xquery31-Expr
function expr(input: string, offset: number): ParseResult<IAST> {
	return binaryOperator(exprSingle, token(','), (lhs, rhs) => {
		return rhs.length === 0 ? lhs : ['sequenceExpr', lhs, ...rhs.map((x) => x[1])];
	})(input, offset);
}

// 38: QueryBody
// https://www.w3.org/TR/xquery-31/#doc-xquery31-QueryBody
const queryBody: Parser<IAST> = map(expr, (x) => ['queryBody', x]);

// 3: MainModule
// https://www.w3.org/TR/xquery-31/#doc-xquery31-MainModule
// TODO: add prolog
export const mainModule: Parser<IAST> = map(queryBody, (x) => ['mainModule', x]);

// 2: VersionDecl
// https://www.w3.org/TR/xquery-31/#doc-xquery31-VersionDecl
const versionDecl: Parser<IAST> = unimplemented;

// 120: Wildcard
// https://www.w3.org/TR/xquery-31/#prod-xquery31-Wildcard
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

// 201: SchemaElementTest
// https://www.w3.org/TR/xquery-31/#doc-xquery31-SchemaElementTest
const schemaElementTest: Parser<IAST> = unimplemented;

// 199: ElementTest
// https://www.w3.org/TR/xquery-31/#doc-xquery31-ElementTest
const elementTest: Parser<IAST> = unimplemented;

// 195: AttributeTest
// https://www.w3.org/TR/xquery-31/#doc-xquery31-AttributeTest
const attributeTest: Parser<IAST> = unimplemented;

// 194: PITest
// https://www.w3.org/TR/xquery-31/#doc-xquery31-PITest
const piTest: Parser<IAST> = unimplemented;

// 193: NamespaceNodeTest
// https://www.w3.org/TR/xquery-31/#doc-xquery31-NamespaceNodeTest
const namespaceNodeTest: Parser<IAST> = wrapArray(alias(['namespace-node()'], 'namespaceTest'));

// 192: CommentTest
// https://www.w3.org/TR/xquery-31/#doc-xquery31-CommentTest
const commentTest: Parser<IAST> = wrapArray(alias(['comment()'], 'commentTest'));

// 191: TextTest
// https://www.w3.org/TR/xquery-31/#doc-xquery31-TextTest
const textTest: Parser<IAST> = wrapArray(alias(['text()'], 'textTest'));

// 190: DocumentTest
// https://www.w3.org/TR/xquery-31/#doc-xquery31-DocumentTest
const documentTest: Parser<IAST> = unimplemented;

// 189: AnyKindTest
// https://www.w3.org/TR/xquery-31/#prod-xquery31-AnyKindTest
const anyKindTest: Parser<IAST> = wrapArray(alias(['node()'], 'anyKindTest'));

// 188: KindTest
// https://www.w3.org/TR/xquery-31/#prod-xquery31-KindTest
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

// 119 - NameTest
// https://www.w3.org/TR/xquery-31/#prod-xquery31-NameTest
const nameTest: Parser<IAST> = or([wildcard, map(eqName, (x) => ['nameTest', ...x])]);

// 118 - NodeTest
// https://www.w3.org/TR/xquery-31/#prod-xquery31-NodeTest
export const nodeTest: Parser<IAST> = or([kindTest, nameTest]);

// 114 - AbbrevForwardStep
// https://www.w3.org/TR/xquery-31/#prod-xquery31-AbbrevForwardStep
const abbrevForwardStep: Parser<IAST> = then(optional(token('@')), nodeTest, (a, b) => {
	return a !== null || isAttributeTest(b)
		? ['stepExpr', ['xpathAxis', 'attribute'], b]
		: ['stepExpr', ['xpathAxis', 'child'], b];
});

// 112 - ForwardStep
// https://www.w3.org/TR/xquery-31/#doc-xquery31-ForwardStep
const forwardStep: Parser<IAST> = or([
	then(forwardAxis, nodeTest, (axis, test) => ['stepExpr', ['xpathAxis', axis], test]),
	abbrevForwardStep,
]);

// 115 - ReverseStep
// https://www.w3.org/TR/xquery-31/#doc-xquery31-ReverseStep
const reverseStep: Parser<IAST> = then(reverseAxis, nodeTest, (axis, test) => [
	'stepExpr',
	['xpathAxis', axis],
	test,
]);

// 123 - PredicateList
// https://www.w3.org/TR/xquery-31/#doc-xquery31-PredicateList
const predicateList: Parser<IAST | undefined> = map(
	star(preceded(whitespace, predicate)),
	(x: IAST[]) => (x.length > 0 ? ['predicates', ...x] : undefined)
);

// 111 - AxisStep
// https://www.w3.org/TR/xquery-31/#doc-xquery31-AxisStep
const axisStep: Parser<IAST> = then(
	or([forwardStep, reverseStep]),
	predicateList,
	(a: IAST, b: IAST | undefined) => (b === undefined ? a : (a.concat([b]) as IAST))
);

// 238 - Digits
// https://www.w3.org/TR/xquery-31/#doc-xquery31-Digits
const digits: Parser<string> = regex(/[0-9]+/);

// 221 - DoubleLiteral
// https://www.w3.org/TR/xquery-31/#doc-xquery31-DoubleLiteral
const doubleLiteral: Parser<IAST> = unimplemented;

// 220 - DecimalLiteral
// https://www.w3.org/TR/xquery-31/#doc-xquery31-DecimalLiteral
const decimalLiteral: Parser<IAST> = or([
	map(preceded(token('.'), digits), (x) => ['decimalConstantExpr', ['value', '.' + x]]),
	then(followed(digits, token('.')), optional(digits), (first, second) => [
		'decimalConstantExpr',
		['value', first + '.' + (second !== null ? second : '')],
	]),
]);

// 219 - IntegerLiteral
// https://www.w3.org/TR/xquery-31/#doc-xquery31-IntegerLiteral
const integerLiteral: Parser<IAST> = map(
	digits,
	(x) => ['integerConstantExpr', ['value', x]] as IAST
);

// 130 - NumericLiteral
// https://www.w3.org/TR/xquery-31/#prod-xquery31-NumericLiteral
const numericLiteral: Parser<IAST> = followed(
	or([doubleLiteral, decimalLiteral, integerLiteral]),
	peek(not(regex(/[a-zA-Z]/), ['no alphabetical characters after numeric literal']))
);

// 226 - EscapeQuot
// https://www.w3.org/TR/xquery-31/#prod-xquery31-EscapeQuot
const escapeQuot: Parser<string> = alias(['""'], '"');

// 227 - EscapeApos
// https://www.w3.org/TR/xquery-31/#prod-xquery31-EscapeApos
const escapeApos: Parser<string> = alias(["''"], "'");

// 222 - StringLiteral
// https://www.w3.org/TR/xquery-31/#prod-xquery31-StringLiteral
// TODO: add check for xquery
const stringLiteral: Parser<string> = or([
	// TODO: add more advanced string literals
	map(surrounded(star(or([escapeQuot, regex(/[^\"]/)])), token('"')), (x) => x.join('')),
	map(surrounded(star(or([escapeApos, regex(/[^']/)])), token("'")), (x) => x.join('')),
]);

// 129 - Literal
// https://www.w3.org/TR/xquery-31/#prod-xquery31-Literal
const literal: Parser<IAST> = or([
	numericLiteral,
	map(stringLiteral, (x) => ['stringConstantExpr', ['value', parseCharacterReferences(x)]]),
]);

// 132 - VarName
// https://www.w3.org/TR/xquery-31/#prod-xquery31-VarName
const varName: Parser<IAST> = eqName;

// 131 - VarRef
// https://www.w3.org/TR/xquery-31/#prod-xquery31-VarRef
const varRef: Parser<IAST> = map(preceded(token('$'), varName), (x) => ['varRef', ['name', ...x]]);

// 133 - ParenthesizedExpr
// https://www.w3.org/TR/xquery-31/#prod-xquery31-ParenthesizedExpr
const parenthesizedExpr: Parser<IAST> = or([
	delimited(token('('), surrounded(expr, whitespace), token(')')),
	map(delimited(token('('), whitespace, token(')')), (_) => ['sequenceExpr']),
]);

// 134 - ContextItemExpr
// https://www.w3.org/TR/xquery-31/#prod-xquery31-ContextItemExpr
const contextItemExpr: Parser<IAST> = map(
	followed(
		token('.'),
		peek(not(token('.'), ['context item should not be followed by another .']))
	),
	(_) => ['contextItemExpr']
);

// 139 - ArgumentPlaceholder
// https://www.w3.org/TR/xquery-31/#prod-xquery31-ArgumentPlaceholder
const argumentPlaceholder: Parser<IAST> = wrapArray(alias(['?'], 'argumentPlaceholder'));

// 138 - Argument
// https://www.w3.org/TR/xquery-31/#prod-xquery31-Argument
const argument: Parser<IAST> = or([exprSingle, argumentPlaceholder]);

// 122 - ArgumentList
// https://www.w3.org/TR/xquery-31/#doc-xquery31-ArgumentList
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

// 137 - FunctionCall
// https://www.w3.org/TR/xquery-31/#prod-xquery31-FunctionCall
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

// 128 - PrimaryExpr
// TODO: add other variants
const primaryExpr: Parser<IAST> = or([
	literal,
	varRef,
	parenthesizedExpr,
	contextItemExpr,
	functionCall,
]);

// 126 - KeySpecifier
// https://www.w3.org/TR/xquery-31/#prod-xquery31-KeySpecifier
const keySpecifier: Parser<string | IAST> = or([
	ncName as Parser<string | IAST>,
	integerLiteral,
	parenthesizedExpr,
	token('*'),
]);

// 181 - UnaryLookup
// https://www.w3.org/TR/xquery-31/#prod-xquery31-UnaryLookup
const lookup: Parser<IAST> = map(precededMultiple([token('?'), whitespace], keySpecifier), (x) =>
	x === '*'
		? ['lookup', ['star']]
		: // TODO: Maybe get rid of the typeof
		typeof x === 'string'
		? ['lookup', ['NCName', x]]
		: ['lookup', x]
);

const postfixExprWithStep: Parser<IAST> = then(
	map(primaryExpr, (x) => wrapInSequenceExprIfNeeded(x)),
	star(
		or([
			map(preceded(whitespace, predicate), (x) => ['predicate', x] as IAST),
			map(preceded(whitespace, argumentList), (x) => ['argumentList', x] as IAST),
			preceded(whitespace, lookup),
		])
	),
	(expression, postfixExpr) => {
		let toWrap: any = expression;

		const predicates: IAST[] = [];
		const filters: IAST[] = [];

		let allowSinglePredicate = false;

		function flushPredicates() {
			if (allowSinglePredicate && predicates.length === 1) {
				filters.push(['predicate', predicates[0]]);
			} else if (predicates.length !== 0) {
				filters.push(['predicates', ...predicates]);
			}
			predicates.length = 0;
		}

		function flushFilters(ensureFilter: boolean) {
			flushPredicates();
			if (filters.length !== 0) {
				if (toWrap[0] === 'sequenceExpr' && toWrap.length > 2) {
					toWrap = ['sequenceExpr', toWrap];
				}
				toWrap = [['filterExpr', toWrap], ...filters];
			} else if (ensureFilter) {
				toWrap = [['filterExpr', toWrap]];
			} else {
				toWrap = [toWrap];
			}
		}

		for (const postFix of postfixExpr) {
			switch (postFix[0]) {
				case 'predicate':
					predicates.push(postFix[1] as IAST);
					break;
				case 'lookup':
					allowSinglePredicate = true;
					flushPredicates();
					filters.push(postFix);
					break;
				case 'argumentList':
					flushFilters(false);
					if (toWrap.length > 1) {
						toWrap = [['sequenceExpr', ['pathExpr', ['stepExpr', ...toWrap]]]];
					}
					toWrap = [
						'dynamicFunctionInvocationExpr',
						['functionItem', ...toWrap],
						...((postFix[1] as IAST).length
							? [['arguments', ...(postFix[1] as IAST)]]
							: [[]]),
					];
				default:
					throw new Error('unreachable');
			}
		}

		flushFilters(true);

		return toWrap;
	}
);

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

// 98 - ValueExpr
// https://www.w3.org/TR/xquery-31/#prod-xquery31-ValueExpr
const valueExpr: Parser<IAST> = or([validateExpr, extensionExpr, simpleMapExpr]);

// 97 - UnaryExpr
// https://www.w3.org/TR/xquery-31/#prod-xquery31-UnaryExpr
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

// 96 - ArrowExpr
// https://www.w3.org/TR/xquery-31/#prod-xquery31-ArrowExpr
const arrowExpr: Parser<IAST> = unaryExpr;

const singleType: Parser<IAST> = then(simpleTypeName, optional(token('?')), (type, opt) =>
	opt !== null
		? ['singleType', ['atomicType', ...type], ['optional']]
		: ['singleType', ['atomicType', ...type]]
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
			sequenceType
		)
	),
	(lhs, rhs) =>
		rhs !== null ? ['instanceOfExpr', ['argExpr', lhs], ['sequenceType', ...rhs]] : lhs
);

const intersectExpr: Parser<IAST> = binaryOperator(
	instanceofExpr,
	followed(
		or([alias(['intersect'], 'intersectOp'), alias(['except'], 'exceptOp')]),
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
	alias(['to'], 'rangeSequenceExpr'),
	'startExpr',
	'endExpr'
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

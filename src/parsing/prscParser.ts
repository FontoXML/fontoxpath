import {
	map,
	then,
	preceded,
	token,
	star,
	Parser,
	ParseResult,
	or,
	followed,
	okWithValue,
	error,
} from 'prsc';
import { IAST } from './astHelper';

const whitespace: Parser<string[]> = star(token(' '));

function surrounded<T, S>(parser: Parser<T>, surrounded: Parser<S>): Parser<T> {
	return preceded(surrounded, followed(parser, surrounded));
}

function binaryOperator(expr: Parser<IAST>, operator: Parser<string>): Parser<IAST> {
	return then(
		expr,
		star(then(surrounded(operator, whitespace), expr, (a, b) => [a, b])),
		(lhs: IAST, rhs: [string, IAST][]) =>
			rhs.reduce((lh, rh) => [rh[0], ['firstOperand', lh], ['secondOperand', rh[1]]], lhs)
	);
}

function nonRepeatableBinaryOperator(expr: Parser<IAST>, operator: Parser<string>): Parser<IAST> {
	return function (input, offset): ParseResult<IAST> {
		const lhs = expr(input, offset);
		if (!lhs.success) {
			return lhs;
		}

		const opParser = surrounded(operator, whitespace);
		const op = opParser(input, lhs.offset);
		if (!op.success) {
			return error(op.offset, ['operator'], true);
		}

		const rhs = expr(input, op.offset);
		if (!rhs.success) {
			return rhs;
		}

		return okWithValue(rhs.offset, [
			op.value,
			['firstOperand', lhs.value],
			['secondOperand', rhs.value],
		]);
	};
}

function alias(tokenNames: string[], name: string): Parser<string> {
	return map(or(tokenNames.map(token)), (_) => name);
}

const valueExpr: Parser<IAST> = map(token('value'), (x) => [x]);

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

const castExpr: Parser<IAST> = arrowExpr;

const castableExpr: Parser<IAST> = castExpr;

const treatExpr: Parser<IAST> = castableExpr;

const instanceofExpr: Parser<IAST> = treatExpr;

const intersectExpr: Parser<IAST> = instanceofExpr;

const unionExpr: Parser<IAST> = binaryOperator(intersectExpr, alias(['|', 'union'], 'unionOp'));

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
	map(token('||'), (_) => 'stringConcatenateOp')
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

const exprSingle: Parser<IAST> = orExpr;

const expr: Parser<IAST> = exprSingle;

const queryBody: Parser<IAST> = map(expr, (x) => ['queryBody', x]);

const mainModule: Parser<IAST> = map(queryBody, (x) => ['mainModule', x]);

export function parseUsingPrsc(xpath: string): ParseResult<IAST> {
	return mainModule(xpath, 0);
}

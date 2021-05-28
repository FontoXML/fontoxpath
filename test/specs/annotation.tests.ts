import * as chai from 'chai';
import { SequenceType, ValueType } from 'fontoxpath/expressions/dataTypes/Value';
import StaticContext from 'fontoxpath/expressions/StaticContext';
import astHelper, { IAST } from 'fontoxpath/parsing/astHelper';
import parseExpression from 'fontoxpath/parsing/parseExpression';
import annotateAst from 'fontoxpath/typeInference/annotateAST';

function assertValueType(
	expression: string,
	expectedType: ValueType,
	staticContext: StaticContext
) {
	const ast = parseExpression(expression, {});
	annotateAst(ast, staticContext);

	const queryBody = astHelper.followPath(ast, ['mainModule', 'queryBody']);
	const resultType = astHelper.getAttribute(queryBody[1] as IAST, 'type') as SequenceType;
	if (!resultType) {
		chai.assert.isTrue(expectedType === null || expectedType === undefined);
	} else {
		chai.assert.deepEqual(resultType.type, expectedType);
	}
}

describe('Annotating constants', () => {
	it('annotates an integer constant', () => assertValueType('1', ValueType.XSINTEGER, undefined));
	it('annotates a string constant', () =>
		assertValueType("'test'", ValueType.XSSTRING, undefined));
	it('annotates decimal constant', () => assertValueType('0.5', ValueType.XSDECIMAL, undefined));
	it('annotates double constant', () => assertValueType('1.0e7', ValueType.XSDOUBLE, undefined));
});

describe('Annotating unary expressions', () => {
	it('annotates unary plus operator', () =>
		assertValueType('+1', ValueType.XSINTEGER, undefined));
	it('annotates chained unary plus operator', () =>
		assertValueType('+++1', ValueType.XSINTEGER, undefined));
	it('annotates unary minus operator', () =>
		assertValueType('-1', ValueType.XSINTEGER, undefined));
	it('annotates chained unary minus operator', () =>
		assertValueType('---1', ValueType.XSINTEGER, undefined));
	it('annotates unary plus operator on decimal', () =>
		assertValueType('+0.1', ValueType.XSDECIMAL, undefined));
	it('annotates unary minus operator on decimal', () =>
		assertValueType('-0.1', ValueType.XSDECIMAL, undefined));
});

describe('Annotating binary expressions', () => {
	it('simple add operator', () => assertValueType('1 + 2', ValueType.XSINTEGER, undefined));
	it('simple sub operator', () => assertValueType('1 - 2', ValueType.XSINTEGER, undefined));
	it('simple mul operator', () => assertValueType('1 * 2', ValueType.XSINTEGER, undefined));
	it('simple div operator', () => assertValueType('1 div 2', ValueType.XSDECIMAL, undefined));
	it('simple idiv operator', () => assertValueType('1 idiv 2', ValueType.XSINTEGER, undefined));
	it('simple mod operator', () => assertValueType('1 mod 2', ValueType.XSINTEGER, undefined));
	it('simple chained add operator', () =>
		assertValueType('1 + 2 + 3', ValueType.XSINTEGER, undefined));
	it('simple chained sub operator', () =>
		assertValueType('1 - 2 - 3', ValueType.XSINTEGER, undefined));
	it('simple chained mul operator', () =>
		assertValueType('1 * 2 * 3', ValueType.XSINTEGER, undefined));
	it('simple chained div operator', () =>
		assertValueType('1 div 2 div 3', ValueType.XSDECIMAL, undefined));
	it('simple chained idiv operator', () =>
		assertValueType('1 idiv 2 idiv 3', ValueType.XSINTEGER, undefined));
	it('simple chained mod operator', () =>
		assertValueType('1 mod 2 mod 3', ValueType.XSINTEGER, undefined));
	it('add integer and decimal results in decimal', () =>
		assertValueType('1 + 0.1', ValueType.XSDECIMAL, undefined));
});

describe('Annotating compare expressions', () => {
	it('eqOp', () => assertValueType('1 = 2', ValueType.XSBOOLEAN, undefined));
	it('neOp', () => assertValueType('1 != 2', ValueType.XSBOOLEAN, undefined));
	it('leOp', () => assertValueType('1 <= 2', ValueType.XSBOOLEAN, undefined));
	it('ltOp', () => assertValueType('1 < 2', ValueType.XSBOOLEAN, undefined));
	it('geOp', () => assertValueType('1 >= 2', ValueType.XSBOOLEAN, undefined));
	it('gtOp', () => assertValueType('1 > 2', ValueType.XSBOOLEAN, undefined));
});

describe('Annotating cast expressions', () => {
	it('simple cast expression', () =>
		assertValueType('5 cast as xs:double', ValueType.XSDOUBLE, undefined));
	it('unknown child cast expression', () =>
		assertValueType('$x cast as xs:integer', ValueType.XSINTEGER, undefined));
});

describe('Annotate Array', () => {
	it('annotate simple square array', () =>
		assertValueType('[3, 5, 4]', ValueType.ARRAY, undefined));
	it('annotate complex array', () =>
		assertValueType('["hello", (3, 4, 5)]', ValueType.ARRAY, undefined));
});

describe('annotate Sequence', () => {
	it('annotate simple sequence', () =>
		assertValueType('(4, 3, hello)', ValueType.ITEM, undefined));
	it('annotate complex sequence', () =>
		assertValueType('(4, 3, hello, (43, (256, "help")))', ValueType.ITEM, undefined));
});

describe('Annotate maps', () => {
	it('mapConstructor', () => assertValueType('map{a:1, b:2}', ValueType.MAP, undefined));
	it('simpleMapExpr', () => assertValueType('$a ! ( //b)', ValueType.MAP, undefined));
});

describe('Annotating ifThenElse expressions', () => {
	it('ifThenElse type is known', () =>
		assertValueType('if (3) then 3 else 5', ValueType.XSINTEGER, undefined));
	it('ifThenElse type is not known', () =>
		assertValueType('if (3) then "hello" else 5', undefined, undefined));
});

describe('Annotate quantifiedExpr', () => {
	it('quantifiedExpr', () =>
		assertValueType('every $x in true() satisfies $x', ValueType.XSBOOLEAN, undefined));
});

describe('Annotate arrowExpr', () => {
	it('annotate tailFunction', () =>
		assertValueType('array:tail([1]) => array:size()', undefined, undefined));
});

describe('complexer querries', () => {});

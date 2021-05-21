import * as chai from 'chai';
import { SequenceType, ValueType } from 'fontoxpath/expressions/dataTypes/Value';
import astHelper, { IAST } from 'fontoxpath/parsing/astHelper';
import parseExpression from 'fontoxpath/parsing/parseExpression';
import annotateAst from 'fontoxpath/typeInference/annotateAST';

function assertValueType(expression: string, expectedType: ValueType) {
	const ast = parseExpression(expression, {});
	annotateAst(ast, undefined);

	const queryBody = astHelper.followPath(ast, ['mainModule', 'queryBody']);
	const resultType = astHelper.getAttribute(queryBody[1] as IAST, 'type') as SequenceType;
	chai.assert.deepEqual(resultType.type, expectedType);
}

describe('Annotating constants', () => {
	it('annotates an integer constant', () => assertValueType('1', ValueType.XSINTEGER));
	it('annotates a string constant', () => assertValueType("'test'", ValueType.XSSTRING));
	it('annotates decimal constant', () => assertValueType('0.5', ValueType.XSDECIMAL));
	it('annotates double constant', () => assertValueType('1.0e7', ValueType.XSDOUBLE));
});

describe('Annotating unary expressions', () => {
	it('annotates unary plus operator', () => assertValueType('+1', ValueType.XSINTEGER));
	it('annotates chained unary plus operator', () => assertValueType('+++1', ValueType.XSINTEGER));
	it('annotates unary minus operator', () => assertValueType('-1', ValueType.XSINTEGER));
	it('annotates chained unary minus operator', () =>
		assertValueType('---1', ValueType.XSINTEGER));
	it('annotates unary plus operator on decimal', () =>
		assertValueType('+0.1', ValueType.XSDECIMAL));
	it('annotates unary minus operator on decimal', () =>
		assertValueType('-0.1', ValueType.XSDECIMAL));
});

describe('Annotating binary expressions', () => {
	it('simple add operator', () => assertValueType('1 + 2', ValueType.XSINTEGER));
	it('simple sub operator', () => assertValueType('1 - 2', ValueType.XSINTEGER));
	it('simple mul operator', () => assertValueType('1 * 2', ValueType.XSINTEGER));
	it('simple div operator', () => assertValueType('1 div 2', ValueType.XSDECIMAL));
	it('simple idiv operator', () => assertValueType('1 idiv 2', ValueType.XSINTEGER));
	it('simple mod operator', () => assertValueType('1 mod 2', ValueType.XSINTEGER));
	it('simple chained add operator', () => assertValueType('1 + 2 + 3', ValueType.XSINTEGER));
	it('simple chained sub operator', () => assertValueType('1 - 2 - 3', ValueType.XSINTEGER));
	it('simple chained mul operator', () => assertValueType('1 * 2 * 3', ValueType.XSINTEGER));
	it('simple chained div operator', () => assertValueType('1 div 2 div 3', ValueType.XSDECIMAL));
	it('simple chained idiv operator', () =>
		assertValueType('1 idiv 2 idiv 3', ValueType.XSINTEGER));
	it('simple chained mod operator', () => assertValueType('1 mod 2 mod 3', ValueType.XSINTEGER));
	it('add integer and decimal results in decimal', () =>
		assertValueType('1 + 0.1', ValueType.XSDECIMAL));
});

describe('Annotating compare expressions', () => {
	it('eqOp', () => assertValueType('1 = 2', ValueType.XSBOOLEAN));
	it('neOp', () => assertValueType('1 != 2', ValueType.XSBOOLEAN));
	it('leOp', () => assertValueType('1 <= 2', ValueType.XSBOOLEAN));
	it('ltOp', () => assertValueType('1 < 2', ValueType.XSBOOLEAN));
	it('geOp', () => assertValueType('1 >= 2', ValueType.XSBOOLEAN));
	it('gtOp', () => assertValueType('1 > 2', ValueType.XSBOOLEAN));
});

describe('Annotating cast expressions', () => {
	it('simple cast expression', () => assertValueType('5 cast as xs:double', ValueType.XSDOUBLE));
	it('unknown child cast expression', () =>
		assertValueType('$x cast as xs:integer', ValueType.XSINTEGER));
});

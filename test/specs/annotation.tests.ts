import * as chai from 'chai';
import {
	SequenceMultiplicity,
	SequenceType,
	ValueType,
} from 'fontoxpath/expressions/dataTypes/Value';
import astHelper, { IAST } from 'fontoxpath/parsing/astHelper';
import parseExpression from 'fontoxpath/parsing/parseExpression';
import annotateAst from 'fontoxpath/typeInference/annotateAST';

function assertType(expression: string, expectedType: SequenceType) {
	const ast = parseExpression(expression, {});
	annotateAst(ast, undefined);

	const queryBody = astHelper.followPath(ast, ['mainModule', 'queryBody']);
	chai.assert.deepEqual(astHelper.getAttribute(queryBody[1] as IAST, 'type'), expectedType);
}

describe('Annotating constants', () => {
	it('annotates an integer constant', () =>
		assertType('1', { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE }));
	it('annotates a string constant', () =>
		assertType("'test'", {
			type: ValueType.XSSTRING,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		}));
	it('annotates decimal constant', () =>
		assertType('0.5', {
			type: ValueType.XSDECIMAL,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		}));
	it('annotates double constant', () =>
		assertType('1.0e7', {
			type: ValueType.XSDOUBLE,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		}));
});

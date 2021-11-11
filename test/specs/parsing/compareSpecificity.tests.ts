import * as chai from 'chai';
import { compareSpecificity, parseScript } from 'fontoxpath';
import { Document } from 'slimdom';

describe('compareSpecificity', () => {
	function assertSpecificity(
		selectorExpressionA: string,
		selectorExpressionB: string,
		expectedResult
	) {
		// Assert selectors as a string
		chai.assert.equal(
			compareSpecificity(selectorExpressionA, selectorExpressionB),
			expectedResult
		);

		// Assert selectors as an AST
		chai.assert.equal(
			compareSpecificity(
				parseScript(selectorExpressionA, {}, new Document()),
				parseScript(selectorExpressionB, {}, new Document())
			),
			expectedResult
		);
	}

	it('returns 0 for the same xpath', () => assertSpecificity('self::*', 'self::*', 0));
	it('nodeType > universal', () => assertSpecificity('self::element()', 'self::node()', 1));
	it('name > nodeType', () => assertSpecificity('self::name', 'self::element()', 1));
	it('attributes > nodeName', () => assertSpecificity('@id', 'self::name', 1));
	it('functions > attributes', () => assertSpecificity('id("123")', '@id', 1));
	it('union is the maximum of its operands', () =>
		assertSpecificity('self::name | id("123") | self::otherName | id("123")', 'self::name', 1));
});

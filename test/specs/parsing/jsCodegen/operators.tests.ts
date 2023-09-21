import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { compileXPathToJavaScript, ReturnType } from 'fontoxpath';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

describe('operators', () => {
	let documentNode: slimdom.Document;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		jsonMlMapper.parse(['xml', ['title', 'Tips'], ['tips']], documentNode);
	});

	it('compiles "or" when used as a base expression', () => {
		const elementNode: slimdom.Node = documentNode.firstChild;
		chai.assert.isTrue(
			evaluateXPathWithJsCodegen(
				'self::p or self::xml',
				elementNode,
				null,
				ReturnType.BOOLEAN,
			),
		);
	});

	it('compiles "and" when used as a base expression', () => {
		const elementNode: slimdom.Node = documentNode.firstChild;
		chai.assert.isTrue(
			evaluateXPathWithJsCodegen(
				'self::xml and child::element(tips)',
				elementNode,
				null,
				ReturnType.BOOLEAN,
			),
		);
	});

	it('rejects logical operator when lhs is not compilable', () => {
		chai.assert.isFalse(
			compileXPathToJavaScript('count((1,2,3)) and self::xml', ReturnType.BOOLEAN, {})
				.isAstAccepted,
		);
	});

	it('rejects logical operator when rhs is not compilable', () => {
		chai.assert.isFalse(
			compileXPathToJavaScript('self::xml and count((1,2,3))', ReturnType.BOOLEAN, {})
				.isAstAccepted,
		);
	});
});

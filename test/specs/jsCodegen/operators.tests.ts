import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { ReturnType } from 'fontoxpath';
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
				ReturnType.BOOLEAN
			)
		);
	});

	it('compiles "and" when used as a base expression', () => {
		const elementNode: slimdom.Node = documentNode.firstChild;
		chai.assert.isTrue(
			evaluateXPathWithJsCodegen(
				'self::xml and child::element(tips)',
				elementNode,
				null,
				ReturnType.BOOLEAN
			)
		);
	});
});

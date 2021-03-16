import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateXPath, evaluateXPathToFirstNode } from 'fontoxpath';
import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('PIConstructor', () => {
	it('can create a PI', () => {
		chai.assert.equal(
			evaluateXPathToFirstNode(
				'processing-instruction my-pi { "data" }',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			).nodeType,
			7
		);
	});
});

import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateXPath, evaluateXPathToBoolean, evaluateXPathToNumber } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('DefaultFunctionDeclaration', () => {
	it('Can create a default namespace with PI', () => {
		chai.assert.equal(
			evaluateXPathToNumber(
				'declare default function namespace "http://www.w3.org/2005/xpath-functions/math"; pi()',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			),
			Math.PI
		);
	});
	it('Can create a default namespace and a function', () => {
		chai.assert.equal(
			evaluateXPathToBoolean(
				'declare default function namespace "http://example.com"; declare %private function lt() as item()*{ true() }; Q{http://example.com}lt()',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			),
			true
		);
	});


});
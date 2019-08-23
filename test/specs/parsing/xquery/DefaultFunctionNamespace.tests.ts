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
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'declare default function namespace "http://example.com"; declare %private function lt() as item()*{ true() }; Q{http://example.com}lt()',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});
	it('Can create a default namespace, a function and declare a normal prefix', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				`declare default function namespace "http://example.com";
declare namespace XXX = "http://example.com";
declare %private function lt() as item()*{ true() };
Q{http://example.com}lt() and XXX:lt() and lt()`,
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});

	it('Cannot create a default namespace with a forbidden url', () => {
		chai.assert.throws(
			() =>
				evaluateXPathToBoolean(
					'declare default function namespace "http://www.w3.org/XML/1998/namespace"; declare %private function lt() as item()*{ true() }; Q{"http://www.w3.org/XML/1998/namespace"}lt()',
					documentNode,
					undefined,
					{},
					{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
				),
			'XQST0070: The prefixes xml and xmlns may not be used in a namespace declaration or be bound to another namespaceURI.'
		);
	});
	it('Cannot create a default namespace with two functions namespace', () => {
		chai.assert.throws(
			() =>
				evaluateXPathToBoolean(
					'declare default function namespace "http://example.com"; declare default function namespace "http://example.com"; declare %private function lt() as item()*{ true() }; Q{http://example.com}lt()',
					documentNode,
					undefined,
					{},
					{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
				),
			'XQST0066: A Prolog may contain at most one default function namespace declaration.'
		);
	});
	it('Cannot create a default element namespace', () => {
		chai.assert.throws(
			() =>
				evaluateXPathToBoolean(
					'declare default element namespace "http://example.com"; declare default function namespace "http://example.com"; declare %private function lt() as item()*{ true() }; Q{http://example.com}lt()',
					documentNode,
					undefined,
					{},
					{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
				),
			'Not Implemented: default namespace element.'
		);
	});
});

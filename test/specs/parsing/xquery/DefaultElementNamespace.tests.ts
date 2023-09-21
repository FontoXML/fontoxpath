import * as chai from 'chai';
import { Document } from 'slimdom';

import { evaluateXPath, evaluateXPathToBoolean } from 'fontoxpath';

let documentNode: Document;
beforeEach(() => {
	documentNode = new Document();
});

describe('DefaultElementNamespace', () => {
	it('Can create a default element namespace', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				`declare default element namespace "http://example.com";

self::p
`,
				documentNode.createElementNS('http://example.com', 'p'),
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE },
			),
		);

		chai.assert.isFalse(
			evaluateXPathToBoolean(
				`declare default element namespace "something-else";

self::p
`,
				documentNode.createElementNS('http://example.com', 'p'),
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE },
			),
		);
	});
});

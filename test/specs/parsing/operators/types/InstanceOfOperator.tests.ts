import * as chai from 'chai';
import { Document } from 'slimdom';

import { Language, evaluateXPathToBoolean } from 'fontoxpath';

describe('instance of operator', () => {
	it('returns true for a valid instance of xs:boolean', () =>
		chai.assert.isTrue(evaluateXPathToBoolean('true() instance of xs:boolean')));

	it('returns true for a valid instance of xs:boolean?', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('() instance of xs:boolean?'));
		chai.assert.isTrue(evaluateXPathToBoolean('true() instance of xs:boolean?'));
	});

	it('returns true for a valid instance of xs:boolean+', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('true() instance of xs:boolean+'));
		chai.assert.isTrue(evaluateXPathToBoolean('(true(), false()) instance of xs:boolean+'));
	});

	it('returns true for a valid instance of xs:boolean*', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('() instance of xs:boolean*'), 'empty');
		chai.assert.isTrue(evaluateXPathToBoolean('true() instance of xs:boolean*'), 'singleton');
		chai.assert.isTrue(
			evaluateXPathToBoolean('(true(), false()) instance of xs:boolean*'),
			'multiple',
		);
	});

	it('returns false for an invalid instance of xs:boolean', () =>
		chai.assert.isFalse(evaluateXPathToBoolean('() instance of xs:boolean')));

	it('returns false for an invalid instance of xs:boolean?', () =>
		chai.assert.isFalse(evaluateXPathToBoolean('(true(), false()) instance of xs:boolean?')));

	it('returns false for an invalid instance of xs:boolean+', () =>
		chai.assert.isFalse(evaluateXPathToBoolean('() instance of xs:boolean+')));

	it('returns false for an invalid instance of node()', () =>
		chai.assert.isFalse(evaluateXPathToBoolean('1 instance of node()')));

	it('keeps namespaces into account', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				`declare namespace x='x';
<x:ele/> instance of element(x:ele)`,
				new Document(),
				null,
				null,
				{ language: Language.XQUERY_3_1_LANGUAGE },
			),
		);
	});
});

import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateXPathToBoolean } from 'fontoxpath';
import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

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
			'multiple'
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
});

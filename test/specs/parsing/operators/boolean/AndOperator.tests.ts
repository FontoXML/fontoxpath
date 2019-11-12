import * as chai from 'chai';
import { evaluateXPathToBoolean } from 'fontoxpath';
import * as slimdom from 'slimdom';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

describe('and operator', () => {
	it('can perform "1 and 1"', () => chai.assert.isTrue(evaluateXPathToBoolean('1 and 1')));

	it('can parse an "and" selector', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('true() and true()'));
	});

	it('can optimize an and expression with buckets', () => {
		chai.assert.isFalse(evaluateXPathToBoolean('self::p and true()', new slimdom.Document()));
	});

	it('can optimize an and expression with buckets, inside a not()', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean('not(self::p and true())', new slimdom.Document())
		);
	});

	it('can parse a concatenation of ands', () =>
		chai.assert.isFalse(evaluateXPathToBoolean('true() and true() and true() and false()')));

	it('works with async params', async () => {
		chai.assert.isTrue(
			await evaluateXPathToAsyncSingleton('true() => fontoxpath:sleep() and true()')
		);
	});
});

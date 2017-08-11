import {
	evaluateXPathToBoolean
} from 'fontoxpath';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

describe('and operator', () => {
	it('can parse an "and" selector',
		() => chai.assert.isTrue(evaluateXPathToBoolean('true() and true()')));

	it('can parse a concatenation of ands',
		() => chai.assert.isFalse(evaluateXPathToBoolean('true() and true() and true() and false()')));

	it('works with async params', async () => {
		chai.assert.isTrue(await evaluateXPathToAsyncSingleton('true() => fontoxpath:sleep() and true()'));
	});
});

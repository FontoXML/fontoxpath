import * as slimdom from 'slimdom';

import {
	evaluateXPathToNumber,
	evaluateXPathToNumbers
} from 'fontoxpath';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

describe('Filter (predicate)', () => {
	it('parses',
		() => chai.assert.equal(evaluateXPathToNumber('(1,2,3)[. = 2]'), 2));
	it('allows spaces',
		() => chai.assert.equal(evaluateXPathToNumber('(1,2,3)   [. = 2]'), 2));
	it('returns empty sequence when inputted empty sequence',
		() => chai.assert.empty(evaluateXPathToNumbers('(1,2,3)[()]')));
	it('returns the sequence when filtering with a string',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('(1,2,3,4)["TAKE ME"]'), [1,2,3,4]));
	it('returns the empty sequence when filtering with an empty string',
		() => chai.assert.empty(evaluateXPathToNumbers('(1,2,3,4)[""]')));
	it('returns the sequence when filtering asynchronously', async () => {
		chai.assert.equal(await evaluateXPathToAsyncSingleton('(1,2,3,4)[fontoxpath:sleep(true(), 100)] => count()'), 4);
	});
	it('returns the sequence when filtering asynchronously, forcing ebv to be determinded async', async () => {
		chai.assert.equal(await evaluateXPathToAsyncSingleton('(1,2,3,4)[(true(), fontoxpath:sleep((), 100))] => count()'), 4);
	});
});

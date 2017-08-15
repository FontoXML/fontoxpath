import * as slimdom from 'slimdom';

import {
	evaluateXPathToNumbers,
	evaluateXPathToBoolean
} from 'fontoxpath';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

describe('sequence', () => {
	it('creates a sequence',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('(1,2,3)'), [1, 2, 3]));

	it('creates an empty sequence',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('()'), []));

	it('normalizes sequences',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('(1,2,(3,4))'), [1, 2, 3, 4]));
});

describe('range', () => {
	it('creates a sequence',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('1 to 10'), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));

	it('creates an empty sequence when passed a > b',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('10 to 1'), []));

	it('creates an empty sequence when passed () to 10',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('() to 10'), []));

	it('creates a sequence of correct length',
		() => chai.assert.isTrue(evaluateXPathToBoolean('(1 to 10) => count() = 10')));

	it('creates an empty sequence when passed 1 to ()',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('1 to ()'), []));

	it('allows async parameters', async () => {
		chai.assert.equal(await evaluateXPathToAsyncSingleton('(fontoxpath:sleep(1, 1) to fontoxpath:sleep(5, 2))!string() => string-join()'), '12345');
	});

	it('allows async parameters, from resolves to ()', async () => {
		chai.assert.equal(await evaluateXPathToAsyncSingleton('(fontoxpath:sleep((), 1) to fontoxpath:sleep(5, 2))'), null);
	});

	it('allows async parameters, end resolves to ()', async () => {
		chai.assert.equal(await evaluateXPathToAsyncSingleton('(fontoxpath:sleep(1, 1) to fontoxpath:sleep((), 2))'), null);
	});

	it('allows async parameters, end resolves to lower than from', async () => {
		chai.assert.equal(await evaluateXPathToAsyncSingleton('(fontoxpath:sleep(10, 1) to fontoxpath:sleep((), 2))'), null);
	});
});

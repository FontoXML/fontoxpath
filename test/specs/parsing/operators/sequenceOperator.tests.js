import * as slimdom from 'slimdom';

import {
	evaluateXPathToNumbers
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('sequence', () => {
	it('creates a sequence',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('(1,2,3)', documentNode), [1, 2, 3]));

	it('creates an empty sequence',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('()', documentNode), []));

	it('normalizes sequences',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('(1,2,(3,4))', documentNode), [1, 2, 3, 4]));
});

describe('range', () => {
	it('creates a sequence',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('1 to 10', documentNode), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));

	it('creates an empty sequence when passed a > b',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('10 to 1', documentNode), []));
});

import slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToArray
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('array constructor', () => {
	beforeEach(() => {
		jsonMlMapper.parse([
			'someElement',
			{ someAttribute: 'someValue' },
			'A piece of text'
		], documentNode);
	});

	describe('curly', () => {
		it('can be parsed',
			() => chai.assert.isOk(evaluateXPathToArray('array {1, 2}', documentNode)), 'It should be able to be parsed');

		it('unfolds passed sequences',
			() => chai.assert.deepEqual(evaluateXPathToArray('array {("a", "b"), "c"}', documentNode), [['a'], ['b'], ['c']]));
	});

	describe('square', () => {
		it('can be parsed',
			() => chai.assert.isOk(evaluateXPathToArray('[1, 2]', documentNode)), 'It should be able to be parsed');

		it('does not unfold passed sequences',
			() => chai.assert.deepEqual(evaluateXPathToArray('[("a", "b"), "c"]', documentNode), [['a', 'b'], ['c']]));
	});
});

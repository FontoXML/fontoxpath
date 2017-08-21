import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToArray,
	evaluateXPathToAsyncIterator,
	evaluateXPathToString
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
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
		it('can be filled async', async () => {
			const iterator = evaluateXPathToAsyncIterator('array {(1, 2) => fontoxpath:sleep(1), 3}(1)', documentNode);
			chai.assert.equal((await iterator.next()).value, 1);
		});
		it('unfolds passed sequences',
			() => chai.assert.deepEqual(evaluateXPathToArray('array {("a", "b"), "c"}', documentNode), ['a', 'b', 'c']));
	});

	describe('square', () => {
		it('can be parsed',
			() => chai.assert.isOk(evaluateXPathToArray('[1, 2]', documentNode)), 'It should be able to be parsed');
		it('can be filled async', async () => {
			const iterator = evaluateXPathToAsyncIterator('[1 => fontoxpath:sleep(1), 2](1)', documentNode);
			chai.assert.equal((await iterator.next()).value, 1);
		});
		it('does not unfold passed sequences',
			() => chai.assert.equal(evaluateXPathToString('[("a", "b"), "c"](1)', documentNode), ['a b']));
	});
});

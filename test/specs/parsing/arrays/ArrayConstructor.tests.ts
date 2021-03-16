import * as chai from 'chai';
import { evaluateXPathToArray, evaluateXPathToString } from 'fontoxpath';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('array constructor', () => {
	beforeEach(() => {
		jsonMlMapper.parse(
			['someElement', { someAttribute: 'someValue' }, 'A piece of text'],
			documentNode
		);
	});

	describe('curly', () => {
		it('can be parsed', () =>
			chai.assert.isOk(
				evaluateXPathToArray('array {1, 2}', documentNode),
				'It should be able to be parsed'
			));
		it('unfolds passed sequences', () =>
			chai.assert.deepEqual(evaluateXPathToArray('array {("a", "b"), "c"}', documentNode), [
				'a',
				'b',
				'c',
			]));
	});

	describe('square', () => {
		it('can be parsed', () =>
			chai.assert.isOk(
				evaluateXPathToArray('[1, 2]', documentNode),
				'It should be able to be parsed'
			));
		it('does not unfold passed sequences', () =>
			chai.assert.equal(evaluateXPathToString('[("a", "b"), "c"](1)', documentNode), 'a b'));
	});
});

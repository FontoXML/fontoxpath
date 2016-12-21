import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPathToArray from 'fontoxml-selectors/evaluateXPathToArray';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('array constructor', () => {
	beforeEach(() => {
		jsonMLMapper.parse([
			'someElement',
			{ someAttribute: 'someValue' },
			'A piece of text'
		], documentNode);
	});

	describe('curly', () => {
		it(
			'can be parsed',
			() => chai.assert.isOk(parseSelector('array {1, 2}')), 'It should be able to be parsed');

		it(
			'unfolds passed sequences',
			() => chai.assert.deepEqual(evaluateXPathToArray('array {("a", "b"), "c"}', documentNode, blueprint), [['a'], ['b'], ['c']]));
	});

	describe('square', () => {
		it(
			'can be parsed',
			() => chai.assert.isOk(parseSelector('[1, 2]')), 'It should be able to be parsed');

		it(
			'does not unfold passed sequences',
			() => chai.assert.deepEqual(evaluateXPathToArray('[("a", "b"), "c"]', documentNode, blueprint), [['a', 'b'], ['c']]));

	});
});

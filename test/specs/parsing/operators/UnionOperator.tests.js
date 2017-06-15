import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToNodes
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('union', () => {
	it('can parse union', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('(//someNode | //someChildNode)', documentNode), [documentNode.firstChild, documentNode.firstChild.firstChild]);
	});

	it('allows union (|) without spaces', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('(//someNode|//someChildNode)', documentNode), [documentNode.firstChild, documentNode.firstChild.firstChild]);
	});

	it('allows union (written out) without spaces', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('((//someNode)union(//someChildNode))', documentNode), [documentNode.firstChild, documentNode.firstChild.firstChild]);
	});

	it('dedupes nodes', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		chai.expect(evaluateXPathToNodes('(//* | //*)', documentNode), [documentNode.firstChild, documentNode.firstChild.firstChild]);
	});

	it('throws an error when not passed a node sequence',
		() => chai.expect(() => evaluateXPathToNodes('(1,2,3) | (4,5,6)', documentNode), /ERRXPTY0004/));

	it('sorts nodes', () => {
		jsonMlMapper.parse([
			'someNode',
			['A'],
			['B'],
			['C']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('(//C | //B | //A)', documentNode), Array.from(documentNode.firstChild.childNodes));
	});
});

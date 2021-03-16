import * as chai from 'chai';
import { evaluateXPathToNodes } from 'fontoxpath';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('union', () => {
	it('can parse union', () => {
		jsonMlMapper.parse(['someNode', ['someChildNode']], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('(//someNode | //someChildNode)', documentNode),
			[documentNode.firstChild, documentNode.firstChild.firstChild]
		);
	});

	it('allows union (|) without spaces', () => {
		jsonMlMapper.parse(['someNode', ['someChildNode']], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('(//someNode|//someChildNode)', documentNode), [
			documentNode.firstChild,
			documentNode.firstChild.firstChild,
		]);
	});

	it('allows union (written out) without spaces', () => {
		jsonMlMapper.parse(['someNode', ['someChildNode']], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('((//someNode)union(//someChildNode))', documentNode),
			[documentNode.firstChild, documentNode.firstChild.firstChild]
		);
	});

	it('dedupes nodes', () => {
		jsonMlMapper.parse(['someNode', ['someChildNode']], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('(//* | //*)', documentNode), [
			documentNode.firstChild,
			documentNode.firstChild.firstChild,
		]);
	});

	it('throws an error when not passed a node sequence', () =>
		chai.assert.throws(
			() => evaluateXPathToNodes('(1,2,3) | (4,5,6)', documentNode),
			'XPTY0004'
		));

	it('sorts nodes', () => {
		jsonMlMapper.parse(['someNode', ['A'], ['B'], ['C']], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('(//C | //B | //A)', documentNode),
			Array.from(documentNode.firstChild.childNodes)
		);
	});
});

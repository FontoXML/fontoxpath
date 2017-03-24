import slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToNumbers,
	evaluateXPathToString
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('relative paths', () => {
	it('supports relative paths', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('someChildNode', documentNode.documentElement), [documentNode.documentElement.firstChild]);
	});

	it('supports addressing the parent axis with ..', () => {
		jsonMlMapper.parse([
			'someNode',
			[
				'someChildNode',
				['someGrandChild']
			]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('../child::someNode', documentNode.documentElement), [documentNode.documentElement]);
	});

	it('sets the contextSequence', () => {
		jsonMlMapper.parse([
			'someNode',
			[
				'someChildNode',
				['someGrandChild']
			]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNumbers('//*/position()', documentNode.documentElement), [1, 1, 1]);
	});

	it('returns its results sorted on document order', () => {
		jsonMlMapper.parse([
			'someNode',
			[
				'firstNode'
			],
			[
				'secondNode'
			]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('(//secondNode, //firstNode)/self::node()', documentNode.documentElement), [documentNode.documentElement.firstChild, documentNode.documentElement.lastChild]);
	});

	it('supports postfix expressions as sequences', () => {
		jsonMlMapper.parse([
			'someNode',
			[
				'firstNode'
			],
			[
				'secondNode'
			]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('/someNode/(secondNode, firstNode)/self::node()', documentNode.documentElement), [documentNode.documentElement.firstChild, documentNode.documentElement.lastChild]);
	});

	it('supports walking from attribute nodes', () => {
		jsonMlMapper.parse([
			'someNode',
			{ someAttribute: 'someValue' },
			['someChildNode']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('@someAttribute/..', documentNode.documentElement), [documentNode.documentElement]);
	});

	it('allows returning other things then nodes at the last step of the path',
		() => chai.assert.equal(evaluateXPathToNumber('./42', documentNode), 42));

	it('sorts attribute nodes after their element', () => {
		jsonMlMapper.parse([
			'someNode',
			{ someAttribute: 'someValue' },
			['someChildNode']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('((@someAttribute, /someNode, //someChildNode)/.)[1]', documentNode.documentElement), [documentNode.documentElement]);
		chai.assert.deepEqual(evaluateXPathToString('((@someAttribute, /someNode, //someChildNode)/.)[2]', documentNode.documentElement), 'someValue');
		chai.assert.deepEqual(evaluateXPathToNodes('((@someAttribute, /someNode, //someChildNode)/.)[3]', documentNode.documentElement), [documentNode.documentElement.firstChild]);
	});

	it('sorts attribute nodes alphabetically', () => {
		jsonMlMapper.parse([
			'someNode',
			{ AsomeAttribute: 'someValue', BsomeOtherAttribute: 'someOtherValue' },
			['someChildNode']
		], documentNode);
		// We need to convert to string becase string-join expects strings and function conversion is not in yet
		chai.assert.equal(evaluateXPathToString('(@BsomeOtherAttribute, @AsomeAttribute)/string() => string-join(", ")', documentNode.documentElement), 'someValue, someOtherValue');
	});

	it('allows mixed pathseparators and abbreviated steps', function () {
		jsonMlMapper.parse([
			'someNode',
			[
				'someChildNode',
				['someGrandChild']
			]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToFirstNode('/someNode/someChildNode//someGrandChild/../..//someGrandChild', documentNode.documentElement), documentNode.documentElement.firstChild.firstChild);
	});

	it('supports addressing the contextNode with .', () => {
		jsonMlMapper.parse([
			'someNode',
			[
				'someChildNode',
				['someGrandChild']
			]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('.//*', documentNode.documentElement), [documentNode.documentElement.firstChild, documentNode.documentElement.firstChild.firstChild]);
	});
});

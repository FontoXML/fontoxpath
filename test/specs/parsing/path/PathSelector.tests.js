import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToAsyncIterator,
	evaluateXPathToNumbers,
	evaluateXPathToString
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
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
		chai.assert.deepEqual(evaluateXPathToNumbers('//*/position()', documentNode.documentElement), [1, 2, 3]);
	});

	it('Starts from a contextItem, not the contextSequence', () => {
		jsonMlMapper.parse([
			'someElement',
			['someChildElement', 'A piece of text'],
			['someChildElement', 'A piece of text'],
			['someChildElement', 'A piece of text'],
			['someChildElement', 'A piece of text']
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('/*/*[./text() => contains("piece of")]', documentNode.firstChild));
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

	it('sorts and dedupes child::/parent:: axes correctly', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode'],
			['someChildNode'],
			['someChildNode']
		], documentNode);
		chai.assert.equal(evaluateXPathToString('/*/*/../name()', documentNode.documentElement), 'someNode');
	});

	it('sorts descendant::/child:: axes correctly', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode', ['someGrandChildA1'], ['someGrandChildA2']],
			['someChildNode', ['someGrandChildB1'], ['someGrandChildB2']],
			['someChildNode', ['someGrandChildC1'], ['someGrandChildC2']]
		], documentNode);
		chai.assert.equal(evaluateXPathToString('descendant::someChildNode/*/name()', documentNode.documentElement), 'someGrandChildA1 someGrandChildA2 someGrandChildB1 someGrandChildB2 someGrandChildC1 someGrandChildC2');
	});

	it('sorts child::/descendant:: axes correctly', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode', ['someGrandChildA1'], ['someGrandChildA2']],
			['someChildNode', ['someGrandChildB1'], ['someGrandChildB2']],
			['someChildNode', ['someGrandChildC1'], ['someGrandChildC2']]
		], documentNode);
		chai.assert.equal(evaluateXPathToString('(/someNode/someChildNode//*)!name()', documentNode.documentElement), 'someGrandChildA1 someGrandChildA2 someGrandChildB1 someGrandChildB2 someGrandChildC1 someGrandChildC2');
	});

	it('sorts descendant-or-self::/child:: axes correctly', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode', ['someGrandChildA1'], ['someGrandChildA2']],
			['someChildNode', ['someGrandChildB1'], ['someGrandChildB2']],
			['someChildNode', ['someGrandChildC1'], ['someGrandChildC2']]
		], documentNode);
		chai.assert.equal(evaluateXPathToString('/descendant-or-self::*/child::*!name()', documentNode.documentElement), 'someChildNode someGrandChildA1 someGrandChildA2 someChildNode someGrandChildB1 someGrandChildB2 someChildNode someGrandChildC1 someGrandChildC2');
	});

	it('sorts descendant-or-self::/child::/descendant-or-self:: axes correctly', () => {
		jsonMlMapper.parse([
			'someNode',
			[
				'someChildNode',
				[
					'someGrandChildA1',
					['someGrandGrandChildA1-1'],
					['someGrandGrandChildA1-2']
				],
				[
					'someGrandChildA2',
					['someGrandGrandChildA2-1'],
					['someGrandGrandChildA2-2']
				]],
			[
				'someChildNode',
				[
					'someGrandChildB1',
					['someGrandGrandChildB1-1'],
					['someGrandGrandChildB1-2']
				],
				[
					'someGrandChildB2',
					['someGrandGrandChildB2-1'],
					['someGrandGrandChildB2-2']
				]],
			[
				'someChildNode',
				[
					'someGrandChildC1',
					['someGrandGrandChildC1-1'],
					['someGrandGrandChildC1-2']
				],
				[
					'someGrandChildC2',
					['someGrandGrandChild1C2-1'],
					['someGrandGrandChild1C2-2']
				]]
		], documentNode);
		chai.assert.equal(
			evaluateXPathToString('/descendant-or-self::*/child::*/descendant-or-self::*!name()', documentNode.documentElement),
			'someChildNode someGrandChildA1 someGrandGrandChildA1-1 someGrandGrandChildA1-2 someGrandChildA2 someGrandGrandChildA2-1 someGrandGrandChildA2-2 someChildNode someGrandChildB1 someGrandGrandChildB1-1 someGrandGrandChildB1-2 someGrandChildB2 someGrandGrandChildB2-1 someGrandGrandChildB2-2 someChildNode someGrandChildC1 someGrandGrandChildC1-1 someGrandGrandChildC1-2 someGrandChildC2 someGrandGrandChild1C2-1 someGrandGrandChild1C2-2');
	});

	it('sorts descendant::/ancestor:: axes correctly', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNodeA', ['someGrandChild'], ['someGrandChild']],
			['someChildNodeB', ['someGrandChild'], ['someGrandChild']],
			['someChildNodeC', ['someGrandChild'], ['someGrandChild']]
		], documentNode);
		chai.assert.equal(evaluateXPathToString('descendant::someGrandChild/ancestor::*!name()', documentNode.documentElement), 'someNode someChildNodeA someChildNodeB someChildNodeC');
	});

	it('sorts descendant-or-self::/descendant:: axes correctly', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNodeA', ['someGrandChildA1'], ['someGrandChildA2']],
			['someChildNodeB', ['someGrandChildB1'], ['someGrandChildB2']],
			['someChildNodeC', ['someGrandChildC1'], ['someGrandChildC2']]
		], documentNode);
		chai.assert.equal(evaluateXPathToString('descendant-or-self::*/descendant::*!name()', documentNode.documentElement), 'someChildNodeA someGrandChildA1 someGrandChildA2 someChildNodeB someGrandChildB1 someGrandChildB2 someChildNodeC someGrandChildC1 someGrandChildC2');
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

	it('does not require context for the first item', () => {
		jsonMlMapper.parse([
			'someNode',
			[
				'someChildNode',
				['someGrandChild']
			]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('function ($node) { $node//someGrandChild }(.)', documentNode.documentElement), [documentNode.documentElement.firstChild.firstChild]);
	});

	it('allows delayed execution', async () => {
		jsonMlMapper.parse([
			'someNode',
			[
				'someChildNode',
				['someGrandChild']
			]
		], documentNode);
		const it = evaluateXPathToAsyncIterator('/someNode[fontoxpath:sleep(true(), 1)]', documentNode);

		const val = await it.next();

		chai.assert(val.value === documentNode.documentElement);
	});
});

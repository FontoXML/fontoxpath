import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToNodes
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('descendant', () => {
	it('parses descendant::', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('descendant::someElement', documentNode), [documentNode.firstChild.firstChild]);
	});
});

describe('descendant-or-self', () => {
	it('descendant part', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('descendant-or-self::someElement', documentNode.documentElement), [documentNode.documentElement.firstChild]);
	});

	it('self part', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('descendant-or-self::someParentElement', documentNode.documentElement), [documentNode.documentElement]);
	});

	it('ordering of siblings', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('descendant-or-self::*', documentNode.documentElement), [documentNode.documentElement, documentNode.documentElement.firstChild]);
	});

	it('ordering of deeper descendants', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement', ['someElement', ['someElement']]]
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('descendant-or-self::*', documentNode.documentElement),
			[
				documentNode.documentElement,
				documentNode.documentElement.firstChild,
				documentNode.documentElement.firstChild.firstChild,
				documentNode.documentElement.firstChild.firstChild.firstChild
			]
		);
	});

	it('ordering of descendants with complex-ish queries', () => {
		jsonMlMapper.parse([
			'root',
			['a', ['a-a'], ['a-b']],
			['b', ['b-a'], ['b-b']]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('//*[name() = "root" or name() => starts-with("a") or name() => starts-with("b")]', documentNode).map(node => node.nodeName), ['root', 'a', 'a-a', 'a-b', 'b', 'b-a', 'b-b']);
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToNodes('descendant::*', null), 'XPDY0002');
	});
});

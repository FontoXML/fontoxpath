import jsonMlMapper from 'test-helpers/jsonMlMapper';
import * as slimdom from 'slimdom';

import {
	evaluateXPathToNodes
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('intersect', () => {
	it('returns an empty sequence if both args are an empty sequences',
		() => chai.assert.deepEqual(evaluateXPathToNodes('(() intersect ())', documentNode), []));

	it('returns an empty sequence if one of the operands is the empty sequence', () => {
		chai.assert.deepEqual(evaluateXPathToNodes('(. intersect ())', documentNode), []);
		chai.assert.deepEqual(evaluateXPathToNodes('(() intersect .)', documentNode), []);
	});

	it('returns the intersect between two node sequences', () => {
		jsonMlMapper.parse([
			'someNode',
			['a', { someAttribute: 'someValue' }],
			['b', { someAttribute: 'someOtherValue' }]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('(//*[@someAttribute] intersect //b)', documentNode), [documentNode.documentElement.lastChild]);
	});

	it('returns the correct nodes if they are unrelated', () => {
		const nodeA = documentNode.createElement('A');
		const nodeB = documentNode.createElement('B');
		chai.assert.deepEqual(evaluateXPathToNodes(
			'($A except $B, $B except $A)',
			documentNode,
			null,
			{ A: nodeA, B: nodeB }
		), [nodeA, nodeB]);
	});
});

describe('except', () => {
	it('returns an empty sequence if both args are empty sequences',
		() => chai.assert.deepEqual(evaluateXPathToNodes('(() except ())', documentNode), []));

	it('returns the filled sequence if the first operand is the empty sequence',
		() => chai.assert.deepEqual(evaluateXPathToNodes('(. except ())', documentNode), [documentNode]));

	it('returns the empty sequence if the second operand is empty',
		() => chai.assert.deepEqual(evaluateXPathToNodes('(() except .)', documentNode), []));

	it('returns the first node sequence, except nodes from the second sequence', () => {
		jsonMlMapper.parse([
			'someNode',
			['a', { someAttribute: 'someValue' }],
			['b', { someAttribute: 'someOtherValue' }]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('(//*[@someAttribute] except //b)', documentNode), [documentNode.documentElement.firstChild]);
	});

	it('returns the correct nodes if they are unrelated', () => {
		const nodeA = documentNode.createElement('A');
		const nodeB = documentNode.createElement('B');
		chai.assert.deepEqual(evaluateXPathToNodes(
			'($A intersect $B, $B intersect $A)',
			documentNode,
			null,
			{ A: nodeA, B: nodeB }
		), []);
	});
});

import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToFirstNode
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('child', () => {
	it('parses child::', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert(evaluateXPathToFirstNode('child::someElement', documentNode.documentElement) === documentNode.documentElement.firstChild);
	});

	it('is added implicitly', () =>{
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert(evaluateXPathToFirstNode('someElement', documentNode.documentElement) === documentNode.documentElement.firstChild);
	});

	it('An attribute has no children', () => {
		jsonMlMapper.parse([
			'someParentElement',
			{
				someAttribute: 'someValue'
			},
			['someElement']
		], documentNode);
		chai.assert(evaluateXPathToFirstNode('/attribute::someAttribute/child::node()', documentNode) === null);
	});

	it('sets the context sequence', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement'],
			['someOtherElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToFirstNode('someParentElement/child::*[last()]', documentNode), documentNode.documentElement.lastChild);
	});
	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToFirstNode('*', null), 'XPDY0002');
	});
});

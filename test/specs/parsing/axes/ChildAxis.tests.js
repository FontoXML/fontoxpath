import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToFirstNode } from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('child', () => {
	it('parses child::', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert(evaluateXPathToFirstNode('child::someElement', documentNode.documentElement, domFacade) === documentNode.documentElement.firstChild);
	});

	it('is added implicitly', () =>{
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert(evaluateXPathToFirstNode('someElement', documentNode.documentElement, domFacade) === documentNode.documentElement.firstChild);
	});

	it('An attribute has no children', () => {
		jsonMlMapper.parse([
			'someParentElement',
			{
				someAttribute: 'someValue'
			},
			['someElement']
		], documentNode);
		chai.assert(evaluateXPathToFirstNode('/attribute::someAttribute/child::node()', documentNode, domFacade) === null);
	});

	it('sets the context sequence', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement'],
			['someOtherElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToFirstNode('someParentElement/child::*[last()]', documentNode, domFacade), documentNode.documentElement.lastChild);
	});
});

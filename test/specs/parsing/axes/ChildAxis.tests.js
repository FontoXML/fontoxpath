import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToFirstNode } from 'fontoxml-selectors';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();

	jsonMlMapper.parse([
		'someParentElement',
		{
			'someAttribute': 'someValue'
		},
		['someElement']
	], documentNode);
});

describe('child', () => {
	it('parses child::',
	   () => chai.assert(evaluateXPathToFirstNode('child::someElement', documentNode.documentElement, domFacade) === documentNode.documentElement.firstChild));
	it('is added implicitly', () =>
	   chai.assert(evaluateXPathToFirstNode('someElement', documentNode.documentElement, domFacade) === documentNode.documentElement.firstChild));
	it('An attribute has no children',
	   () => chai.assert(evaluateXPathToFirstNode('/attribute::someAttribute/child::node()', documentNode, domFacade) === null));
});

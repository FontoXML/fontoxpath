import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPathToFirstNode from 'fontoxml-selectors/evaluateXPathToFirstNode';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();

	jsonMLMapper.parse([
		'someParentElement',
		{
			'someAttribute': 'someValue'
		},
		['someElement']
	], documentNode);
});

describe('child', () => {
	it('parses child::',
	   () => chai.assert(evaluateXPathToFirstNode('child::someElement', documentNode.documentElement, blueprint) === documentNode.documentElement.firstChild));
	it('is added implicitly', () =>
	   chai.assert(evaluateXPathToFirstNode('someElement', documentNode.documentElement, blueprint) === documentNode.documentElement.firstChild));
	it('An attribute has no children',
	   () => chai.assert(evaluateXPathToFirstNode('/attribute::someAttribute/child::node()', documentNode, blueprint) === null));
});

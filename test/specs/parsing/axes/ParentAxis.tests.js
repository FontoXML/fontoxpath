import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPathToNodes from 'fontoxml-selectors/evaluateXPathToNodes';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('parent', () => {
	it('returns the parentNode', () => {
		jsonMLMapper.parse([
			'someParentElement',
			['someElement', { 'someAttribute': 'someValue' }]
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('parent::someParentElement', documentNode.documentElement.firstChild, blueprint), [documentNode.documentElement]);
	});

	it('returns nothing for root nodes', () => {
		jsonMLMapper.parse([
			'someParentElement',
			['someElement', { 'someAttribute': 'someValue' }]
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('parent::node()', documentNode, blueprint), []);
	});
});

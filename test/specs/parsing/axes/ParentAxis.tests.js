import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToNodes } from 'fontoxml-selectors';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('parent', () => {
	it('returns the parentNode', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement', { 'someAttribute': 'someValue' }]
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('parent::someParentElement', documentNode.documentElement.firstChild, domFacade), [documentNode.documentElement]);
	});

	it('returns nothing for root nodes', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement', { 'someAttribute': 'someValue' }]
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('parent::node()', documentNode, domFacade), []);
	});
});

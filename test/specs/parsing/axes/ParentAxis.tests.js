import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToNodes
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('parent', () => {
	it('returns the parentNode', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement', { someAttribute: 'someValue' }]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('parent::someParentElement', documentNode.documentElement.firstChild), [documentNode.documentElement]);
	});

	it('returns nothing for root nodes', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement', { someAttribute: 'someValue' }]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('parent::node()', documentNode), []);
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToNodes('parent::*', null), 'XPDY0002');
	});
});

import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToNodes
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('following-sibling', () => {
	it('returns the next sibling', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement'],
			['someSiblingElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('following-sibling::someSiblingElement', documentNode.documentElement.firstChild), [documentNode.documentElement.lastChild]);
	});

	it('does not return non-matching siblings', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement'],
			['someNonMatchingElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('following-sibling::someSiblingElement', documentNode.documentElement.firstChild), []);
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToNodes('following-sibling::*', null), 'XPDY0002');
	});
});

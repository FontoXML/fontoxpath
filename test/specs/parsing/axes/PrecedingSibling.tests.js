import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToNodes
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('preceding-sibling', () => {
	it('returns the previous sibling', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someSiblingElement'],
			['someElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('preceding-sibling::someSiblingElement', documentNode.documentElement.lastChild), [documentNode.documentElement.firstChild]);
	});

	it('does not return non-matching siblings', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someNonMatchingElement'],
			['someElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('preceding-sibling::someSiblingElement', documentNode.documentElement.lastChild), []);
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToNodes('preceding-sibling::*', null), 'XPDY0002');
	});
});

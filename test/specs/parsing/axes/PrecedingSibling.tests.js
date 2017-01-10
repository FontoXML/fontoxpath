import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToNodes } from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('preceding-sibling', () => {
	it('returns the previous sibling', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someSiblingElement'],
			['someElement']
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('preceding-sibling::someSiblingElement', documentNode.documentElement.lastChild, domFacade),
			[documentNode.documentElement.firstChild]);
	});

	it('does not return non-matching siblings', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someNonMatchingElement'],
			['someElement']
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('preceding-sibling::someSiblingElement', documentNode.documentElement.lastChild, domFacade),
			[]);
	});
});

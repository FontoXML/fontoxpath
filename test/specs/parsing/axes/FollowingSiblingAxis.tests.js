import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToNodes } from 'fontoxml-selectors';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('following-sibling', () => {
	it('returns the next sibling', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement'],
			['someSiblingElement']
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('following-sibling::someSiblingElement', documentNode.documentElement.firstChild, domFacade),
			[documentNode.documentElement.lastChild]);
	});

	it('does not return non-matching siblings', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement'],
			['someNonMatchingElement']
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes('following-sibling::someSiblingElement', documentNode.documentElement.firstChild, domFacade),
			[]);
	});
});

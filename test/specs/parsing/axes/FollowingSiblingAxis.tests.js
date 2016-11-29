import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('following-sibling', () => {
	it('returns the next sibling', () => {
		jsonMLMapper.parse([
			'someParentElement',
			['someElement'],
			['someSiblingElement']
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPath('following-sibling::someSiblingElement', documentNode.documentElement.firstChild, blueprint, {}, evaluateXPath.NODES_TYPE),
			[documentNode.documentElement.lastChild]);
	});

	it('does not return non-matching siblings', () => {
		jsonMLMapper.parse([
			'someParentElement',
			['someElement'],
			['someNonMatchingElement']
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPath('following-sibling::someSiblingElement', documentNode.documentElement.firstChild, blueprint, {}, evaluateXPath.NODES_TYPE),
			[]);
	});
});

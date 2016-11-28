import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('preceding-sibling', () => {
	it('returns the previous sibling', () => {
		jsonMLMapper.parse([
			'someParentElement',
			['someSiblingElement'],
			['someElement']
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPath('preceding-sibling::someSiblingElement', documentNode.documentElement.lastChild, blueprint, {}, evaluateXPath.NODES_TYPE),
		[documentNode.documentElement.firstChild]);
	});

	it('does not return non-matching siblings', () => {
		jsonMLMapper.parse([
			'someParentElement',
			['someNonMatchingElement'],
			['someElement']
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPath('preceding-sibling::someSiblingElement', documentNode.documentElement.lastChild, blueprint, {}, evaluateXPath.NODES_TYPE),
			[]);
	});
});

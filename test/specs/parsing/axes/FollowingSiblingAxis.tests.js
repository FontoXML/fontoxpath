import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('following-sibling', () => {
	it('parses following-sibling::', () => {
		const selector = parseSelector('following-sibling::someSiblingElement');
		jsonMLMapper.parse([
			'someParentElement',
			['someElement'],
			['someSiblingElement']
		], documentNode);
		chai.expect(
			evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint, {}, evaluateXPath.NODES_TYPE))
			.to.deep.equal([documentNode.documentElement.lastChild]);
	});
});

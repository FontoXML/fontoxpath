import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('parent', () => {
	it('parses parent::', () => {
		const selector = parseSelector('parent::someParentElement');
		jsonMLMapper.parse([
			'someParentElement',
			['someElement', { 'someAttribute': 'someValue' }]
		], documentNode);
		chai.expect(
			evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint, {}, evaluateXPath.NODES_TYPE))
			.to.deep.equal([documentNode.documentElement]);
	});
});

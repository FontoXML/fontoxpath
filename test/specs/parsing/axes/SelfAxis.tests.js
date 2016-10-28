import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('self', () => {
	it('parses self::', () => {
		const selector = parseSelector('self::someElement'),
		element = documentNode.createElement('someElement');
		chai.expect(
			evaluateXPath(selector, element, blueprint))
			.to.deep.equal(element);
	});
});

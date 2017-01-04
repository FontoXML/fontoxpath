import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToFirstNode } from 'fontoxml-selectors';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('self', () => {
	it('parses self::', () => {
		const selector = ('self::someElement'),
		element = documentNode.createElement('someElement');
		chai.expect(
			evaluateXPathToFirstNode(selector, element, domFacade))
			.to.deep.equal(element);
	});
});

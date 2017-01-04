import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToBoolean } from 'fontoxml-selectors';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('not', () => {
	it('can parse an "not" selector', () => {
		const selector = ('not(true())');
		chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(false);
	});
});

import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToBoolean } from 'fontoxml-selectors';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('and operator', () => {
	it('can parse an "and" selector', () => {
		const selector = ('true() and true()');
		chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(true);
	});

	it('can parse a concatenation of ands', () => {
		const selector = ('true() and true() and true() and false()');
		chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(false);
	});
});

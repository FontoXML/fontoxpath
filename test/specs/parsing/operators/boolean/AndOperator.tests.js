import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToBoolean } from 'fontoxpath';

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

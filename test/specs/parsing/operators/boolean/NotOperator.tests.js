import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToBoolean } from 'fontoxpath';

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

import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToBoolean } from 'fontoxml-selectors';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('comments', () => {
	it('can parse comments', () => {
		const selector = ('true() (: and false() :) or true()');
		chai.expect(
			evaluateXPathToBoolean(selector, documentNode, domFacade)
		).to.deep.equal(true);
	});

	it('can parse nested comments', () => {
		const selector = ('true() (: and false() (:and true():) :) or false');
		chai.expect(
			evaluateXPathToBoolean(selector, documentNode, domFacade)
		).to.deep.equal(true);
	});
});

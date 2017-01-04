import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToString } from 'fontoxml-selectors';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('stringConcat', () => {
	it('can concatenate strings', () => {
		chai.expect(
			evaluateXPathToString('"con" || "cat" || "enate"', documentNode, domFacade)
		).to.deep.equal('concatenate');
	});

	it('can concatenate empty sequences', () => {
		chai.expect(
			evaluateXPathToString('() || "con" || () || "cat" || () || "enate" || ()', documentNode, domFacade)
		).to.deep.equal('concatenate');
	});
});

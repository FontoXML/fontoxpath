import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToBoolean } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('instance of operator', () => {
	it('returns true for a valid instance of xs:boolean', () => {
		chai.expect(evaluateXPathToBoolean('true() instance of xs:boolean', documentNode, domFacade)).to.equal(true);
	});

	it('returns true for a valid instance of xs:boolean?', () => {
		chai.expect(evaluateXPathToBoolean('() instance of xs:boolean?', documentNode, domFacade)).to.equal(true);
		chai.expect(evaluateXPathToBoolean('true() instance of xs:boolean?', documentNode, domFacade)).to.equal(true);
	});

	it('returns true for a valid instance of xs:boolean+', () => {
		chai.expect(evaluateXPathToBoolean('true() instance of xs:boolean+', documentNode, domFacade)).to.equal(true);
		chai.expect(evaluateXPathToBoolean('(true(), false()) instance of xs:boolean+', documentNode, domFacade)).to.equal(true);
	});

	it('returns true for a valid instance of xs:boolean*', () => {
		chai.expect(evaluateXPathToBoolean('() instance of xs:boolean*', documentNode, domFacade)).to.equal(true);
		chai.expect(evaluateXPathToBoolean('true() instance of xs:boolean*', documentNode, domFacade)).to.equal(true);
		chai.expect(evaluateXPathToBoolean('(true(), false()) instance of xs:boolean*', documentNode, domFacade)).to.equal(true);
	});

	it('returns false for an invalid instance of xs:boolean', () => {
		chai.expect(evaluateXPathToBoolean('() instance of xs:boolean', documentNode, domFacade)).to.equal(false);
	});

	it('returns false for an invalid instance of xs:boolean?', () => {
		chai.expect(evaluateXPathToBoolean('(true(), false()) instance of xs:boolean?', documentNode, domFacade)).to.equal(false);
	});

	it('returns false for an invalid instance of xs:boolean+', () => {
		chai.expect(evaluateXPathToBoolean('() instance of xs:boolean+', documentNode, domFacade)).to.equal(false);
	});
});

import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('instance of operator', () => {
	it('returns true for a valid instance of xs:boolean',
		() => chai.assert.isTrue(evaluateXPathToBoolean('true() instance of xs:boolean', documentNode)));

	it('returns true for a valid instance of xs:boolean?', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('() instance of xs:boolean?', documentNode));
		chai.assert.isTrue(evaluateXPathToBoolean('true() instance of xs:boolean?', documentNode));
	});

	it('returns true for a valid instance of xs:boolean+', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('true() instance of xs:boolean+', documentNode));
		chai.assert.isTrue(evaluateXPathToBoolean('(true(), false()) instance of xs:boolean+', documentNode));
	});

	it('returns true for a valid instance of xs:boolean*', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('() instance of xs:boolean*', documentNode));
		chai.assert.isTrue(evaluateXPathToBoolean('true() instance of xs:boolean*', documentNode));
		chai.assert.isTrue(evaluateXPathToBoolean('(true(), false()) instance of xs:boolean*', documentNode));
	});

	it('returns false for an invalid instance of xs:boolean',
		() => chai.assert.isFalse(evaluateXPathToBoolean('() instance of xs:boolean', documentNode)));

	it('returns false for an invalid instance of xs:boolean?',
		() => chai.assert.isFalse(evaluateXPathToBoolean('(true(), false()) instance of xs:boolean?', documentNode)));

	it('returns false for an invalid instance of xs:boolean+',
		() => chai.assert.isFalse(evaluateXPathToBoolean('() instance of xs:boolean+', documentNode)));

	it('returns false for an invalid instance of node()',
		() => chai.assert.isFalse(evaluateXPathToBoolean('1 instance of node()', documentNode)));
});

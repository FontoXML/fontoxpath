import slimdom from 'slimdom';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('and operator', () => {
	it('can parse an "and" selector',
		() => chai.assert.isTrue(evaluateXPathToBoolean('true() and true()', documentNode)));

	it('can parse a concatenation of ands',
		() => chai.assert.isFalse(evaluateXPathToBoolean('true() and true() and true() and false()', documentNode)));
});

import slimdom from 'slimdom';

import {
	domFacade,
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('boolean functions', () => {
	describe('xs:boolean()', () => {
		it('accepts "true"',
			() => chai.assert.equal(evaluateXPathToBoolean('xs:boolean("true")', documentNode, domFacade), true));
	});
});

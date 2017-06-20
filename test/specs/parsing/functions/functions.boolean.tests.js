import * as slimdom from 'slimdom';

import {
	domFacade,
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('boolean functions', () => {
	describe('xs:boolean()', () => {
		it('accepts "true"',
			() => chai.assert.equal(evaluateXPathToBoolean('xs:boolean("true")', documentNode, domFacade), true));
	});
});

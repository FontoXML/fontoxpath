import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import {
	evaluateXPathToBoolean
} from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('boolean functions', () => {
	describe('xs:boolean()', () => {
		it('accepts "true"', () => {
			chai.assert.equal(evaluateXPathToBoolean('xs:boolean("true")', documentNode, domFacade), true);
		});
	});
});

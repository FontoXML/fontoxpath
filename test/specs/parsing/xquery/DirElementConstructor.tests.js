import * as slimdom from 'slimdom';

import {
	evaluateXPathToFirstNode,
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('DirElementConstructor', () => {
	it('can create an element',
		() => chai.assert.equal(evaluateXPathToFirstNode('<element/>', documentNode).nodeType, 1));
	it('Sets the correct name',
		() => chai.assert.isTrue(evaluateXPathToBoolean('<element/> => name() = "element"', documentNode)));
	it('Sets attributes',
		() => chai.assert.isTrue(evaluateXPathToBoolean('(<element attr="value"/>)/@attr = "value"', documentNode)));
	it('May use inner expressions',
		() => chai.assert.isTrue(evaluateXPathToBoolean('(<element attr="{"value"}"/>)/@attr = "value"', documentNode)));
	it('Joins inner expressions using spaces',
		() => chai.assert.isTrue(evaluateXPathToBoolean('(<element attr="{(1,2,3)}"/>)/@attr = "1 2 3"', documentNode)));
	it('Allows mixing inner expressions and direct attributes',
		() => chai.assert.isTrue(evaluateXPathToBoolean('(<element attr="1 2 3 {(4,5,6)} 7 8 9"/>)/@attr = "1 2 3 4 5 6 7 8 9"', documentNode)));
});

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

	it('Trims outer spaces',
		() => chai.assert.isTrue(evaluateXPathToBoolean('<a> A A A <a> B B B </a>  A A A  </a>/string() = "A A AB B BA A A"', documentNode)));

	it('Parses character references with decimal points',
		() => chai.assert.isTrue(evaluateXPathToBoolean('<a>&#32;</a>/string() = " "', documentNode)));
	it('Parses character references with hexadecimal points',
		() => chai.assert.isTrue(evaluateXPathToBoolean('<a>&#x20;</a>/string() = " "', documentNode)));
});

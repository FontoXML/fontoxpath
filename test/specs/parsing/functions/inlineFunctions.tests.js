import {
	evaluateXPathToBoolean,
	domFacade
} from 'fontoxpath';
import slimdom from 'slimdom';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('inline functions', () => {
	it('can be placed in a let', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('let $fn := function () as xs:boolean { true() } return $fn()', documentNode, domFacade));
	});

	it('accepts not passing a return type', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('let $fn := function (){ true() } return $fn()', documentNode, domFacade));
	});

	it('accepts parameters', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('let $fn := function ($a as xs:boolean+){ $a } return $fn(true())', documentNode, domFacade));
	});

	it('correctly binds context', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('let $x := true(), $fn := function () {$x}, $x := false() return $fn() = true()', documentNode, domFacade));
	});

	it('throws an error for wrong number of arguments', () => {
		chai.assert.throws(
			() => evaluateXPathToBoolean('let $fn := function ($a as xs:boolean+){ $a } return $fn()', documentNode, domFacade),
		'XPTY0004');
	});

	it('throws an error for wrong typing of arguments', () => {
		chai.assert.throws(
			() => evaluateXPathToBoolean('let $fn := function ($a as xs:integer){ $a } return $fn("A string")', documentNode, domFacade),
		'XPTY0004');
	});

	it('throws an error for wrong multiplicity of arguments', () => {
		chai.assert.throws(
			() => evaluateXPathToBoolean('let $fn := function ($a as xs:integer){ $a } return $fn((1,2,3))', documentNode, domFacade),
		'XPTY0004');
	});
});

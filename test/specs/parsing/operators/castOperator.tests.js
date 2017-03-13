import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToBoolean } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('cast as', () => {
	describe('to xs:boolean', () => {
		it(
			'casts "true" to true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "true" cast as xs:boolean return $r instance of xs:boolean and $r = true()', documentNode, domFacade)));
		it(
			'casts "false" to false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "false" cast as xs:boolean return $r instance of xs:boolean and $r = false()', documentNode, domFacade)));
		it(
			'casts "1" to true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "1" cast as xs:boolean return $r instance of xs:boolean and $r = true()', documentNode, domFacade)));

		it(
			'casts "0" to false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "0" cast as xs:boolean return $r instance of xs:boolean and $r = false()', documentNode, domFacade)));

		it('throws when given an invalid value', () => chai.assert.throws(() => evaluateXPathToBoolean('let $r := "wat" cast as xs:boolean return $r instance of xs:boolean and $r = false()', documentNode, domFacade)), 'XPTY0004');

		it(
			'can cast integers to booleans: true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := 25 cast as xs:boolean return $r instance of xs:boolean and $r = true()', documentNode, domFacade)));
		it(
			'can cast integers to booleans: false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := 0 cast as xs:boolean return $r instance of xs:boolean and $r = false()', documentNode, domFacade)));
	});

	describe('to xs:integer', () => {
		it(
			'can cast booleans to integers: false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := false() cast as xs:integer return $r instance of xs:integer and $r = 0', documentNode, domFacade)));
		it(
			'can cast booleans to integers: true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := true() cast as xs:integer return $r instance of xs:integer and $r = 1', documentNode, domFacade)));
		it(
			'can cast strings to integers: "123"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "123" cast as xs:integer return $r instance of xs:integer and $r = 123', documentNode, domFacade)));
		it(
			'can cast decimals to integers: 123.2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := 123.2 cast as xs:integer return $r instance of xs:integer and $r = 123', documentNode, domFacade)));

	});

	describe('to xs:float', () => {
		it(
			'can cast booleans to floats: false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := false() cast as xs:float return $r instance of xs:float and $r = 0', documentNode, domFacade)));
		it(
			'can cast booleans to floats: true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := true() cast as xs:float return $r instance of xs:float and $r = 1', documentNode, domFacade)));
		it(
			'can cast strings to floats: "123"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "123" cast as xs:float return $r instance of xs:float and $r = 123', documentNode, domFacade)));
		it(
			'can cast strings to floats: "INF"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "INF" cast as xs:float return $r instance of xs:float and $r > 1000000', documentNode, domFacade)));

	});


});

import slimdom from 'slimdom';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('cast as', () => {
	it('accepts empty sequences',
		() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := () cast as xs:boolean? return $r => empty()', documentNode)));
	it('does not accept empty sequences',
		() => chai.assert.throws(() => evaluateXPathToBoolean('() cast as xs:boolean', documentNode)), 'XPST0004');
	it('does not accept sequences of length > 1',
		() => chai.assert.throws(() => evaluateXPathToBoolean('("a", "b") cast as xs:boolean', documentNode)), 'XPST0004');

	describe('to xs:boolean', () => {
		it('casts "true" to true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "true" cast as xs:boolean return $r instance of xs:boolean and $r = true()', documentNode)));
		it('casts "false" to false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "false" cast as xs:boolean return $r instance of xs:boolean and $r = false()', documentNode)));
		it('casts "1" to true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "1" cast as xs:boolean return $r instance of xs:boolean and $r = true()', documentNode)));
		it('casts "0" to false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "0" cast as xs:boolean return $r instance of xs:boolean and $r = false()', documentNode)));
		it('casts xs:untypedAtomic to false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:untypedAtomic("0") cast as xs:boolean return $r instance of xs:boolean and $r = false()', documentNode)));
		it('throws when given an invalid value',
			() => chai.assert.throws(() => evaluateXPathToBoolean('let $r := "wat" cast as xs:boolean return $r instance of xs:boolean and $r = false()', documentNode)), 'FORG0001');
		it('can cast integers to booleans: true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := 25 cast as xs:boolean return $r instance of xs:boolean and $r = true()', documentNode)));
		it('can cast integers to booleans: false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := 0 cast as xs:boolean return $r instance of xs:boolean and $r = false()', documentNode)));
	});

	describe('to xs:integer', () => {
		it('can cast booleans to integers: false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := false() cast as xs:integer return $r instance of xs:integer and $r = 0', documentNode)));
		it('can cast booleans to integers: true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := true() cast as xs:integer return $r instance of xs:integer and $r = 1', documentNode)));
		it('can cast strings to integers: "123"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "123" cast as xs:integer return $r instance of xs:integer and $r = 123', documentNode)));
		it('can cast decimals to integers: 123.2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := 123.2 cast as xs:integer return $r instance of xs:integer and $r = 123', documentNode)));
	});

	describe('to xs:decimal', () => {
		it('can cast booleans to decimals: false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := false() cast as xs:decimal return $r instance of xs:decimal and $r = 0', documentNode)));
		it('can cast booleans to decimals: true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := true() cast as xs:decimal return $r instance of xs:decimal and $r = 1', documentNode)));
		it('can cast strings to decimals: "123"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "123" cast as xs:decimal return $r instance of xs:decimal and $r = 123', documentNode)));
		it('can cast untypedAtomic to decimals: "123"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:untypedAtomic("123") cast as xs:decimal return $r instance of xs:decimal and $r = 123', documentNode)));
		it('fails casting non-numeric untypedAtomic to decimals: "Not a number at ALL"',
			() => chai.assert.throws(() => evaluateXPathToBoolean('let $r := xs:untypedAtomic("Not a number at all") cast as xs:decimal return $r instance of xs:decimal and $r = 123', documentNode)), 'XPTY0004');
		it('can cast floats to decimals: 123.2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:float("123.2") cast as xs:decimal return $r instance of xs:decimal and $r = 123.2', documentNode)));
		it('can cast integers to decimals: 123.2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := 123 cast as xs:decimal return $r instance of xs:decimal and $r = 123', documentNode)));
		it('fails casting NaN to decimals',
			() => chai.assert.throws(() => evaluateXPathToBoolean('let $r := xs:float("NaN") cast as xs:decimal return $r instance of xs:decimal and $r = 123.2', documentNode)), 'FOCA0002');
	});

	describe('to xs:float', () => {
		it('can cast booleans to floats: false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := false() cast as xs:float return $r instance of xs:float and $r = 0', documentNode)));
		it('can cast booleans to floats: true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := true() cast as xs:float return $r instance of xs:float and $r = 1', documentNode)));
		it('can cast strings to floats: "123"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "123" cast as xs:float return $r instance of xs:float and $r = 123', documentNode)));
		it('can cast strings to floats: "INF"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "INF" cast as xs:float return $r instance of xs:float and $r > 1000000', documentNode)));
		it('can cast strings to floats: "-INF"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "-INF" cast as xs:float return $r instance of xs:float and $r < -1000000', documentNode)));
		it('can cast strings to floats: "NaN"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "NaN" cast as xs:float return $r instance of xs:float and $r != $r', documentNode)));
		it('can cast strings to floats: "1E100"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "1E3" cast as xs:float return $r instance of xs:float and $r = 1000', documentNode)));
	});

	describe('to xs:double', () => {
		it('can cast booleans to doubles: false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := false() cast as xs:double return $r instance of xs:double and $r = 0', documentNode)));
		it('can cast booleans to doubles: true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := true() cast as xs:double return $r instance of xs:double and $r = 1', documentNode)));
		it('can cast strings to doubles: "123"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "123" cast as xs:double return $r instance of xs:double and $r = 123', documentNode)));
		it('can cast strings to doubles: "INF"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "INF" cast as xs:double return $r instance of xs:double and $r > 1000000', documentNode)));
		it('can cast strings to doubles: "-INF"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "-INF" cast as xs:double return $r instance of xs:double and $r < -1000000', documentNode)));
		it('can cast strings to doubles: "NaN"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "NaN" cast as xs:double return $r instance of xs:double and $r != $r', documentNode)));
		it('can cast strings to doubles: "1E100"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := "1E3" cast as xs:double return $r instance of xs:double and $r = 1000', documentNode)));
	});

	describe('to xs:string', () => {
		describe('from xs:float', () => {
			it('can cast floats to strings: 1E100',
				() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:float("1E100") cast as xs:string return $r instance of xs:string and $r = "1E100"', documentNode)));
			it('can cast floats to strings: 1E100',
				() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:float("1E100") cast as xs:string return $r instance of xs:string and $r = "1E100"', documentNode)));
			it('can cast floats to strings: 0',
				() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:float("0") cast as xs:string return $r instance of xs:string and $r = "0"', documentNode)));
			it('can cast floats to strings: -0',
				() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:float("-0") cast as xs:string return $r instance of xs:string and $r = "-0"', documentNode)));
			it('can cast floats to strings: INF',
				() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:float("INF") cast as xs:string return $r instance of xs:string and $r = "INF"', documentNode)));
			it('can cast floats to strings: -INF',
				() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:float("-INF") cast as xs:string return $r instance of xs:string and $r = "-INF"', documentNode)));
			it('can cast floats to strings: +INF',
				() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:float("+INF") cast as xs:string return $r instance of xs:string and $r = "INF"', documentNode)));
		});

		describe('from xs:double', () => {
			it('can cast doubles to strings: 1E100',
				() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:double("1E100") cast as xs:string return $r instance of xs:string and $r = "1E100"', documentNode)));
			it('can cast doubles to strings: 1E100',
				() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:double("1E100") cast as xs:string return $r instance of xs:string and $r = "1E100"', documentNode)));
			it('can cast doubles to strings: 0',
				() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:double("0") cast as xs:string return $r instance of xs:string and $r = "0"', documentNode)));
			it('can cast doubles to strings: -0',
				() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:double("-0") cast as xs:string return $r instance of xs:string and $r = "-0"', documentNode)));
			it('can cast doubles to strings: INF',
				() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:double("INF") cast as xs:string return $r instance of xs:string and $r = "INF"', documentNode)));
			it('can cast doubles to strings: -INF',
				() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:double("-INF") cast as xs:string return $r instance of xs:string and $r = "-INF"', documentNode)));
			it('can cast doubles to strings: +INF',
				() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:double("+INF") cast as xs:string return $r instance of xs:string and $r = "INF"', documentNode)));
		});

		it('can cast integers to strings: 100',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:integer("100") cast as xs:string return $r instance of xs:string and $r = "100"', documentNode)));
		it('can cast integers to strings: -100',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:integer("-100") cast as xs:string return $r instance of xs:string and $r = "-100"', documentNode)));
	});

	describe('to xs:untypedAtomic', () => {
		it('can cast strings to untypedAtomics',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:untypedAtomic("1E100") cast as xs:untypedAtomic return $r instance of xs:untypedAtomic and $r = "1E100"', documentNode)));
	});
});

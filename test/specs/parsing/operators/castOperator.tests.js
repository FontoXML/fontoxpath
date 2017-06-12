import slimdom from 'slimdom';

import {
	evaluateXPathToBoolean,
	evaluateXPathToString,
	evaluateXPathToNumber
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('cast as', () => {
	it('accepts empty sequences',
		() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := () cast as xs:boolean? return $r => empty()', documentNode)));
	it('does not accept empty sequences',
		() => chai.assert.throws(() => evaluateXPathToBoolean('() cast as xs:boolean', documentNode), 'XPTY0004'));
	it('does not accept sequences of length > 1',
		() => chai.assert.throws(() => evaluateXPathToBoolean('("a", "b") cast as xs:boolean', documentNode), 'XPTY0004'));

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
			() => chai.assert.throws(() => evaluateXPathToBoolean('let $r := "wat" cast as xs:boolean return $r instance of xs:boolean and $r = false()', documentNode), 'FORG0001'));
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
			() => chai.assert.throws(() => evaluateXPathToBoolean('let $r := xs:untypedAtomic("Not a number at all") cast as xs:decimal return $r instance of xs:decimal and $r = 123', documentNode), 'FORG0001'));
		it('can cast floats to decimals: 123.2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := xs:float("123.2") cast as xs:decimal return $r instance of xs:decimal and $r = 123.2', documentNode)));
		it('can cast integers to decimals: 123.2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $r := 123 cast as xs:decimal return $r instance of xs:decimal and $r = 123', documentNode)));
		it('fails casting NaN to decimals',
			() => chai.assert.throws(() => evaluateXPathToBoolean('let $r := xs:float("NaN") cast as xs:decimal return $r instance of xs:decimal and $r = 123.2', documentNode), 'FOCA0002'));
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

	describe('to xs:anyURI', () => {
		it('can cast strings to anyURI',
			() => chai.assert.equal(evaluateXPathToString('xs:anyURI("a string")', documentNode), 'a string'));
	});

	describe('to xs:hexBinary', () => {
		it('can cast the empty string to hexBinary',
			() => chai.assert.isTrue(evaluateXPathToBoolean('exists(xs:hexBinary(""))', documentNode)));
	});

	describe('to xs:base64Binary', () => {
		it('can cast the empty string to base64Binary',
			() => chai.assert.isTrue(evaluateXPathToBoolean('exists(xs:base64Binary(""))', documentNode)));
	});

	describe('to xs:date', () => {
		it.skip('can cast a string to date: upper bounds. This will not work because JavaScript Dates do not allow setting the year that far back',
				() => chai.assert.isTrue(evaluateXPathToBoolean('exists(xs:date("25252734927766555-06-07+02:00"))', documentNode)));
		it.skip('can cast a string to date: lower bounds. This will not work because JavaScript Dates do not allow setting the year that far back',
			() => chai.assert.isTrue(evaluateXPathToBoolean('exists(xs:date("-25252734927766555-06-07+02:00"))', documentNode)));
	});

	describe('to xs:gMonthDay', () => {
		it('can cast a string to gMonthDay: lower bounds',
			() => chai.assert.isTrue(evaluateXPathToBoolean('exists(xs:gMonthDay("--01-01Z"))', documentNode)));
		it('can cast a string to gMonthDay: upper bounds',
			() => chai.assert.isTrue(evaluateXPathToBoolean('exists(xs:gMonthDay("--12-31Z"))', documentNode)));

	});

	describe('to xs:long', () => {
		it('can cast strings to xs:long: max bounds. This will not work because of JavaScript numbers not having the same ranges',
			() => chai.assert.throws(() => evaluateXPathToNumber('xs:long("9223372036854775808")', documentNode), 'FOCA0003'));
		it('can cast strings to xs:long: middle bounds',
			() => chai.assert.equal(evaluateXPathToNumber('xs:long("922337203685458")', documentNode), 922337203685458));
	});

	describe('to xs:int', () => {
		it('can cast strings to xs:int',
			() => chai.assert.equal(evaluateXPathToNumber('xs:int("1234")', documentNode), 1234));
		it('xs:int can not be written in hexadecimal',
			() => chai.assert.throws(() => evaluateXPathToNumber('xs:int("0x1234")', documentNode), 'FORG0001'));
		it('xs:int can not be written with fractions',
			() => chai.assert.throws(() => evaluateXPathToNumber('xs:int("1.0")', documentNode), 'FORG0001'));
	});

	describe('to xs:negativeInteger', () => {
		it('can cast strings to xs:negativeInteger',
			() => chai.assert.equal(evaluateXPathToNumber('xs:negativeInteger("-10")', documentNode), -10));
		it('disallows positive values',
			() => chai.assert.throws(() => evaluateXPathToNumber('xs:negativeInteger("1")', documentNode), 'FORG0001'));
		it('disallows positive values 0',
			() => chai.assert.throws(() => evaluateXPathToNumber('xs:negativeInteger("0")', documentNode), 'FORG0001'));
	});

	describe('to xs:nonNegativeInteger', () => {
		it('can cast strings to xs:nonNegativeInteger',
			() => chai.assert.equal(evaluateXPathToNumber('xs:nonNegativeInteger("10")', documentNode), 10));
		it('allows 0',
			() => chai.assert.equal(evaluateXPathToNumber('xs:nonNegativeInteger("0")', documentNode), 0));

		it('disallows negative values',
			() => chai.assert.throws(() => evaluateXPathToNumber('xs:nonNegativeInteger("-2")', documentNode), 'FORG0001'));
		});

	describe('to xs:normalizedString', () => {
		it('can cast integers to xs:normalizedString',
			() => chai.assert.equal(evaluateXPathToString('xs:normalizedString(1234)', documentNode), '1234'));
	});

	describe('to xs:ENTITY', () => {
		it('can cast strings to xs:ENTITY',
			() => chai.assert.equal(evaluateXPathToString('xs:ENTITY("someString")', documentNode), 'someString'));
		it('disallows empty strings',
			() => chai.assert.throws(() => evaluateXPathToString('xs:ENTITY("")', documentNode), 'FORG0001'));

	});

	describe('to xs:language', () => {
		it('can cast strings to xs:language',
			() => chai.assert.isTrue(evaluateXPathToBoolean('exists(xs:language("qya"))', documentNode)));
		it('disallows integers at the start',
			() => chai.assert.throws(() => evaluateXPathToNumber('xs:language("1234")', documentNode), 'FORG0001'));
		it('disallows integers as a type',
			() => chai.assert.throws(() => evaluateXPathToNumber('xs:language(xs:int("1234"))', documentNode), 'FORG0001'));
	});

	describe('to xs:error', () => {
		it('can not cast anything to xs:error',
			() => chai.assert.throws(() => evaluateXPathToNumber('1 cast as xs:error', documentNode), 'FORG0001'));
	});

	describe('to xs:dayTimeDuration', () => {
		it('from xs:yearMonthDuration',
			() => chai.assert.isTrue(evaluateXPathToBoolean('xs:string(xs:dayTimeDuration(xs:yearMonthDuration("-P543Y456M"))) eq "PT0S"', documentNode)));
	});
});

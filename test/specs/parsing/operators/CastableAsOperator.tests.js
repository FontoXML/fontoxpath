import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';
let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('castable as', () => {
	it('accepts empty sequences',
		() => chai.assert.isTrue(evaluateXPathToBoolean('() castable as xs:boolean?', documentNode)));
	it('does not accept empty sequences',
		() => chai.assert.isFalse(evaluateXPathToBoolean('() castable as xs:boolean', documentNode)), 'XPST0004');
	it('does not accept sequences of length > 1',
		() => chai.assert.isFalse(evaluateXPathToBoolean('("a", "b") castable as xs:boolean', documentNode)), 'XPST0004');
	it('accepts async params', async () => {
		chai.assert.isTrue(await evaluateXPathToAsyncSingleton('("a" => fontoxpath:sleep()) castable as xs:string', documentNode));
	});

	describe('as xs:boolean', () => {
		it('casts "true" to true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"true" castable as xs:boolean', documentNode)));
		it('casts "false" to false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"false" castable as xs:boolean', documentNode)));
		it('casts "1" to true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"1" castable as xs:boolean', documentNode)));
		it('casts "0" to false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"0" castable as xs:boolean', documentNode)));
		it('casts xs:untypedAtomic to false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('xs:untypedAtomic("0") castable as xs:boolean', documentNode)));
		it('throws when given an invalid value',
			() => chai.assert.isFalse(evaluateXPathToBoolean('"wat" castable as xs:boolean', documentNode)), 'FORG0001');
		it('can cast integers to booleans: true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('25 castable as xs:boolean', documentNode)));
		it('can cast integers to booleans: false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('0 castable as xs:boolean', documentNode)));
	});

	describe('as xs:integer', () => {
		it('can cast booleans to integers: false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('false() castable as xs:integer', documentNode)));
		it('can cast booleans to integers: true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('true() castable as xs:integer', documentNode)));
		it('can cast strings to integers: "123"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"123" castable as xs:integer', documentNode)));
		it('can cast decimals to integers: 123.2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('123.2 castable as xs:integer', documentNode)));
	});

	describe('as xs:decimal', () => {
		it('can cast booleans to decimals: false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('false() castable as xs:decimal', documentNode)));
		it('can cast booleans to decimals: true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('true() castable as xs:decimal', documentNode)));
		it('can cast strings to decimals: "123"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"123" castable as xs:decimal', documentNode)));
		it('can cast untypedAtomic to decimals: "123"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('xs:untypedAtomic("123") castable as xs:decimal', documentNode)));
		it('fails casting non-numeric untypedAtomic to decimals: "Not a number at ALL"',
			() => chai.assert.isFalse(evaluateXPathToBoolean('xs:untypedAtomic("Not a number at all") castable as xs:decimal', documentNode)), 'XPTY0004');
		it('can cast floats to decimals: 123.2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('xs:float("123.2") castable as xs:decimal', documentNode)));
		it('can cast integers to decimals: 123.2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('123 castable as xs:decimal', documentNode)));
		it('fails casting NaN to decimals',
			() => chai.assert.isFalse(evaluateXPathToBoolean('xs:float("NaN") castable as xs:decimal', documentNode)), 'FOCA0002');
	});

	describe('as xs:float', () => {
		it('can cast booleans to floats: false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('false() castable as xs:float', documentNode)));
		it('can cast booleans to floats: true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('true() castable as xs:float', documentNode)));
		it('can cast strings to floats: "123"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"123" castable as xs:float', documentNode)));
		it('can cast strings to floats: "INF"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"INF" castable as xs:float', documentNode)));
		it('can cast strings to floats: "-INF"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"-INF" castable as xs:float', documentNode)));
		it('can cast strings to floats: "NaN"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"NaN" castable as xs:float', documentNode)));
		it('can cast strings to floats: "1E100"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"1E3" castable as xs:float', documentNode)));
	});

	describe('as xs:double', () => {
		it('can cast booleans to doubles: false',
			() => chai.assert.isTrue(evaluateXPathToBoolean('false() castable as xs:double', documentNode)));
		it('can cast booleans to doubles: true',
			() => chai.assert.isTrue(evaluateXPathToBoolean('true() castable as xs:double', documentNode)));
		it('can cast strings to doubles: "123"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"123" castable as xs:double', documentNode)));
		it('can cast strings to doubles: "INF"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"INF" castable as xs:double', documentNode)));
		it('can cast strings to doubles: "-INF"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"-INF" castable as xs:double', documentNode)));
		it('can cast strings to doubles: "NaN"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"NaN" castable as xs:double', documentNode)));
		it('can cast strings to doubles: "1E100"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"1E3" castable as xs:double', documentNode)));
	});

	describe('as xs:string', () => {
		describe('from xs:float', () => {
			it('can cast floats to strings: 1E100',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:float("1E100") castable as xs:string', documentNode)));
			it('can cast floats to strings: 1E100',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:float("1E100") castable as xs:string', documentNode)));
			it('can cast floats to strings: 0',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:float("0") castable as xs:string', documentNode)));
			it('can cast floats to strings: -0',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:float("-0") castable as xs:string', documentNode)));
			it('can cast floats to strings: INF',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:float("INF") castable as xs:string', documentNode)));
			it('can cast floats to strings: -INF',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:float("-INF") castable as xs:string', documentNode)));
			it('can cast floats to strings: +INF',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:float("+INF") castable as xs:string', documentNode)));
		});

		describe('from xs:double', () => {
			it('can cast doubles to strings: 1E100',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:double("1E100") castable as xs:string', documentNode)));
			it('can cast doubles to strings: 1E100',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:double("1E100") castable as xs:string', documentNode)));
			it('can cast doubles to strings: 0',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:double("0") castable as xs:string', documentNode)));
			it('can cast doubles to strings: -0',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:double("-0") castable as xs:string', documentNode)));
			it('can cast doubles to strings: INF',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:double("INF") castable as xs:string', documentNode)));
			it('can cast doubles to strings: -INF',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:double("-INF") castable as xs:string', documentNode)));
			it('can cast doubles to strings: +INF',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:double("+INF") castable as xs:string', documentNode)));
		});

		it('can cast integers to strings: 100',
			() => chai.assert.isTrue(evaluateXPathToBoolean('xs:integer("100") castable as xs:string', documentNode)));
		it('can cast integers to strings: -100',
			() => chai.assert.isTrue(evaluateXPathToBoolean('xs:integer("-100") castable as xs:string', documentNode)));
	});

	describe('as xs:untypedAtomic', () => {
		it('can cast strings to untypedAtomics',
			() => chai.assert.isTrue(evaluateXPathToBoolean('xs:untypedAtomic("1E100") castable as xs:untypedAtomic', documentNode)));
	});

	describe('as xs:anyURI', () => {
		it('can cast strings to anyURI',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"a string" castable as xs:anyURI', documentNode)));
	});

	describe('as xs:hexBinary', () => {
		it('can cast the empty string to hexBinary',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"" castable as xs:hexBinary', documentNode)));
		it('fails to cast invalid strings to hexBinary',
			() => chai.assert.isTrue(evaluateXPathToBoolean('xs:untypedAtomic("0100101010") castable as xs:hexBinary', documentNode)));
	});

	describe('as xs:base64Binary', () => {
		it('can cast the empty string to base64Binary',
			() => chai.assert.isTrue(evaluateXPathToBoolean('xs:base64Binary("") castable as xs:base64Binary', documentNode)));
	});

	describe('as xs:date', () => {
		it.skip('can cast a string to date: upper bounds. This will not work because JavaScript Dates do not allow setting the year that far back',
				() => chai.assert.isTrue(evaluateXPathToBoolean('"25252734927766555-06-07+02:00" castable as xs:date', documentNode)));
		it.skip('can cast a string to date: lower bounds. This will not work because JavaScript Dates do not allow setting the year that far back',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"-25252734927766555-06-07+02:00" castable as xs:date', documentNode)));
	});

	describe('as xs:gMonthDay', () => {
		it('can cast a string to gMonthDay: lower bounds',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"--01-01Z" castable as xs:gMonthDay', documentNode)));
		it('can cast a string to gMonthDay: upper bounds',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"--12-31Z" castable as xs:gMonthDay', documentNode)));

	});

	describe('as xs:long', () => {
		it('can cast strings to xs:long: max bounds. This will not work because of JavaScript numbers not having the same ranges',
			() => chai.assert.isFalse(evaluateXPathToBoolean('"9223372036854775808" castable as xs:long', documentNode), 9223372036854775808), 'FOAR0002');
		it('can cast strings to xs:long: middle bounds',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"922337203685458" castable as xs:long', documentNode), 922337203685458));
	});

	describe('as xs:int', () => {
		it('can cast strings to xs:int',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"1234" castable as xs:int', documentNode), 1234));
		it('xs:int can not be written in hexadecimal',
			() => chai.assert.isFalse(evaluateXPathToBoolean('"0x1234" castable as xs:int', documentNode)));
		it('xs:int can not be written with fractions',
			() => chai.assert.isFalse(evaluateXPathToBoolean('"1.0" castable as xs:int', documentNode)));
	});

	describe('as xs:normalizedString', () => {
		it('can cast integers to xs:normalizedString',
			() => chai.assert.isTrue(evaluateXPathToBoolean('1234 castable as xs:normalizedString', documentNode)));
	});

	describe('as xs:yearMonthDuration', () => {
		it('can not cast invalid untypedAtomics to xs:yearMonthDuration',
			() => chai.assert.isFalse(evaluateXPathToBoolean('xs:untypedAtomic("-P1Y1M1DT1H1M1.123S") castable as xs:yearMonthDuration', documentNode)));
	});

	describe('as xs:yearMonthDuration', () => {
		it('can not cast invalid strings to xs:yearMonthDuration',
			() => chai.assert.isFalse(evaluateXPathToBoolean('"P3YT2H" castable as xs:dayTimeDuration', documentNode)));
	});

	describe('as xs:ENTITY', () => {
		it('can cast strings to xs:ENTITY',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"someString" castable as xs:ENTITY', documentNode)));
		it('disallows empty strings',
			() => chai.assert.isFalse(evaluateXPathToBoolean('"" castable as xs:ENTITY', documentNode)));

	});

	describe('as xs:language', () => {
		it('can cast strings to xs:language',
			() => chai.assert.isTrue(evaluateXPathToBoolean('"qya" castable as xs:language', documentNode)));
		it('disallows integers at the start',
			() => chai.assert.isFalse(evaluateXPathToBoolean('"1234" castable as xs:language', documentNode)), 'FORG0001');
		it('disallows integers as a type',
			() => chai.assert.isFalse(evaluateXPathToBoolean('xs:int("1234") castable as xs:language', documentNode)), 'FORG0001');
	});

	describe('as xs:error', () => {
		it('can not cast anything as xs:error',
			() => chai.assert.isFalse(evaluateXPathToBoolean('1 castable as xs:error', documentNode)));
	});
});

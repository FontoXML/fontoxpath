import castToType from 'fontoxpath/selectors/dataTypes/castToType';
import createAtomicValue from 'fontoxpath/selectors/dataTypes/createAtomicValue';

import DateTime from 'fontoxpath/selectors/dataTypes/valueTypes/DateTime';
import Duration from 'fontoxpath/selectors/dataTypes/valueTypes/Duration';
import QName from 'fontoxpath/selectors/dataTypes/valueTypes/QName';

// Y = can be cast to target
// N = can not be cast to target
// ? = depends on given value if cast will succeed

// S\T | uA  str flt dbl dec int dur yMD dTD dT  tim dat gYM gY  gMD gD  gM  bln b64 hxB URI QN  NOT
// uA  |  Y   Y   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?
// str |  Y   Y   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?   ?
// flt |  Y   Y   Y   Y   ?   ?   N   N   N   N   N   N   N   N   N   N   N   Y   N   N   N   N   N
// dbl |  Y   Y   Y   Y   ?   ?   N   N   N   N   N   N   N   N   N   N   N   Y   N   N   N   N   N
// dec |  Y   Y   Y   Y   Y   Y   N   N   N   N   N   N   N   N   N   N   N   Y   N   N   N   N   N
// int |  Y   Y   Y   Y   Y   Y   N   N   N   N   N   N   N   N   N   N   N   Y   N   N   N   N   N
// dur |  Y   Y   N   N   N   N   Y   Y   Y   N   N   N   N   N   N   N   N   N   N   N   N   N   N
// yMD |  Y   Y   N   N   N   N   Y   Y   Y   N   N   N   N   N   N   N   N   N   N   N   N   N   N
// dTD |  Y   Y   N   N   N   N   Y   Y   Y   N   N   N   N   N   N   N   N   N   N   N   N   N   N
// dT  |  Y   Y   N   N   N   N   N   N   N   Y   Y   Y   Y   Y   Y   Y   Y   N   N   N   N   N   N
// tim |  Y   Y   N   N   N   N   N   N   N   N   Y   N   N   N   N   N   N   N   N   N   N   N   N
// dat |  Y   Y   N   N   N   N   N   N   N   Y   N   Y   Y   Y   Y   Y   Y   N   N   N   N   N   N
// gYM |  Y   Y   N   N   N   N   N   N   N   N   N   N   Y   N   N   N   N   N   N   N   N   N   N
// gY  |  Y   Y   N   N   N   N   N   N   N   N   N   N   N   Y   N   N   N   N   N   N   N   N   N
// gMD |  Y   Y   N   N   N   N   N   N   N   N   N   N   N   N   Y   N   N   N   N   N   N   N   N
// gD  |  Y   Y   N   N   N   N   N   N   N   N   N   N   N   N   N   Y   N   N   N   N   N   N   N
// gM  |  Y   Y   N   N   N   N   N   N   N   N   N   N   N   N   N   N   Y   N   N   N   N   N   N
// bln |  Y   Y   Y   Y   Y   Y   N   N   N   N   N   N   N   N   N   N   N   Y   N   N   N   N   N
// b64 |  Y   Y   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   Y   Y   N   N   N
// hxB |  Y   Y   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   Y   Y   N   N   N
// URI |  Y   Y   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   Y   N   N
// QN  |  Y   Y   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   Y   ?
// NOT |  Y   Y   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   N   Y   ?

describe('castToType()', () => {
	describe('casting to or from xs:anySimpleType', () => {
		it('throws when casting to xs:anySimpleType', () => {
			chai.assert.throw(() => castToType(createAtomicValue('string', 'xs:string'), 'xs:anySimpleType'));
		});
		it('throws when casting from xs:anySimpleType', () => {
			chai.assert.throw(() => castToType(createAtomicValue('string', 'xs:anySimpleType'), 'xs:string'));
		});
	});

	describe('casting to or from xs:anyAtomicType', () => {
		it('throws when casting to xs:anyAtomicType', () => {
			chai.assert.throw(() => castToType(createAtomicValue('string', 'xs:string'), 'xs:anyAtomicType'));
		});
		it('throws when casting to xs:anyAtomicTpe', () => {
			chai.assert.throw(() => castToType(createAtomicValue('string', 'xs:anyAtomicType'), 'xs:string'));
		});
	});

	describe('to xs:untypedAtomic', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('string', 'xs:untypedAtomic'), 'xs:untypedAtomic'),
				createAtomicValue('string', 'xs:untypedAtomic')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('string', 'xs:string'), 'xs:untypedAtomic'),
				createAtomicValue('string', 'xs:untypedAtomic')));
		it('from xs:float',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, 'xs:float'), 'xs:untypedAtomic'),
				createAtomicValue('10.123', 'xs:untypedAtomic')));
		it('from xs:double',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, 'xs:double'), 'xs:untypedAtomic'),
				createAtomicValue('10.123', 'xs:untypedAtomic')));
		it('from xs:decimal',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:untypedAtomic'),
				createAtomicValue('1010', 'xs:untypedAtomic')));
		it('from xs:integer',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1010, 'xs:integer'), 'xs:untypedAtomic'),
				createAtomicValue('1010', 'xs:untypedAtomic')));
		it('from xs:duration',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.10S'), 'xs:duration'), 'xs:untypedAtomic'),
				createAtomicValue('P10Y10M10DT10H10M10.1S', 'xs:untypedAtomic')));
		it('from xs:yearMonthDuration',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:untypedAtomic'),
				createAtomicValue('P10Y10M', 'xs:untypedAtomic')));
		it('from xs:dayTimeDuration',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:untypedAtomic'),
				createAtomicValue('P10DT10H10M10.1S', 'xs:untypedAtomic')));
		it('from xs:dateTime',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:untypedAtomic'),
				createAtomicValue('2000-10-10T10:10:10+10:30', 'xs:untypedAtomic')));
		it('from xs:time',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:untypedAtomic'),
				createAtomicValue('10:10:10+10:30', 'xs:untypedAtomic')));
		it('from xs:date',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:untypedAtomic'),
				createAtomicValue('2000-10-10+10:30', 'xs:untypedAtomic')));
		it('from xs:gYearMonth',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:untypedAtomic'),
				createAtomicValue('2000-10+10:30', 'xs:untypedAtomic')));
		it('from xs:gYear',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:untypedAtomic'),
				createAtomicValue('2000+10:30', 'xs:untypedAtomic')));
		it('from xs:gMonthDay',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:untypedAtomic'),
				createAtomicValue('--10-10+10:30', 'xs:untypedAtomic')));
		it('from xs:gDay',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:untypedAtomic'),
				createAtomicValue('---10+10:30', 'xs:untypedAtomic')));
		it('from xs:gMonth',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:untypedAtomic'),
				createAtomicValue('--10+10:30', 'xs:untypedAtomic')));
		it('from xs:boolean',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(true, 'xs:boolean'), 'xs:untypedAtomic'),
				createAtomicValue('true', 'xs:untypedAtomic')));
		it('from xs:base64Binary',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:untypedAtomic'),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:untypedAtomic')));
		it('from xs:hexBinary',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:untypedAtomic'),
				createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:untypedAtomic')));
		it('from xs:anyURI',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:untypedAtomic'),
				createAtomicValue('string', 'xs:untypedAtomic')));
		it('from xs:NOTATION',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:untypedAtomic'),
				createAtomicValue('string', 'xs:untypedAtomic')));
	});

	describe('to xs:string', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('string', 'xs:untypedAtomic'), 'xs:string'),
				createAtomicValue('string', 'xs:string')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('string', 'xs:string'), 'xs:string'),
				createAtomicValue('string', 'xs:string')));
		it('from xs:float',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, 'xs:float'), 'xs:string'),
				createAtomicValue('10.123', 'xs:string')));
		it('from xs:double',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, 'xs:double'), 'xs:string'),
				createAtomicValue('10.123', 'xs:string')));
		it('from xs:decimal',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:string'),
				createAtomicValue('1010', 'xs:string')));
		it('from xs:integer',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1010, 'xs:integer'), 'xs:string'),
				createAtomicValue('1010', 'xs:string')));
		it('from xs:duration',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.10S'), 'xs:duration'), 'xs:string'),
				createAtomicValue('P10Y10M10DT10H10M10.1S', 'xs:string')));
		it('from xs:yearMonthDuration',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:string'),
				createAtomicValue('P10Y10M', 'xs:string')));
		it('from xs:dayTimeDuration',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:string'),
				createAtomicValue('P10DT10H10M10.1S', 'xs:string')));
		it('from xs:dateTime',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:string'),
				createAtomicValue('2000-10-10T10:10:10+10:30', 'xs:string')));
		it('from xs:time',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:string'),
				createAtomicValue('10:10:10+10:30', 'xs:string')));
		it('from xs:date',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:string'),
				createAtomicValue('2000-10-10+10:30', 'xs:string')));
		it('from xs:gYearMonth',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:string'),
				createAtomicValue('2000-10+10:30', 'xs:string')));
		it('from xs:gYear',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:string'),
				createAtomicValue('2000+10:30', 'xs:string')));
		it('from xs:gMonthDay',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:string'),
				createAtomicValue('--10-10+10:30', 'xs:string')));
		it('from xs:gDay',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:string'),
				createAtomicValue('---10+10:30', 'xs:string')));
		it('from xs:gMonth',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:string'),
				createAtomicValue('--10+10:30', 'xs:string')));
		it('from xs:boolean',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(true, 'xs:boolean'), 'xs:string'),
				createAtomicValue('true', 'xs:string')));
		it('from xs:base64Binary',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:string'),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:string')));
		it('from xs:hexBinary',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:string'),
				createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:string')));
		it('from xs:anyURI',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:string'),
				createAtomicValue('string', 'xs:string')));
		it('from xs:NOTATION',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:string'),
				createAtomicValue('string', 'xs:string')));
	});

	describe('to xs:float', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', 'xs:untypedAtomic'), 'xs:float'),
				createAtomicValue(10.10, 'xs:float')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', 'xs:string'), 'xs:float'),
				createAtomicValue(10.10, 'xs:float')));
		it('from xs:float',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, 'xs:float'), 'xs:float'),
				createAtomicValue(10.123, 'xs:float')));
		it('from xs:double',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, 'xs:double'), 'xs:float'),
				createAtomicValue(10.123, 'xs:float')));
		it('from xs:decimal',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:float'),
				createAtomicValue(1010, 'xs:float')));
		it('from xs:integer',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1010, 'xs:integer'), 'xs:float'),
				createAtomicValue(1010, 'xs:float')));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.10S'), 'xs:duration'), 'xs:float'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:float'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:float'),
				'XPTY0004'));
		it('from xs:dateTime (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:float'),
				'XPTY0004'));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:float'),
				'XPTY0004'));
		it('from xs:date (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:float'),
				'XPTY0004'));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:float'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:float'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:float'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:float'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:float'),
				'XPTY0004'));
		it('from xs:boolean',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(true, 'xs:boolean'), 'xs:float'),
				createAtomicValue(1, 'xs:float')));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:float'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:float'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:float'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:float'),
				'XPTY0004'));
	});

	describe('to xs:double', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', 'xs:untypedAtomic'), 'xs:double'),
				createAtomicValue(10.10, 'xs:double')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', 'xs:string'), 'xs:double'),
				createAtomicValue(10.10, 'xs:double')));
		it('from xs:float',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, 'xs:float'), 'xs:double'),
				createAtomicValue(10.123, 'xs:double')));
		it('from xs:double',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, 'xs:double'), 'xs:double'),
				createAtomicValue(10.123, 'xs:double')));
		it('from xs:decimal',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:double'),
				createAtomicValue(1010, 'xs:double')));
		it('from xs:integer',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1010, 'xs:integer'), 'xs:double'),
				createAtomicValue(1010, 'xs:double')));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.10S'), 'xs:duration'), 'xs:double'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:double'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:double'),
				'XPTY0004'));
		it('from xs:dateTime (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:double'),
				'XPTY0004'));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:double'),
				'XPTY0004'));
		it('from xs:date (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:double'),
				'XPTY0004'));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:double'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:double'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:double'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:double'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:double'),
				'XPTY0004'));
		it('from xs:boolean',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(true, 'xs:boolean'), 'xs:double'),
				createAtomicValue(1, 'xs:double')));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:double'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:double'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:double'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:double'),
				'XPTY0004'));
	});

	describe('to xs:double', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', 'xs:untypedAtomic'), 'xs:double'),
				createAtomicValue(10.10, 'xs:double')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', 'xs:string'), 'xs:double'),
				createAtomicValue(10.10, 'xs:double')));
		it('from xs:float',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, 'xs:float'), 'xs:double'),
				createAtomicValue(10.123, 'xs:double')));
		it('from xs:double',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, 'xs:double'), 'xs:double'),
				createAtomicValue(10.123, 'xs:double')));
		it('from xs:decimal',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:double'),
				createAtomicValue(1010, 'xs:double')));
		it('from xs:integer',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1010, 'xs:integer'), 'xs:double'),
				createAtomicValue(1010, 'xs:double')));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.10S'), 'xs:duration'), 'xs:double'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:double'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:double'),
				'XPTY0004'));
		it('from xs:dateTime (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:double'),
				'XPTY0004'));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:double'),
				'XPTY0004'));
		it('from xs:date (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:double'),
				'XPTY0004'));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:double'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:double'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:double'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:double'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:double'),
				'XPTY0004'));
		it('from xs:boolean',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(true, 'xs:boolean'), 'xs:double'),
				createAtomicValue(1, 'xs:double')));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:double'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:double'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:double'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:double'),
				'XPTY0004'));
	});

	describe('to xs:decimal', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', 'xs:untypedAtomic'), 'xs:decimal'),
				createAtomicValue(10.10, 'xs:decimal')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', 'xs:string'), 'xs:decimal'),
				createAtomicValue(10.10, 'xs:decimal')));
		it('from xs:float',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, 'xs:float'), 'xs:decimal'),
				createAtomicValue(10.123, 'xs:decimal')));
		it('from xs:double',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, 'xs:double'), 'xs:decimal'),
				createAtomicValue(10.123, 'xs:decimal')));
		it('from xs:decimal',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:decimal'),
				createAtomicValue(1010, 'xs:decimal')));
		it('from xs:integer',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1010, 'xs:integer'), 'xs:decimal'),
				createAtomicValue(1010, 'xs:decimal')));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.10S'), 'xs:duration'), 'xs:decimal'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:decimal'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:decimal'),
				'XPTY0004'));
		it('from xs:dateTime (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:decimal'),
				'XPTY0004'));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:decimal'),
				'XPTY0004'));
		it('from xs:date (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:decimal'),
				'XPTY0004'));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:decimal'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:decimal'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:decimal'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:decimal'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:decimal'),
				'XPTY0004'));
		it('from xs:boolean',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(true, 'xs:boolean'), 'xs:decimal'),
				createAtomicValue(1, 'xs:decimal')));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:decimal'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:decimal'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:decimal'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:decimal'),
				'XPTY0004'));
	});

	describe('to xs:integer', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('10', 'xs:untypedAtomic'), 'xs:integer'),
				createAtomicValue(10, 'xs:integer')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('10', 'xs:string'), 'xs:integer'),
				createAtomicValue(10, 'xs:integer')));
		it('from xs:float',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, 'xs:float'), 'xs:integer'),
				createAtomicValue(10, 'xs:integer')));
		it('from xs:double',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, 'xs:double'), 'xs:integer'),
				createAtomicValue(10, 'xs:integer')));
		it('from xs:decimal',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:integer'),
				createAtomicValue(1010, 'xs:integer')));
		it('from xs:integer',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1010, 'xs:integer'), 'xs:integer'),
				createAtomicValue(1010, 'xs:integer')));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.10S'), 'xs:duration'), 'xs:integer'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:integer'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:integer'),
				'XPTY0004'));
		it('from xs:dateTime (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:integer'),
				'XPTY0004'));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:integer'),
				'XPTY0004'));
		it('from xs:date (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:integer'),
				'XPTY0004'));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:integer'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:integer'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:integer'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:integer'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:integer'),
				'XPTY0004'));
		it('from xs:boolean',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(true, 'xs:boolean'), 'xs:integer'),
				createAtomicValue(1, 'xs:integer')));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:integer'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:integer'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:integer'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:integer'),
				'XPTY0004'));
	});

	describe('to xs:duration', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('P10Y10M10DT10H10M10.1S', 'xs:untypedAtomic'), 'xs:duration'),
				createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('P10Y10M10DT10H10M10.1S', 'xs:string'), 'xs:duration'),
				createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration')));
		it('from xs:float (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:float'), 'xs:duration'),
				'XPTY0004'));
		it('from xs:double (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:double'), 'xs:duration'),
				'XPTY0004'));
		it('from xs:decimal (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:duration'),
				'XPTY0004'));
		it('from xs:integer (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:integer'), 'xs:duration'),
				'XPTY0004'));
		it('from xs:duration',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration'), 'xs:duration'),
				createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration')));
		it('from xs:yearMonthDuration',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:duration'),
				createAtomicValue(Duration.fromString('P10Y10M'), 'xs:duration')));
		it('from xs:dayTimeDuration',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:duration'),
				createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:duration')));
		it('from xs:dateTime (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:duration'),
				'XPTY0004'));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:duration'),
				'XPTY0004'));
		it('from xs:date (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:duration'),
				'XPTY0004'));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:duration'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:duration'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:duration'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:duration'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:duration'),
				'XPTY0004'));
		it('from xs:boolean (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(true, 'xs:boolean'), 'xs:duration'),
				'XPTY0004'));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:duration'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:duration'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:duration'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:duration'),
				'XPTY0004'));
	});

	describe('to xs:yearMonthDuration', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('P10Y10M', 'xs:untypedAtomic'), 'xs:yearMonthDuration'),
				createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('P10Y10M', 'xs:string'), 'xs:yearMonthDuration'),
				createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration')));
		it('from xs:float (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:float'), 'xs:yearMonthDuration'),
				'XPTY0004'));
		it('from xs:double (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:double'), 'xs:yearMonthDuration'),
				'XPTY0004'));
		it('from xs:decimal (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:yearMonthDuration'),
				'XPTY0004'));
		it('from xs:integer (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:integer'), 'xs:yearMonthDuration'),
				'XPTY0004'));
		it('from xs:duration',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration'), 'xs:yearMonthDuration'),
				createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration')));
		it('from xs:yearMonthDuration',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:yearMonthDuration'),
				createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration')));
		it('from xs:dayTimeDuration',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:yearMonthDuration'),
				createAtomicValue(Duration.fromString('P0M'), 'xs:yearMonthDuration')));
		it('from xs:dateTime (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:yearMonthDuration'),
				'XPTY0004'));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:yearMonthDuration'),
				'XPTY0004'));
		it('from xs:date (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:yearMonthDuration'),
				'XPTY0004'));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:yearMonthDuration'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:yearMonthDuration'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:yearMonthDuration'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:yearMonthDuration'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:yearMonthDuration'),
				'XPTY0004'));
		it('from xs:boolean (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(true, 'xs:boolean'), 'xs:yearMonthDuration'),
				'XPTY0004'));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:yearMonthDuration'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:yearMonthDuration'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:yearMonthDuration'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:yearMonthDuration'),
				'XPTY0004'));
	});

	describe('to xs:dayTimeDuration', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('P10DT10H10M10.1S', 'xs:untypedAtomic'), 'xs:dayTimeDuration'),
				createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('P10DT10H10M10.1S', 'xs:string'), 'xs:dayTimeDuration'),
				createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration')));
		it('from xs:float (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:float'), 'xs:dayTimeDuration'),
				'XPTY0004'));
		it('from xs:double (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:double'), 'xs:dayTimeDuration'),
				'XPTY0004'));
		it('from xs:decimal (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:dayTimeDuration'),
				'XPTY0004'));
		it('from xs:integer (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:integer'), 'xs:dayTimeDuration'),
				'XPTY0004'));
		it('from xs:duration',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration'), 'xs:dayTimeDuration'),
				createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration')));
		it('from xs:yearMonthDuration',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:dayTimeDuration'),
				createAtomicValue(Duration.fromString('PT0S'), 'xs:dayTimeDuration')));
		it('from xs:dayTimeDuration',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:dayTimeDuration'),
				createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration')));
		it('from xs:dateTime (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:dayTimeDuration'),
				'XPTY0004'));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:dayTimeDuration'),
				'XPTY0004'));
		it('from xs:date (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:dayTimeDuration'),
				'XPTY0004'));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:dayTimeDuration'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:dayTimeDuration'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:dayTimeDuration'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:dayTimeDuration'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:dayTimeDuration'),
				'XPTY0004'));
		it('from xs:boolean (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(true, 'xs:boolean'), 'xs:dayTimeDuration'),
				'XPTY0004'));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:dayTimeDuration'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:dayTimeDuration'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:dayTimeDuration'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:dayTimeDuration'),
				'XPTY0004'));
	});

	describe('to xs:dateTime', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('2000-10-10T10:10:10+10:30', 'xs:untypedAtomic'), 'xs:dateTime'),
				createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('2000-10-10T10:10:10+10:30', 'xs:string'), 'xs:dateTime'),
				createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime')));
		it('from xs:float (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:float'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:double (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:double'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:decimal (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:integer (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:integer'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:dateTime',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:dateTime'),
				createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime')));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:date',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:dateTime'),
				createAtomicValue(DateTime.fromString('2000-10-10T00:00:00+10:30'), 'xs:dateTime')));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:boolean (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(true, 'xs:boolean'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:dateTime'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:dateTime'),
				'XPTY0004'));
	});

	describe('to xs:time', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('10:10:10+10:30', 'xs:untypedAtomic'), 'xs:time'),
				createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('10:10:10+10:30', 'xs:string'), 'xs:time'),
				createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time')));
		it('from xs:float (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:float'), 'xs:time'),
				'XPTY0004'));
		it('from xs:double (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:double'), 'xs:time'),
				'XPTY0004'));
		it('from xs:decimal (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:time'),
				'XPTY0004'));
		it('from xs:integer (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:integer'), 'xs:time'),
				'XPTY0004'));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration'), 'xs:time'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:time'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:time'),
				'XPTY0004'));
		it('from xs:dateTime',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:time'),
				createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time')));
		it('from xs:time',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:time'),
				createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time')));
		it('from xs:date (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:time'),
				'XPTY0004'));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:time'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:time'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:time'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:time'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:time'),
				'XPTY0004'));
		it('from xs:boolean (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(true, 'xs:boolean'), 'xs:time'),
				'XPTY0004'));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:time'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:time'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:time'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:time'),
				'XPTY0004'));
	});

	describe('to xs:date', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('2000-10-10+10:30', 'xs:untypedAtomic'), 'xs:date'),
				createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('2000-10-10+10:30', 'xs:string'), 'xs:date'),
				createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date')));
		it('from xs:float (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:float'), 'xs:date'),
				'XPTY0004'));
		it('from xs:double (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:double'), 'xs:date'),
				'XPTY0004'));
		it('from xs:decimal (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:date'),
				'XPTY0004'));
		it('from xs:integer (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:integer'), 'xs:date'),
				'XPTY0004'));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration'), 'xs:date'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:date'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:date'),
				'XPTY0004'));
		it('from xs:dateTime',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:date'),
				createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date')));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:date'),
				'XPTY0004'));
		it('from xs:date',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:date'),
				createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date')));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:date'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:date'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:date'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:date'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:date'),
				'XPTY0004'));
		it('from xs:boolean (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(true, 'xs:boolean'), 'xs:date'),
				'XPTY0004'));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:date'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:date'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:date'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:date'),
				'XPTY0004'));
	});

	describe('to xs:gYearMonth', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('2000-10+10:30', 'xs:untypedAtomic'), 'xs:gYearMonth'),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('2000-10+10:30', 'xs:string'), 'xs:gYearMonth'),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth')));
		it('from xs:float (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:float'), 'xs:gYearMonth'),
				'XPTY0004'));
		it('from xs:double (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:double'), 'xs:gYearMonth'),
				'XPTY0004'));
		it('from xs:decimal (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:gYearMonth'),
				'XPTY0004'));
		it('from xs:integer (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:integer'), 'xs:gYearMonth'),
				'XPTY0004'));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration'), 'xs:gYearMonth'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:gYearMonth'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:gYearMonth'),
				'XPTY0004'));
		it('from xs:dateTime',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:gYearMonth'),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth')));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:gYearMonth'),
				'XPTY0004'));
		it('from xs:date',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:gYearMonth'),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth')));
		it('from xs:gYearMonth',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:gYearMonth'),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth')));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:gYearMonth'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:gYearMonth'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:gYearMonth'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:gYearMonth'),
				'XPTY0004'));
		it('from xs:boolean (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(true, 'xs:boolean'), 'xs:gYearMonth'),
				'XPTY0004'));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:gYearMonth'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:gYearMonth'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:gYearMonth'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:gYearMonth'),
				'XPTY0004'));
	});

	describe('to xs:gYear', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('2000+10:30', 'xs:untypedAtomic'), 'xs:gYear'),
				createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('2000+10:30', 'xs:string'), 'xs:gYear'),
				createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear')));
		it('from xs:float (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:float'), 'xs:gYear'),
				'XPTY0004'));
		it('from xs:double (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:double'), 'xs:gYear'),
				'XPTY0004'));
		it('from xs:decimal (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:gYear'),
				'XPTY0004'));
		it('from xs:integer (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:integer'), 'xs:gYear'),
				'XPTY0004'));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration'), 'xs:gYear'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:gYear'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:gYear'),
				'XPTY0004'));
		it('from xs:dateTime',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:gYear'),
				createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear')));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:gYear'),
				'XPTY0004'));
		it('from xs:date',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:gYear'),
				createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear')));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:gYear'),
				'XPTY0004'));
		it('from xs:gYear',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:gYear'),
				createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear')));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:gYear'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:gYear'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:gYear'),
				'XPTY0004'));
		it('from xs:boolean (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(true, 'xs:boolean'), 'xs:gYear'),
				'XPTY0004'));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:gYear'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:gYear'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:gYear'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:gYear'),
				'XPTY0004'));
	});

	describe('to xs:gMonthDay', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('--10-10+10:30', 'xs:untypedAtomic'), 'xs:gMonthDay'),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('--10-10+10:30', 'xs:string'), 'xs:gMonthDay'),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay')));
		it('from xs:float (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:float'), 'xs:gMonthDay'),
				'XPTY0004'));
		it('from xs:double (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:double'), 'xs:gMonthDay'),
				'XPTY0004'));
		it('from xs:decimal (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:gMonthDay'),
				'XPTY0004'));
		it('from xs:integer (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:integer'), 'xs:gMonthDay'),
				'XPTY0004'));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration'), 'xs:gMonthDay'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:gMonthDay'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:gMonthDay'),
				'XPTY0004'));
		it('from xs:dateTime',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:gMonthDay'),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay')));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:gMonthDay'),
				'XPTY0004'));
		it('from xs:date',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:gMonthDay'),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay')));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:gMonthDay'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:gMonthDay'),
				'XPTY0004'));
		it('from xs:gMonthDay',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:gMonthDay'),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay')));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:gMonthDay'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:gMonthDay'),
				'XPTY0004'));
		it('from xs:boolean (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(true, 'xs:boolean'), 'xs:gMonthDay'),
				'XPTY0004'));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:gMonthDay'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:gMonthDay'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:gMonthDay'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:gMonthDay'),
				'XPTY0004'));
	});

	describe('to xs:gDay', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('---10+10:30', 'xs:untypedAtomic'), 'xs:gDay'),
				createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('---10+10:30', 'xs:string'), 'xs:gDay'),
				createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay')));
		it('from xs:float (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:float'), 'xs:gDay'),
				'XPTY0004'));
		it('from xs:double (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:double'), 'xs:gDay'),
				'XPTY0004'));
		it('from xs:decimal (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:gDay'),
				'XPTY0004'));
		it('from xs:integer (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:integer'), 'xs:gDay'),
				'XPTY0004'));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration'), 'xs:gDay'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:gDay'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:gDay'),
				'XPTY0004'));
		it('from xs:dateTime',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:gDay'),
				createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay')));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:gDay'),
				'XPTY0004'));
		it('from xs:date',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:gDay'),
				createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay')));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:gDay'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:gDay'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:gDay'),
				'XPTY0004'));
		it('from xs:gDay',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:gDay'),
				createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay')));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:gDay'),
				'XPTY0004'));
		it('from xs:boolean (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(true, 'xs:boolean'), 'xs:gDay'),
				'XPTY0004'));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:gDay'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:gDay'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:gDay'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:gDay'),
				'XPTY0004'));
	});

	describe('to xs:gMonth', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('--10+10:30', 'xs:untypedAtomic'), 'xs:gMonth'),
				createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('--10+10:30', 'xs:string'), 'xs:gMonth'),
				createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth')));
		it('from xs:float (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:float'), 'xs:gMonth'),
				'XPTY0004'));
		it('from xs:double (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(10.123, 'xs:double'), 'xs:gMonth'),
				'XPTY0004'));
		it('from xs:decimal (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:decimal'), 'xs:gMonth'),
				'XPTY0004'));
		it('from xs:integer (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1010, 'xs:integer'), 'xs:gMonth'),
				'XPTY0004'));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration'), 'xs:gMonth'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:gMonth'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:gMonth'),
				'XPTY0004'));
		it('from xs:dateTime',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:gMonth'),
				createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth')));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:gMonth'),
				'XPTY0004'));
		it('from xs:date',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:gMonth'),
				createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth')));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:gMonth'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:gMonth'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:gMonth'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:gMonth'),
				'XPTY0004'));
		it('from xs:gMonth',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:gMonth'),
				createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth')));
		it('from xs:boolean (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(true, 'xs:boolean'), 'xs:gMonth'),
				'XPTY0004'));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:gMonth'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:gMonth'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:gMonth'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:gMonth'),
				'XPTY0004'));
	});

	describe('to xs:boolean', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('true', 'xs:untypedAtomic'), 'xs:boolean'),
				createAtomicValue(true, 'xs:boolean')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('true', 'xs:string'), 'xs:boolean'),
				createAtomicValue(true, 'xs:boolean')));
		it('from xs:float',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1, 'xs:float'), 'xs:boolean'),
				createAtomicValue(true, 'xs:boolean')));
		it('from xs:double',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1, 'xs:double'), 'xs:boolean'),
				createAtomicValue(true, 'xs:boolean')));
		it('from xs:decimal',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1, 'xs:decimal'), 'xs:boolean'),
				createAtomicValue(true, 'xs:boolean')));
		it('from xs:integer',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(1, 'xs:integer'), 'xs:boolean'),
				createAtomicValue(true, 'xs:boolean')));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration'), 'xs:boolean'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:boolean'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:boolean'),
				'XPTY0004'));
		it('from xs:dateTime (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:boolean'),
				'XPTY0004'));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:boolean'),
				'XPTY0004'));
		it('from xs:date (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:boolean'),
				'XPTY0004'));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:boolean'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:boolean'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:boolean'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:boolean'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:boolean'),
				'XPTY0004'));
		it('from xs:boolean',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue(true, 'xs:boolean'), 'xs:boolean'),
				createAtomicValue(true, 'xs:boolean')));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:boolean'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('21FE3A44123C21FE3A44123C', 'xs:hexBinary'), 'xs:boolean'),
				'XPTY0004'));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:boolean'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:boolean'),
				'XPTY0004'));
	});

	describe('to xs:base64Binary', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:untypedAtomic'), 'xs:base64Binary'),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:string'), 'xs:base64Binary'),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary')));
		it('from xs:float (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1, 'xs:float'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:double (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1, 'xs:double'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:decimal (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1, 'xs:decimal'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:integer (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1, 'xs:integer'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:dateTime (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:date (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:boolean (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(true, 'xs:boolean'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:base64Binary',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:base64Binary'),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary')));
		it('from xs:hexBinary',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('736F6D65206261736536342074657874', 'xs:hexBinary'), 'xs:base64Binary'),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary')));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:base64Binary'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:base64Binary'),
				'XPTY0004'));
	});

	describe('to xs:hexBinary', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('736F6D65206261736536342074657874', 'xs:untypedAtomic'), 'xs:hexBinary'),
				createAtomicValue('736F6D65206261736536342074657874', 'xs:hexBinary')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('736F6D65206261736536342074657874', 'xs:string'), 'xs:hexBinary'),
				createAtomicValue('736F6D65206261736536342074657874', 'xs:hexBinary')));
		it('from xs:float (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1, 'xs:float'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:double (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1, 'xs:double'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:decimal (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1, 'xs:decimal'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:integer (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1, 'xs:integer'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:dateTime (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:date (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:boolean (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(true, 'xs:boolean'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:base64Binary',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:hexBinary'),
				createAtomicValue('736F6D65206261736536342074657874', 'xs:hexBinary')));
		it('from xs:hexBinary',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('736F6D65206261736536342074657874', 'xs:hexBinary'), 'xs:hexBinary'),
				createAtomicValue('736F6D65206261736536342074657874', 'xs:hexBinary')));
		it('from xs:anyURI (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:hexBinary'),
				'XPTY0004'));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:hexBinary'),
				'XPTY0004'));
	});

	describe('to xs:anyURI', () => {
		it('from xs:untypedAtomic',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('string', 'xs:untypedAtomic'), 'xs:anyURI'),
				createAtomicValue('string', 'xs:anyURI')));
		it('from xs:string',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('string', 'xs:string'), 'xs:anyURI'),
				createAtomicValue('string', 'xs:anyURI')));
		it('from xs:float (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1, 'xs:float'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:double (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1, 'xs:double'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:decimal (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1, 'xs:decimal'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:integer (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1, 'xs:integer'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:duration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:yearMonthDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:dayTimeDuration (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:dateTime (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:time (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:date (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:gYearMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:gYear (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:gMonthDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:gDay (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:gMonth (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:boolean (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(true, 'xs:boolean'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:base64Binary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:hexBinary (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('736F6D65206261736536342074657874', 'xs:hexBinary'), 'xs:anyURI'),
				'XPTY0004'));
		it('from xs:anyURI',
			() => chai.assert.deepEqual(
				castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:anyURI'),
				createAtomicValue('string', 'xs:anyURI')));
		it('from xs:NOTATION (throws XPTY0004)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:anyURI'),
				'XPTY0004'));
	});


	describe('to xs:NOTATION', () => {
		it('from xs:untypedAtomic (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:untypedAtomic'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:string (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:string'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:float (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1, 'xs:float'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:double (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1, 'xs:double'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:decimal (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1, 'xs:decimal'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:integer (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(1, 'xs:integer'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:duration (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10.1S'), 'xs:duration'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:yearMonthDuration (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10Y10M'), 'xs:yearMonthDuration'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:dayTimeDuration (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(Duration.fromString('P10DT10H10M10.1S'), 'xs:dayTimeDuration'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:dateTime (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), 'xs:dateTime'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:time (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('10:10:10+10:30'), 'xs:time'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:date (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10-10+10:30'), 'xs:date'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:gYearMonth (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000-10+10:30'), 'xs:gYearMonth'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:gYear (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('2000+10:30'), 'xs:gYear'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:gMonthDay (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10-10+10:30'), 'xs:gMonthDay'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:gDay (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('---10+10:30'), 'xs:gDay'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:gMonth (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(DateTime.fromString('--10+10:30'), 'xs:gMonth'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:boolean (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue(true, 'xs:boolean'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:base64Binary (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', 'xs:base64Binary'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:NOTATION (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('736F6D65206261736536342074657874', 'xs:NOTATION'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:anyURI (throws XPST0080)',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:anyURI'), 'xs:NOTATION'),
				'XPST0080'));
		it('from xs:NOTATION',
			() => chai.assert.throws(
				() => castToType(createAtomicValue('string', 'xs:NOTATION'), 'xs:NOTATION'),
				'XPST0080'));
	});
});

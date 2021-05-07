import * as chai from 'chai';
import castToType from 'fontoxpath/expressions/dataTypes/castToType';
import createAtomicValue from 'fontoxpath/expressions/dataTypes/createAtomicValue';
import { ValueType } from 'fontoxpath/expressions/dataTypes/Value';
import DateTime from 'fontoxpath/expressions/dataTypes/valueTypes/DateTime';
import DayTimeDuration from 'fontoxpath/expressions/dataTypes/valueTypes/DayTimeDuration';
import Duration from 'fontoxpath/expressions/dataTypes/valueTypes/Duration';
import YearMonthDuration from 'fontoxpath/expressions/dataTypes/valueTypes/YearMonthDuration';

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
	before(() => {
		if (typeof (global as any).atob === 'undefined') {
			(global as any).atob = (b64Encoded) => new Buffer(b64Encoded, 'base64').toString();
			(global as any).btoa = (str) => new Buffer(str).toString('base64');
		}
	});

	describe('casting to or from xs:anySimpleType', () => {
		it('throws when casting to xs:anySimpleType', () => {
			chai.assert.throw(() =>
				castToType(
					createAtomicValue('string', ValueType.XSSTRING),
					ValueType.XSANYSIMPLETYPE
				)
			);
		});
		it('throws when casting from xs:anySimpleType', () => {
			chai.assert.throw(() =>
				castToType(
					createAtomicValue('string', ValueType.XSANYSIMPLETYPE),
					ValueType.XSSTRING
				)
			);
		});
	});

	describe('casting to or from xs:anyAtomicType', () => {
		it('throws when casting to xs:anyAtomicType', () => {
			chai.assert.throw(() =>
				castToType(
					createAtomicValue('string', ValueType.XSSTRING),
					ValueType.XSANYATOMICTYPE
				)
			);
		});
		it('throws when casting to xs:anyAtomicTpe', () => {
			chai.assert.throw(() =>
				castToType(
					createAtomicValue('string', ValueType.XSANYATOMICTYPE),
					ValueType.XSSTRING
				)
			);
		});
	});

	describe('to xs:untypedAtomic', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('string', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', ValueType.XSSTRING),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('string', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, ValueType.XSFLOAT), ValueType.XSUNTYPEDATOMIC),
				createAtomicValue('10.123', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(10.123, ValueType.XSDOUBLE),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('10.123', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, ValueType.XSDECIMAL), ValueType.XSUNTYPEDATOMIC),
				createAtomicValue('1010', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, ValueType.XSINTEGER), ValueType.XSUNTYPEDATOMIC),
				createAtomicValue('1010', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:duration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						Duration.fromString('P10Y10M10DT10H10M10S'),
						ValueType.XSDURATION
					),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('P10Y10M10DT10H10M10S', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:yearMonthDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						Duration.fromString('P10Y10M'),
						ValueType.XSYEARMONTHDURATION
					),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('P10Y10M', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:dayTimeDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						Duration.fromString('P10DT10H10M10S'),
						ValueType.XSDAYTIMEDURATION
					),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('P10DT10H10M10S', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						DateTime.fromString('2000-10-10T10:10:10+10:30'),
						ValueType.XSDATETIME
					),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('2000-10-10T10:10:10+10:30', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:time', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('10:10:10+10:30', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), ValueType.XSDATE),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('2000-10-10+10:30', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:gYearMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10+10:30'), ValueType.XSGYEARMONTH),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('2000-10+10:30', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:gYear', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('2000+10:30', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:gMonthDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10-10+10:30'), ValueType.XSGMONTHDAY),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('--10-10+10:30', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:gDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('---10+10:30', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:gMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('--10+10:30', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSUNTYPEDATOMIC),
				createAtomicValue('true', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:base64Binary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:hexBinary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:anyURI', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', ValueType.XSANYURI),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('string', ValueType.XSUNTYPEDATOMIC)
			));
		it('from xs:NOTATION', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', ValueType.XSNOTATION),
					ValueType.XSUNTYPEDATOMIC
				),
				createAtomicValue('string', ValueType.XSUNTYPEDATOMIC)
			));
	});

	describe('to xs:string', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSSTRING
				),
				createAtomicValue('string', ValueType.XSSTRING)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('string', ValueType.XSSTRING), ValueType.XSSTRING),
				createAtomicValue('string', ValueType.XSSTRING)
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, ValueType.XSFLOAT), ValueType.XSSTRING),
				createAtomicValue('10.123', ValueType.XSSTRING)
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, ValueType.XSDOUBLE), ValueType.XSSTRING),
				createAtomicValue('10.123', ValueType.XSSTRING)
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, ValueType.XSDECIMAL), ValueType.XSSTRING),
				createAtomicValue('1010', ValueType.XSSTRING)
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, ValueType.XSINTEGER), ValueType.XSSTRING),
				createAtomicValue('1010', ValueType.XSSTRING)
			));
		it('from xs:duration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						Duration.fromString('P10Y10M10DT10H10M10S'),
						ValueType.XSDURATION
					),
					ValueType.XSSTRING
				),
				createAtomicValue('P10Y10M10DT10H10M10S', ValueType.XSSTRING)
			));
		it('from xs:yearMonthDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						Duration.fromString('P10Y10M'),
						ValueType.XSYEARMONTHDURATION
					),
					ValueType.XSSTRING
				),
				createAtomicValue('P10Y10M', ValueType.XSSTRING)
			));
		it('from xs:dayTimeDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						Duration.fromString('P10DT10H10M10S'),
						ValueType.XSDAYTIMEDURATION
					),
					ValueType.XSSTRING
				),
				createAtomicValue('P10DT10H10M10S', ValueType.XSSTRING)
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						DateTime.fromString('2000-10-10T10:10:10+10:30'),
						ValueType.XSDATETIME
					),
					ValueType.XSSTRING
				),
				createAtomicValue('2000-10-10T10:10:10+10:30', ValueType.XSSTRING)
			));
		it('from xs:time', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
					ValueType.XSSTRING
				),
				createAtomicValue('10:10:10+10:30', ValueType.XSSTRING)
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), ValueType.XSDATE),
					ValueType.XSSTRING
				),
				createAtomicValue('2000-10-10+10:30', ValueType.XSSTRING)
			));
		it('from xs:gYearMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10+10:30'), ValueType.XSGYEARMONTH),
					ValueType.XSSTRING
				),
				createAtomicValue('2000-10+10:30', ValueType.XSSTRING)
			));
		it('from xs:gYear', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
					ValueType.XSSTRING
				),
				createAtomicValue('2000+10:30', ValueType.XSSTRING)
			));
		it('from xs:gMonthDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10-10+10:30'), ValueType.XSGMONTHDAY),
					ValueType.XSSTRING
				),
				createAtomicValue('--10-10+10:30', ValueType.XSSTRING)
			));
		it('from xs:gDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
					ValueType.XSSTRING
				),
				createAtomicValue('---10+10:30', ValueType.XSSTRING)
			));
		it('from xs:gMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
					ValueType.XSSTRING
				),
				createAtomicValue('--10+10:30', ValueType.XSSTRING)
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSSTRING),
				createAtomicValue('true', ValueType.XSSTRING)
			));
		it('from xs:base64Binary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
					ValueType.XSSTRING
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSSTRING)
			));
		it('from xs:hexBinary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
					ValueType.XSSTRING
				),
				createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSSTRING)
			));
		it('from xs:anyURI', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('string', ValueType.XSANYURI), ValueType.XSSTRING),
				createAtomicValue('string', ValueType.XSSTRING)
			));
		it('from xs:NOTATION', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('string', ValueType.XSNOTATION), ValueType.XSSTRING),
				createAtomicValue('string', ValueType.XSSTRING)
			));
	});

	describe('to xs:float', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10.10', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSFLOAT
				),
				createAtomicValue(10.1, ValueType.XSFLOAT)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', ValueType.XSSTRING), ValueType.XSFLOAT),
				createAtomicValue(10.1, ValueType.XSFLOAT)
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, ValueType.XSFLOAT), ValueType.XSFLOAT),
				createAtomicValue(10.123, ValueType.XSFLOAT)
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, ValueType.XSDOUBLE), ValueType.XSFLOAT),
				createAtomicValue(10.123, ValueType.XSFLOAT)
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, ValueType.XSDECIMAL), ValueType.XSFLOAT),
				createAtomicValue(1010, ValueType.XSFLOAT)
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, ValueType.XSINTEGER), ValueType.XSFLOAT),
				createAtomicValue(1010, ValueType.XSFLOAT)
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), ValueType.XSDURATION),
						ValueType.XSFLOAT
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSFLOAT
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSFLOAT
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10T10:10:10+10:30'),
							ValueType.XSDATETIME
						),
						ValueType.XSFLOAT
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSFLOAT
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10+10:30'),
							ValueType.XSDATE
						),
						ValueType.XSFLOAT
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSFLOAT
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSFLOAT
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSFLOAT
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSFLOAT
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSFLOAT
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSFLOAT),
				createAtomicValue(1, ValueType.XSFLOAT)
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSFLOAT
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSFLOAT
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', ValueType.XSANYURI), ValueType.XSFLOAT),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSFLOAT
					),
				'XPTY0004'
			));
	});

	describe('to xs:double', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10.10', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSDOUBLE
				),
				createAtomicValue(10.1, ValueType.XSDOUBLE)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', ValueType.XSSTRING), ValueType.XSDOUBLE),
				createAtomicValue(10.1, ValueType.XSDOUBLE)
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, ValueType.XSFLOAT), ValueType.XSDOUBLE),
				createAtomicValue(10.123, ValueType.XSDOUBLE)
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, ValueType.XSDOUBLE), ValueType.XSDOUBLE),
				createAtomicValue(10.123, ValueType.XSDOUBLE)
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, ValueType.XSDECIMAL), ValueType.XSDOUBLE),
				createAtomicValue(1010, ValueType.XSDOUBLE)
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, ValueType.XSINTEGER), ValueType.XSDOUBLE),
				createAtomicValue(1010, ValueType.XSDOUBLE)
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), ValueType.XSDURATION),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10T10:10:10+10:30'),
							ValueType.XSDATETIME
						),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10+10:30'),
							ValueType.XSDATE
						),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSDOUBLE),
				createAtomicValue(1, ValueType.XSDOUBLE)
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', ValueType.XSANYURI), ValueType.XSDOUBLE),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
	});

	describe('to xs:double', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10.10', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSDOUBLE
				),
				createAtomicValue(10.1, ValueType.XSDOUBLE)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', ValueType.XSSTRING), ValueType.XSDOUBLE),
				createAtomicValue(10.1, ValueType.XSDOUBLE)
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, ValueType.XSFLOAT), ValueType.XSDOUBLE),
				createAtomicValue(10.123, ValueType.XSDOUBLE)
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, ValueType.XSDOUBLE), ValueType.XSDOUBLE),
				createAtomicValue(10.123, ValueType.XSDOUBLE)
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, ValueType.XSDECIMAL), ValueType.XSDOUBLE),
				createAtomicValue(1010, ValueType.XSDOUBLE)
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, ValueType.XSINTEGER), ValueType.XSDOUBLE),
				createAtomicValue(1010, ValueType.XSDOUBLE)
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), ValueType.XSDURATION),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10T10:10:10+10:30'),
							ValueType.XSDATETIME
						),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10+10:30'),
							ValueType.XSDATE
						),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSDOUBLE),
				createAtomicValue(1, ValueType.XSDOUBLE)
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', ValueType.XSANYURI), ValueType.XSDOUBLE),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSDOUBLE
					),
				'XPTY0004'
			));
	});

	describe('to xs:decimal', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10.10', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSDECIMAL
				),
				createAtomicValue(10.1, ValueType.XSDECIMAL)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', ValueType.XSSTRING), ValueType.XSDECIMAL),
				createAtomicValue(10.1, ValueType.XSDECIMAL)
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, ValueType.XSFLOAT), ValueType.XSDECIMAL),
				createAtomicValue(10.123, ValueType.XSDECIMAL)
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, ValueType.XSDOUBLE), ValueType.XSDECIMAL),
				createAtomicValue(10.123, ValueType.XSDECIMAL)
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, ValueType.XSDECIMAL), ValueType.XSDECIMAL),
				createAtomicValue(1010, ValueType.XSDECIMAL)
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, ValueType.XSINTEGER), ValueType.XSDECIMAL),
				createAtomicValue(1010, ValueType.XSDECIMAL)
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), ValueType.XSDURATION),
						ValueType.XSDECIMAL
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSDECIMAL
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSDECIMAL
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10T10:10:10+10:30'),
							ValueType.XSDATETIME
						),
						ValueType.XSDECIMAL
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSDECIMAL
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10+10:30'),
							ValueType.XSDATE
						),
						ValueType.XSDECIMAL
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSDECIMAL
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSDECIMAL
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSDECIMAL
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSDECIMAL
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSDECIMAL
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSDECIMAL),
				createAtomicValue(1, ValueType.XSDECIMAL)
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSDECIMAL
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSDECIMAL
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSANYURI),
						ValueType.XSDECIMAL
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSDECIMAL
					),
				'XPTY0004'
			));
	});

	describe('to xs:integer', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10', ValueType.XSUNTYPEDATOMIC), ValueType.XSINTEGER),
				createAtomicValue(10, ValueType.XSINTEGER)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10', ValueType.XSSTRING), ValueType.XSINTEGER),
				createAtomicValue(10, ValueType.XSINTEGER)
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, ValueType.XSFLOAT), ValueType.XSINTEGER),
				createAtomicValue(10, ValueType.XSINTEGER)
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, ValueType.XSDOUBLE), ValueType.XSINTEGER),
				createAtomicValue(10, ValueType.XSINTEGER)
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, ValueType.XSDECIMAL), ValueType.XSINTEGER),
				createAtomicValue(1010, ValueType.XSINTEGER)
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, ValueType.XSINTEGER), ValueType.XSINTEGER),
				createAtomicValue(1010, ValueType.XSINTEGER)
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), ValueType.XSDURATION),
						ValueType.XSINTEGER
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSINTEGER
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSINTEGER
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10T10:10:10+10:30'),
							ValueType.XSDATETIME
						),
						ValueType.XSINTEGER
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSINTEGER
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10+10:30'),
							ValueType.XSDATE
						),
						ValueType.XSINTEGER
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSINTEGER
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSINTEGER
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSINTEGER
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSINTEGER
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSINTEGER
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSINTEGER),
				createAtomicValue(1, ValueType.XSINTEGER)
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSINTEGER
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSINTEGER
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSANYURI),
						ValueType.XSINTEGER
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSINTEGER
					),
				'XPTY0004'
			));
	});

	describe('to xs:duration', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('P10Y10M10DT10H10M10S', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSDURATION
				),
				createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), ValueType.XSDURATION)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('P10Y10M10DT10H10M10S', ValueType.XSSTRING),
					ValueType.XSDURATION
				),
				createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), ValueType.XSDURATION)
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, ValueType.XSFLOAT), ValueType.XSDURATION),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, ValueType.XSDOUBLE), ValueType.XSDURATION),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, ValueType.XSDECIMAL), ValueType.XSDURATION),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, ValueType.XSINTEGER), ValueType.XSDURATION),
				'XPTY0004'
			));
		it('from xs:duration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						Duration.fromString('P10Y10M10DT10H10M10S'),
						ValueType.XSDURATION
					),
					ValueType.XSDURATION
				),
				createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), ValueType.XSDURATION)
			));
		it('from xs:yearMonthDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						YearMonthDuration.fromString('P10Y10M'),
						ValueType.XSYEARMONTHDURATION
					),
					ValueType.XSDURATION
				),
				createAtomicValue(Duration.fromString('P10Y10M'), ValueType.XSDURATION)
			));
		it('from xs:dayTimeDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						DayTimeDuration.fromString('P10D'),
						ValueType.XSDAYTIMEDURATION
					),
					ValueType.XSDURATION
				),
				createAtomicValue(Duration.fromString('P10D'), ValueType.XSDURATION)
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10T10:10:10+10:30'),
							ValueType.XSDATETIME
						),
						ValueType.XSDURATION
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSDURATION
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10+10:30'),
							ValueType.XSDATE
						),
						ValueType.XSDURATION
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSDURATION
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSDURATION
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSDURATION
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSDURATION
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSDURATION
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSDURATION),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSDURATION
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSDURATION
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSANYURI),
						ValueType.XSDURATION
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSDURATION
					),
				'XPTY0004'
			));
	});

	describe('to xs:yearMonthDuration', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('P10Y10M', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSYEARMONTHDURATION
				),
				createAtomicValue(
					YearMonthDuration.fromString('P10Y10M'),
					ValueType.XSYEARMONTHDURATION
				)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('P10Y10M', ValueType.XSSTRING),
					ValueType.XSYEARMONTHDURATION
				),
				createAtomicValue(
					YearMonthDuration.fromString('P10Y10M'),
					ValueType.XSYEARMONTHDURATION
				)
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, ValueType.XSFLOAT),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, ValueType.XSDOUBLE),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, ValueType.XSDECIMAL),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, ValueType.XSINTEGER),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
		it('from xs:duration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						Duration.fromString('P10Y10M10DT10H10M10S'),
						ValueType.XSDURATION
					),
					ValueType.XSYEARMONTHDURATION
				),
				createAtomicValue(
					YearMonthDuration.fromString('P10Y10M'),
					ValueType.XSYEARMONTHDURATION
				)
			));
		it('from xs:yearMonthDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						YearMonthDuration.fromString('P10Y10M'),
						ValueType.XSYEARMONTHDURATION
					),
					ValueType.XSYEARMONTHDURATION
				),
				createAtomicValue(
					YearMonthDuration.fromString('P10Y10M'),
					ValueType.XSYEARMONTHDURATION
				)
			));
		it('from xs:dayTimeDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						DayTimeDuration.fromString('P10Y10M'),
						ValueType.XSDAYTIMEDURATION
					),
					ValueType.XSYEARMONTHDURATION
				),
				createAtomicValue(
					YearMonthDuration.fromString('P0M'),
					ValueType.XSYEARMONTHDURATION
				)
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10T10:10:10+10:30'),
							ValueType.XSDATETIME
						),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10+10:30'),
							ValueType.XSDATE
						),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, ValueType.XSBOOLEAN),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSANYURI),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSYEARMONTHDURATION
					),
				'XPTY0004'
			));
	});

	describe('to xs:dayTimeDuration', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('P10DT10H10M10S', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSDAYTIMEDURATION
				),
				createAtomicValue(
					DayTimeDuration.fromString('P10DT10H10M10S'),
					ValueType.XSDAYTIMEDURATION
				)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('P10DT10H10M10S', ValueType.XSSTRING),
					ValueType.XSDAYTIMEDURATION
				),
				createAtomicValue(
					DayTimeDuration.fromString('P10DT10H10M10S'),
					ValueType.XSDAYTIMEDURATION
				)
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, ValueType.XSFLOAT),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, ValueType.XSDOUBLE),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, ValueType.XSDECIMAL),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, ValueType.XSINTEGER),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
		it('from xs:duration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						Duration.fromString('P10Y10M10DT10H10M10S'),
						ValueType.XSDURATION
					),
					ValueType.XSDAYTIMEDURATION
				),
				createAtomicValue(
					DayTimeDuration.fromString('P10DT10H10M10S'),
					ValueType.XSDAYTIMEDURATION
				)
			));
		it('from xs:yearMonthDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						YearMonthDuration.fromString('P10Y10M'),
						ValueType.XSYEARMONTHDURATION
					),
					ValueType.XSDAYTIMEDURATION
				),
				createAtomicValue(DayTimeDuration.fromString('PT0S'), ValueType.XSDAYTIMEDURATION)
			));
		it('from xs:dayTimeDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						DayTimeDuration.fromString('P10DT10H10M10S'),
						ValueType.XSDAYTIMEDURATION
					),
					ValueType.XSDAYTIMEDURATION
				),
				createAtomicValue(
					DayTimeDuration.fromString('P10DT10H10M10S'),
					ValueType.XSDAYTIMEDURATION
				)
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10T10:10:10+10:30'),
							ValueType.XSDATETIME
						),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10+10:30'),
							ValueType.XSDATE
						),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, ValueType.XSBOOLEAN),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSANYURI),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSDAYTIMEDURATION
					),
				'XPTY0004'
			));
	});

	describe('to xs:dateTime', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000-10-10T10:10:10+10:30', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSDATETIME
				),
				createAtomicValue(
					DateTime.fromString('2000-10-10T10:10:10+10:30'),
					ValueType.XSDATETIME
				)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000-10-10T10:10:10+10:30', ValueType.XSSTRING),
					ValueType.XSDATETIME
				),
				createAtomicValue(
					DateTime.fromString('2000-10-10T10:10:10+10:30'),
					ValueType.XSDATETIME
				)
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, ValueType.XSFLOAT), ValueType.XSDATETIME),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, ValueType.XSDOUBLE), ValueType.XSDATETIME),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, ValueType.XSDECIMAL), ValueType.XSDATETIME),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, ValueType.XSINTEGER), ValueType.XSDATETIME),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M10DT10H10M10S'),
							ValueType.XSDURATION
						),
						ValueType.XSDATETIME
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSDATETIME
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSDATETIME
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						DateTime.fromString('2000-10-10T10:10:10+10:30'),
						ValueType.XSDATETIME
					),
					ValueType.XSDATETIME
				),
				createAtomicValue(
					DateTime.fromString('2000-10-10T10:10:10+10:30'),
					ValueType.XSDATETIME
				)
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSDATETIME
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), ValueType.XSDATE),
					ValueType.XSDATETIME
				),
				createAtomicValue(
					DateTime.fromString('2000-10-10T00:00:00+10:30'),
					ValueType.XSDATETIME
				)
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSDATETIME
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSDATETIME
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSDATETIME
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSDATETIME
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSDATETIME
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSDATETIME),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSDATETIME
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSDATETIME
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSANYURI),
						ValueType.XSDATETIME
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSDATETIME
					),
				'XPTY0004'
			));
	});

	describe('to xs:time', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10:10:10+10:30', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSTIME
				),
				createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10:10:10+10:30', ValueType.XSSTRING),
					ValueType.XSTIME
				),
				createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME)
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(10.123, ValueType.XSFLOAT), ValueType.XSTIME),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(10.123, ValueType.XSDOUBLE), ValueType.XSTIME),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1010, ValueType.XSDECIMAL), ValueType.XSTIME),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1010, ValueType.XSINTEGER), ValueType.XSTIME),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M10DT10H10M10S'),
							ValueType.XSDURATION
						),
						ValueType.XSTIME
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSTIME
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSTIME
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						DateTime.fromString('2000-10-10T10:10:10+10:30'),
						ValueType.XSDATETIME
					),
					ValueType.XSTIME
				),
				createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME)
			));
		it('from xs:time', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
					ValueType.XSTIME
				),
				createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME)
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10+10:30'),
							ValueType.XSDATE
						),
						ValueType.XSTIME
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSTIME
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSTIME
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSTIME
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSTIME
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSTIME
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSTIME),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSTIME
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSTIME
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue('string', ValueType.XSANYURI), ValueType.XSTIME),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', ValueType.XSNOTATION), ValueType.XSTIME),
				'XPTY0004'
			));
	});

	describe('to xs:date', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000-10-10+10:30', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSDATE
				),
				createAtomicValue(DateTime.fromString('2000-10-10+10:30'), ValueType.XSDATE)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000-10-10+10:30', ValueType.XSSTRING),
					ValueType.XSDATE
				),
				createAtomicValue(DateTime.fromString('2000-10-10+10:30'), ValueType.XSDATE)
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(10.123, ValueType.XSFLOAT), ValueType.XSDATE),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(10.123, ValueType.XSDOUBLE), ValueType.XSDATE),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1010, ValueType.XSDECIMAL), ValueType.XSDATE),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1010, ValueType.XSINTEGER), ValueType.XSDATE),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M10DT10H10M10S'),
							ValueType.XSDURATION
						),
						ValueType.XSDATE
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSDATE
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSDATE
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						DateTime.fromString('2000-10-10T10:10:10+10:30'),
						ValueType.XSDATETIME
					),
					ValueType.XSDATE
				),
				createAtomicValue(DateTime.fromString('2000-10-10+10:30'), ValueType.XSDATE)
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSDATE
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), ValueType.XSDATE),
					ValueType.XSDATE
				),
				createAtomicValue(DateTime.fromString('2000-10-10+10:30'), ValueType.XSDATE)
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSDATE
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSDATE
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSDATE
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSDATE
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSDATE
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSDATE),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSDATE
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSDATE
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue('string', ValueType.XSANYURI), ValueType.XSDATE),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', ValueType.XSNOTATION), ValueType.XSDATE),
				'XPTY0004'
			));
	});

	describe('to xs:gYearMonth', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000-10+10:30', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSGYEARMONTH
				),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), ValueType.XSGYEARMONTH)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000-10+10:30', ValueType.XSSTRING),
					ValueType.XSGYEARMONTH
				),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), ValueType.XSGYEARMONTH)
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, ValueType.XSFLOAT),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, ValueType.XSDOUBLE),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, ValueType.XSDECIMAL),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, ValueType.XSINTEGER),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M10DT10H10M10S'),
							ValueType.XSDURATION
						),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						DateTime.fromString('2000-10-10T10:10:10+10:30'),
						ValueType.XSDATETIME
					),
					ValueType.XSGYEARMONTH
				),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), ValueType.XSGYEARMONTH)
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), ValueType.XSDATE),
					ValueType.XSGYEARMONTH
				),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), ValueType.XSGYEARMONTH)
			));
		it('from xs:gYearMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10+10:30'), ValueType.XSGYEARMONTH),
					ValueType.XSGYEARMONTH
				),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), ValueType.XSGYEARMONTH)
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, ValueType.XSBOOLEAN),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSANYURI),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSGYEARMONTH
					),
				'XPTY0004'
			));
	});

	describe('to xs:gYear', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000+10:30', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSGYEAR
				),
				createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('2000+10:30', ValueType.XSSTRING), ValueType.XSGYEAR),
				createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR)
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(10.123, ValueType.XSFLOAT), ValueType.XSGYEAR),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(10.123, ValueType.XSDOUBLE), ValueType.XSGYEAR),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1010, ValueType.XSDECIMAL), ValueType.XSGYEAR),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1010, ValueType.XSINTEGER), ValueType.XSGYEAR),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M10DT10H10M10S'),
							ValueType.XSDURATION
						),
						ValueType.XSGYEAR
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSGYEAR
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSGYEAR
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						DateTime.fromString('2000-10-10T10:10:10+10:30'),
						ValueType.XSDATETIME
					),
					ValueType.XSGYEAR
				),
				createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR)
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSGYEAR
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), ValueType.XSDATE),
					ValueType.XSGYEAR
				),
				createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR)
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSGYEAR
					),
				'XPTY0004'
			));
		it('from xs:gYear', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
					ValueType.XSGYEAR
				),
				createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR)
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSGYEAR
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSGYEAR
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSGYEAR
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSGYEAR),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSGYEAR
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSGYEAR
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', ValueType.XSANYURI), ValueType.XSGYEAR),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSGYEAR
					),
				'XPTY0004'
			));
	});

	describe('to xs:gMonthDay', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('--10-10+10:30', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSGMONTHDAY
				),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), ValueType.XSGMONTHDAY)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('--10-10+10:30', ValueType.XSSTRING),
					ValueType.XSGMONTHDAY
				),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), ValueType.XSGMONTHDAY)
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, ValueType.XSFLOAT), ValueType.XSGMONTHDAY),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, ValueType.XSDOUBLE),
						ValueType.XSGMONTHDAY
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, ValueType.XSDECIMAL), ValueType.XSGMONTHDAY),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, ValueType.XSINTEGER), ValueType.XSGMONTHDAY),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M10DT10H10M10S'),
							ValueType.XSDURATION
						),
						ValueType.XSGMONTHDAY
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSGMONTHDAY
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSGMONTHDAY
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						DateTime.fromString('2000-10-10T10:10:10+10:30'),
						ValueType.XSDATETIME
					),
					ValueType.XSGMONTHDAY
				),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), ValueType.XSGMONTHDAY)
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSGMONTHDAY
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), ValueType.XSDATE),
					ValueType.XSGMONTHDAY
				),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), ValueType.XSGMONTHDAY)
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSGMONTHDAY
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSGMONTHDAY
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10-10+10:30'), ValueType.XSGMONTHDAY),
					ValueType.XSGMONTHDAY
				),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), ValueType.XSGMONTHDAY)
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSGMONTHDAY
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSGMONTHDAY
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSGMONTHDAY),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSGMONTHDAY
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSGMONTHDAY
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSANYURI),
						ValueType.XSGMONTHDAY
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSGMONTHDAY
					),
				'XPTY0004'
			));
	});

	describe('to xs:gDay', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('---10+10:30', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSGDAY
				),
				createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('---10+10:30', ValueType.XSSTRING), ValueType.XSGDAY),
				createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY)
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(10.123, ValueType.XSFLOAT), ValueType.XSGDAY),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(10.123, ValueType.XSDOUBLE), ValueType.XSGDAY),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1010, ValueType.XSDECIMAL), ValueType.XSGDAY),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1010, ValueType.XSINTEGER), ValueType.XSGDAY),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M10DT10H10M10S'),
							ValueType.XSDURATION
						),
						ValueType.XSGDAY
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSGDAY
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSGDAY
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						DateTime.fromString('2000-10-10T10:10:10+10:30'),
						ValueType.XSDATETIME
					),
					ValueType.XSGDAY
				),
				createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY)
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSGDAY
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), ValueType.XSDATE),
					ValueType.XSGDAY
				),
				createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY)
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSGDAY
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSGDAY
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSGDAY
					),
				'XPTY0004'
			));
		it('from xs:gDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
					ValueType.XSGDAY
				),
				createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY)
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSGDAY
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSGDAY),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSGDAY
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSGDAY
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue('string', ValueType.XSANYURI), ValueType.XSGDAY),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', ValueType.XSNOTATION), ValueType.XSGDAY),
				'XPTY0004'
			));
	});

	describe('to xs:gMonth', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('--10+10:30', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSGMONTH
				),
				createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('--10+10:30', ValueType.XSSTRING), ValueType.XSGMONTH),
				createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH)
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(10.123, ValueType.XSFLOAT), ValueType.XSGMONTH),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(10.123, ValueType.XSDOUBLE), ValueType.XSGMONTH),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1010, ValueType.XSDECIMAL), ValueType.XSGMONTH),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1010, ValueType.XSINTEGER), ValueType.XSGMONTH),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M10DT10H10M10S'),
							ValueType.XSDURATION
						),
						ValueType.XSGMONTH
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSGMONTH
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSGMONTH
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						DateTime.fromString('2000-10-10T10:10:10+10:30'),
						ValueType.XSDATETIME
					),
					ValueType.XSGMONTH
				),
				createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH)
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSGMONTH
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), ValueType.XSDATE),
					ValueType.XSGMONTH
				),
				createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH)
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSGMONTH
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSGMONTH
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSGMONTH
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSGMONTH
					),
				'XPTY0004'
			));
		it('from xs:gMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
					ValueType.XSGMONTH
				),
				createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH)
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSGMONTH),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSGMONTH
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSGMONTH
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', ValueType.XSANYURI), ValueType.XSGMONTH),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSGMONTH
					),
				'XPTY0004'
			));
	});

	describe('to xs:boolean', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('true', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSBOOLEAN
				),
				createAtomicValue(true, ValueType.XSBOOLEAN)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('true', ValueType.XSSTRING), ValueType.XSBOOLEAN),
				createAtomicValue(true, ValueType.XSBOOLEAN)
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1, ValueType.XSFLOAT), ValueType.XSBOOLEAN),
				createAtomicValue(true, ValueType.XSBOOLEAN)
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1, ValueType.XSDOUBLE), ValueType.XSBOOLEAN),
				createAtomicValue(true, ValueType.XSBOOLEAN)
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1, ValueType.XSDECIMAL), ValueType.XSBOOLEAN),
				createAtomicValue(true, ValueType.XSBOOLEAN)
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1, ValueType.XSINTEGER), ValueType.XSBOOLEAN),
				createAtomicValue(true, ValueType.XSBOOLEAN)
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M10DT10H10M10S'),
							ValueType.XSDURATION
						),
						ValueType.XSBOOLEAN
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSBOOLEAN
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSBOOLEAN
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10T10:10:10+10:30'),
							ValueType.XSDATETIME
						),
						ValueType.XSBOOLEAN
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSBOOLEAN
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10+10:30'),
							ValueType.XSDATE
						),
						ValueType.XSBOOLEAN
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSBOOLEAN
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSBOOLEAN
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSBOOLEAN
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSBOOLEAN
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSBOOLEAN
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSBOOLEAN),
				createAtomicValue(true, ValueType.XSBOOLEAN)
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSBOOLEAN
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', ValueType.XSHEXBINARY),
						ValueType.XSBOOLEAN
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSANYURI),
						ValueType.XSBOOLEAN
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSBOOLEAN
					),
				'XPTY0004'
			));
	});

	describe('to xs:base64Binary', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSBASE64BINARY
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSSTRING),
					ValueType.XSBASE64BINARY
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY)
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1, ValueType.XSFLOAT), ValueType.XSBASE64BINARY),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, ValueType.XSDOUBLE), ValueType.XSBASE64BINARY),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, ValueType.XSDECIMAL), ValueType.XSBASE64BINARY),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, ValueType.XSINTEGER), ValueType.XSBASE64BINARY),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M10DT10H10M10S'),
							ValueType.XSDURATION
						),
						ValueType.XSBASE64BINARY
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSBASE64BINARY
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSBASE64BINARY
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10T10:10:10+10:30'),
							ValueType.XSDATETIME
						),
						ValueType.XSBASE64BINARY
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSBASE64BINARY
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10+10:30'),
							ValueType.XSDATE
						),
						ValueType.XSBASE64BINARY
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSBASE64BINARY
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSBASE64BINARY
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSBASE64BINARY
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSBASE64BINARY
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSBASE64BINARY
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, ValueType.XSBOOLEAN),
						ValueType.XSBASE64BINARY
					),
				'XPTY0004'
			));
		it('from xs:base64Binary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
					ValueType.XSBASE64BINARY
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY)
			));
		it('from xs:hexBinary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('736F6D65206261736536342074657874', ValueType.XSHEXBINARY),
					ValueType.XSBASE64BINARY
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY)
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSANYURI),
						ValueType.XSBASE64BINARY
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSBASE64BINARY
					),
				'XPTY0004'
			));
	});

	describe('to xs:hexBinary', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(
						'736F6D65206261736536342074657874',
						ValueType.XSUNTYPEDATOMIC
					),
					ValueType.XSHEXBINARY
				),
				createAtomicValue('736F6D65206261736536342074657874', ValueType.XSHEXBINARY)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('736F6D65206261736536342074657874', ValueType.XSSTRING),
					ValueType.XSHEXBINARY
				),
				createAtomicValue('736F6D65206261736536342074657874', ValueType.XSHEXBINARY)
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1, ValueType.XSFLOAT), ValueType.XSHEXBINARY),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1, ValueType.XSDOUBLE), ValueType.XSHEXBINARY),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1, ValueType.XSDECIMAL), ValueType.XSHEXBINARY),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1, ValueType.XSINTEGER), ValueType.XSHEXBINARY),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M10DT10H10M10S'),
							ValueType.XSDURATION
						),
						ValueType.XSHEXBINARY
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSHEXBINARY
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSHEXBINARY
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10T10:10:10+10:30'),
							ValueType.XSDATETIME
						),
						ValueType.XSHEXBINARY
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSHEXBINARY
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10+10:30'),
							ValueType.XSDATE
						),
						ValueType.XSHEXBINARY
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSHEXBINARY
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSHEXBINARY
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSHEXBINARY
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSHEXBINARY
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSHEXBINARY
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSHEXBINARY),
				'XPTY0004'
			));
		it('from xs:base64Binary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
					ValueType.XSHEXBINARY
				),
				createAtomicValue('736F6D65206261736536342074657874', ValueType.XSHEXBINARY)
			));
		it('from xs:hexBinary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('736F6D65206261736536342074657874', ValueType.XSHEXBINARY),
					ValueType.XSHEXBINARY
				),
				createAtomicValue('736F6D65206261736536342074657874', ValueType.XSHEXBINARY)
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSANYURI),
						ValueType.XSHEXBINARY
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSHEXBINARY
					),
				'XPTY0004'
			));
	});

	describe('to xs:anyURI', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', ValueType.XSUNTYPEDATOMIC),
					ValueType.XSANYURI
				),
				createAtomicValue('string', ValueType.XSANYURI)
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('string', ValueType.XSSTRING), ValueType.XSANYURI),
				createAtomicValue('string', ValueType.XSANYURI)
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1, ValueType.XSFLOAT), ValueType.XSANYURI),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1, ValueType.XSDOUBLE), ValueType.XSANYURI),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1, ValueType.XSDECIMAL), ValueType.XSANYURI),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1, ValueType.XSINTEGER), ValueType.XSANYURI),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M10DT10H10M10S'),
							ValueType.XSDURATION
						),
						ValueType.XSANYURI
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSANYURI
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSANYURI
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10T10:10:10+10:30'),
							ValueType.XSDATETIME
						),
						ValueType.XSANYURI
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSANYURI
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10+10:30'),
							ValueType.XSDATE
						),
						ValueType.XSANYURI
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSANYURI
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSANYURI
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSANYURI
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSANYURI
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSANYURI
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSANYURI),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSANYURI
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							'736F6D65206261736536342074657874',
							ValueType.XSHEXBINARY
						),
						ValueType.XSANYURI
					),
				'XPTY0004'
			));
		it('from xs:anyURI', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('string', ValueType.XSANYURI), ValueType.XSANYURI),
				createAtomicValue('string', ValueType.XSANYURI)
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSANYURI
					),
				'XPTY0004'
			));
	});

	describe('to xs:NOTATION', () => {
		it('from xs:untypedAtomic (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSUNTYPEDATOMIC),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
		it('from xs:string (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSSTRING),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
		it('from xs:float (throws XPST0080)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1, ValueType.XSFLOAT), ValueType.XSNOTATION),
				'XPST0080'
			));
		it('from xs:double (throws XPST0080)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1, ValueType.XSDOUBLE), ValueType.XSNOTATION),
				'XPST0080'
			));
		it('from xs:decimal (throws XPST0080)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1, ValueType.XSDECIMAL), ValueType.XSNOTATION),
				'XPST0080'
			));
		it('from xs:integer (throws XPST0080)', () =>
			chai.assert.throws(
				() => castToType(createAtomicValue(1, ValueType.XSINTEGER), ValueType.XSNOTATION),
				'XPST0080'
			));
		it('from xs:duration (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M10DT10H10M10S'),
							ValueType.XSDURATION
						),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
		it('from xs:yearMonthDuration (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSYEARMONTHDURATION
						),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
		it('from xs:dayTimeDuration (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							Duration.fromString('P10Y10M'),
							ValueType.XSDAYTIMEDURATION
						),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
		it('from xs:dateTime (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10T10:10:10+10:30'),
							ValueType.XSDATETIME
						),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
		it('from xs:time (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), ValueType.XSTIME),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
		it('from xs:date (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10-10+10:30'),
							ValueType.XSDATE
						),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
		it('from xs:gYearMonth (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('2000-10+10:30'),
							ValueType.XSGYEARMONTH
						),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
		it('from xs:gYear (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), ValueType.XSGYEAR),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
		it('from xs:gMonthDay (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(
							DateTime.fromString('--10-10+10:30'),
							ValueType.XSGMONTHDAY
						),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
		it('from xs:gDay (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), ValueType.XSGDAY),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
		it('from xs:gMonth (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), ValueType.XSGMONTH),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
		it('from xs:boolean (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, ValueType.XSBOOLEAN), ValueType.XSNOTATION),
				'XPST0080'
			));
		it('from xs:base64Binary (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', ValueType.XSBASE64BINARY),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
		it('from xs:NOTATION (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('736F6D65206261736536342074657874', ValueType.XSNOTATION),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
		it('from xs:anyURI (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSANYURI),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
		it('from xs:NOTATION', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', ValueType.XSNOTATION),
						ValueType.XSNOTATION
					),
				'XPST0080'
			));
	});
});

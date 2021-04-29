import * as chai from 'chai';
import castToType from 'fontoxpath/expressions/dataTypes/castToType';
import createAtomicValue from 'fontoxpath/expressions/dataTypes/createAtomicValue';
import { BaseType } from 'fontoxpath/expressions/dataTypes/Value';

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
				castToType(createAtomicValue('string', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSANYSIMPLETYPE,
				})
			);
		});
		it('throws when casting from xs:anySimpleType', () => {
			chai.assert.throw(() =>
				castToType(createAtomicValue('string', { kind: BaseType.XSANYSIMPLETYPE }), {
					kind: BaseType.XSSTRING,
				})
			);
		});
	});

	describe('casting to or from xs:anyAtomicType', () => {
		it('throws when casting to xs:anyAtomicType', () => {
			chai.assert.throw(() =>
				castToType(createAtomicValue('string', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSANYATOMICTYPE,
				})
			);
		});
		it('throws when casting to xs:anyAtomicTpe', () => {
			chai.assert.throw(() =>
				castToType(createAtomicValue('string', { kind: BaseType.XSANYATOMICTYPE }), {
					kind: BaseType.XSSTRING,
				})
			);
		});
	});

	describe('to xs:untypedAtomic', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('string', { kind: BaseType.XSUNTYPEDATOMIC }), {
					kind: BaseType.XSUNTYPEDATOMIC,
				}),
				createAtomicValue('string', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('string', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSUNTYPEDATOMIC,
				}),
				createAtomicValue('string', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
					kind: BaseType.XSUNTYPEDATOMIC,
				}),
				createAtomicValue('10.123', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
					kind: BaseType.XSUNTYPEDATOMIC,
				}),
				createAtomicValue('10.123', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
					kind: BaseType.XSUNTYPEDATOMIC,
				}),
				createAtomicValue('1010', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
					kind: BaseType.XSUNTYPEDATOMIC,
				}),
				createAtomicValue('1010', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:duration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
						kind: BaseType.XSDURATION,
					}),
					{ kind: BaseType.XSUNTYPEDATOMIC }
				),
				createAtomicValue('P10Y10M10DT10H10M10S', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:yearMonthDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10Y10M'), {
						kind: BaseType.XSYEARMONTHDURATION,
					}),
					{ kind: BaseType.XSUNTYPEDATOMIC }
				),
				createAtomicValue('P10Y10M', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:dayTimeDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10DT10H10M10S'), {
						kind: BaseType.XSDAYTIMEDURATION,
					}),
					{ kind: BaseType.XSUNTYPEDATOMIC }
				),
				createAtomicValue('P10DT10H10M10S', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
					}),
					{ kind: BaseType.XSUNTYPEDATOMIC }
				),
				createAtomicValue('2000-10-10T10:10:10+10:30', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:time', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
						kind: BaseType.XSTIME,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
					}
				),
				createAtomicValue('10:10:10+10:30', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
					}
				),
				createAtomicValue('2000-10-10+10:30', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:gYearMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10+10:30'), {
						kind: BaseType.XSGYEARMONTH,
					}),
					{ kind: BaseType.XSUNTYPEDATOMIC }
				),
				createAtomicValue('2000-10+10:30', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:gYear', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000+10:30'), {
						kind: BaseType.XSGYEAR,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
					}
				),
				createAtomicValue('2000+10:30', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:gMonthDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10-10+10:30'), {
						kind: BaseType.XSGMONTHDAY,
					}),
					{ kind: BaseType.XSUNTYPEDATOMIC }
				),
				createAtomicValue('--10-10+10:30', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:gDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('---10+10:30'), {
						kind: BaseType.XSGDAY,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
					}
				),
				createAtomicValue('---10+10:30', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:gMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10+10:30'), {
						kind: BaseType.XSGMONTH,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
					}
				),
				createAtomicValue('--10+10:30', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
					kind: BaseType.XSUNTYPEDATOMIC,
				}),
				createAtomicValue('true', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:base64Binary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
						kind: BaseType.XSBASE64BINARY,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
					}
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:hexBinary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('21FE3A44123C21FE3A44123C', { kind: BaseType.XSHEXBINARY }),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
					}
				),
				createAtomicValue('21FE3A44123C21FE3A44123C', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:anyURI', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
					kind: BaseType.XSUNTYPEDATOMIC,
				}),
				createAtomicValue('string', { kind: BaseType.XSUNTYPEDATOMIC })
			));
		it('from xs:NOTATION', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
					kind: BaseType.XSUNTYPEDATOMIC,
				}),
				createAtomicValue('string', { kind: BaseType.XSUNTYPEDATOMIC })
			));
	});

	describe('to xs:string', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('string', { kind: BaseType.XSUNTYPEDATOMIC }), {
					kind: BaseType.XSSTRING,
				}),
				createAtomicValue('string', { kind: BaseType.XSSTRING })
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('string', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSSTRING,
				}),
				createAtomicValue('string', { kind: BaseType.XSSTRING })
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
					kind: BaseType.XSSTRING,
				}),
				createAtomicValue('10.123', { kind: BaseType.XSSTRING })
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
					kind: BaseType.XSSTRING,
				}),
				createAtomicValue('10.123', { kind: BaseType.XSSTRING })
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
					kind: BaseType.XSSTRING,
				}),
				createAtomicValue('1010', { kind: BaseType.XSSTRING })
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
					kind: BaseType.XSSTRING,
				}),
				createAtomicValue('1010', { kind: BaseType.XSSTRING })
			));
		it('from xs:duration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
						kind: BaseType.XSDURATION,
					}),
					{ kind: BaseType.XSSTRING }
				),
				createAtomicValue('P10Y10M10DT10H10M10S', { kind: BaseType.XSSTRING })
			));
		it('from xs:yearMonthDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10Y10M'), {
						kind: BaseType.XSYEARMONTHDURATION,
					}),
					{ kind: BaseType.XSSTRING }
				),
				createAtomicValue('P10Y10M', { kind: BaseType.XSSTRING })
			));
		it('from xs:dayTimeDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10DT10H10M10S'), {
						kind: BaseType.XSDAYTIMEDURATION,
					}),
					{ kind: BaseType.XSSTRING }
				),
				createAtomicValue('P10DT10H10M10S', { kind: BaseType.XSSTRING })
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
					}),
					{ kind: BaseType.XSSTRING }
				),
				createAtomicValue('2000-10-10T10:10:10+10:30', { kind: BaseType.XSSTRING })
			));
		it('from xs:time', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
						kind: BaseType.XSTIME,
					}),
					{
						kind: BaseType.XSSTRING,
					}
				),
				createAtomicValue('10:10:10+10:30', { kind: BaseType.XSSTRING })
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
					}),
					{
						kind: BaseType.XSSTRING,
					}
				),
				createAtomicValue('2000-10-10+10:30', { kind: BaseType.XSSTRING })
			));
		it('from xs:gYearMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10+10:30'), {
						kind: BaseType.XSGYEARMONTH,
					}),
					{ kind: BaseType.XSSTRING }
				),
				createAtomicValue('2000-10+10:30', { kind: BaseType.XSSTRING })
			));
		it('from xs:gYear', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000+10:30'), {
						kind: BaseType.XSGYEAR,
					}),
					{
						kind: BaseType.XSSTRING,
					}
				),
				createAtomicValue('2000+10:30', { kind: BaseType.XSSTRING })
			));
		it('from xs:gMonthDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10-10+10:30'), {
						kind: BaseType.XSGMONTHDAY,
					}),
					{ kind: BaseType.XSSTRING }
				),
				createAtomicValue('--10-10+10:30', { kind: BaseType.XSSTRING })
			));
		it('from xs:gDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('---10+10:30'), {
						kind: BaseType.XSGDAY,
					}),
					{
						kind: BaseType.XSSTRING,
					}
				),
				createAtomicValue('---10+10:30', { kind: BaseType.XSSTRING })
			));
		it('from xs:gMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10+10:30'), {
						kind: BaseType.XSGMONTH,
					}),
					{
						kind: BaseType.XSSTRING,
					}
				),
				createAtomicValue('--10+10:30', { kind: BaseType.XSSTRING })
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
					kind: BaseType.XSSTRING,
				}),
				createAtomicValue('true', { kind: BaseType.XSSTRING })
			));
		it('from xs:base64Binary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
						kind: BaseType.XSBASE64BINARY,
					}),
					{
						kind: BaseType.XSSTRING,
					}
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', { kind: BaseType.XSSTRING })
			));
		it('from xs:hexBinary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('21FE3A44123C21FE3A44123C', { kind: BaseType.XSHEXBINARY }),
					{
						kind: BaseType.XSSTRING,
					}
				),
				createAtomicValue('21FE3A44123C21FE3A44123C', { kind: BaseType.XSSTRING })
			));
		it('from xs:anyURI', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
					kind: BaseType.XSSTRING,
				}),
				createAtomicValue('string', { kind: BaseType.XSSTRING })
			));
		it('from xs:NOTATION', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
					kind: BaseType.XSSTRING,
				}),
				createAtomicValue('string', { kind: BaseType.XSSTRING })
			));
	});

	describe('to xs:float', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', { kind: BaseType.XSUNTYPEDATOMIC }), {
					kind: BaseType.XSFLOAT,
				}),
				createAtomicValue(10.1, { kind: BaseType.XSFLOAT })
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSFLOAT,
				}),
				createAtomicValue(10.1, { kind: BaseType.XSFLOAT })
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
					kind: BaseType.XSFLOAT,
				}),
				createAtomicValue(10.123, { kind: BaseType.XSFLOAT })
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
					kind: BaseType.XSFLOAT,
				}),
				createAtomicValue(10.123, { kind: BaseType.XSFLOAT })
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
					kind: BaseType.XSFLOAT,
				}),
				createAtomicValue(1010, { kind: BaseType.XSFLOAT })
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
					kind: BaseType.XSFLOAT,
				}),
				createAtomicValue(1010, { kind: BaseType.XSFLOAT })
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDURATION,
						}),
						{
							kind: BaseType.XSFLOAT,
						}
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSFLOAT }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSFLOAT }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
						}),
						{ kind: BaseType.XSFLOAT }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSFLOAT }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
						}),
						{ kind: BaseType.XSFLOAT }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSFLOAT }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{
							kind: BaseType.XSFLOAT,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSFLOAT }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{
							kind: BaseType.XSFLOAT,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{
							kind: BaseType.XSFLOAT,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
					kind: BaseType.XSFLOAT,
				}),
				createAtomicValue(1, { kind: BaseType.XSFLOAT })
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{
							kind: BaseType.XSFLOAT,
						}
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSFLOAT,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSFLOAT,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSFLOAT,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:double', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', { kind: BaseType.XSUNTYPEDATOMIC }), {
					kind: BaseType.XSDOUBLE,
				}),
				createAtomicValue(10.1, { kind: BaseType.XSDOUBLE })
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSDOUBLE,
				}),
				createAtomicValue(10.1, { kind: BaseType.XSDOUBLE })
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
					kind: BaseType.XSDOUBLE,
				}),
				createAtomicValue(10.123, { kind: BaseType.XSDOUBLE })
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
					kind: BaseType.XSDOUBLE,
				}),
				createAtomicValue(10.123, { kind: BaseType.XSDOUBLE })
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
					kind: BaseType.XSDOUBLE,
				}),
				createAtomicValue(1010, { kind: BaseType.XSDOUBLE })
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
					kind: BaseType.XSDOUBLE,
				}),
				createAtomicValue(1010, { kind: BaseType.XSDOUBLE })
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSDOUBLE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSDOUBLE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSDOUBLE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
						}),
						{ kind: BaseType.XSDOUBLE }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSDOUBLE }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
						}),
						{ kind: BaseType.XSDOUBLE }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSDOUBLE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{
							kind: BaseType.XSDOUBLE,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSDOUBLE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{
							kind: BaseType.XSDOUBLE,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{
							kind: BaseType.XSDOUBLE,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
					kind: BaseType.XSDOUBLE,
				}),
				createAtomicValue(1, { kind: BaseType.XSDOUBLE })
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{
							kind: BaseType.XSDOUBLE,
						}
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSDOUBLE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSDOUBLE,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSDOUBLE,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:double', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', { kind: BaseType.XSUNTYPEDATOMIC }), {
					kind: BaseType.XSDOUBLE,
				}),
				createAtomicValue(10.1, { kind: BaseType.XSDOUBLE })
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSDOUBLE,
				}),
				createAtomicValue(10.1, { kind: BaseType.XSDOUBLE })
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
					kind: BaseType.XSDOUBLE,
				}),
				createAtomicValue(10.123, { kind: BaseType.XSDOUBLE })
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
					kind: BaseType.XSDOUBLE,
				}),
				createAtomicValue(10.123, { kind: BaseType.XSDOUBLE })
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
					kind: BaseType.XSDOUBLE,
				}),
				createAtomicValue(1010, { kind: BaseType.XSDOUBLE })
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
					kind: BaseType.XSDOUBLE,
				}),
				createAtomicValue(1010, { kind: BaseType.XSDOUBLE })
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSDOUBLE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSDOUBLE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSDOUBLE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
						}),
						{ kind: BaseType.XSDOUBLE }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSDOUBLE }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
						}),
						{ kind: BaseType.XSDOUBLE }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSDOUBLE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{
							kind: BaseType.XSDOUBLE,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSDOUBLE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{
							kind: BaseType.XSDOUBLE,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{
							kind: BaseType.XSDOUBLE,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
					kind: BaseType.XSDOUBLE,
				}),
				createAtomicValue(1, { kind: BaseType.XSDOUBLE })
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{
							kind: BaseType.XSDOUBLE,
						}
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSDOUBLE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSDOUBLE,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSDOUBLE,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:decimal', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', { kind: BaseType.XSUNTYPEDATOMIC }), {
					kind: BaseType.XSDECIMAL,
				}),
				createAtomicValue(10.1, { kind: BaseType.XSDECIMAL })
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10.10', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSDECIMAL,
				}),
				createAtomicValue(10.1, { kind: BaseType.XSDECIMAL })
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
					kind: BaseType.XSDECIMAL,
				}),
				createAtomicValue(10.123, { kind: BaseType.XSDECIMAL })
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
					kind: BaseType.XSDECIMAL,
				}),
				createAtomicValue(10.123, { kind: BaseType.XSDECIMAL })
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
					kind: BaseType.XSDECIMAL,
				}),
				createAtomicValue(1010, { kind: BaseType.XSDECIMAL })
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
					kind: BaseType.XSDECIMAL,
				}),
				createAtomicValue(1010, { kind: BaseType.XSDECIMAL })
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSDECIMAL }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSDECIMAL }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSDECIMAL }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
						}),
						{ kind: BaseType.XSDECIMAL }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSDECIMAL }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
						}),
						{ kind: BaseType.XSDECIMAL }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSDECIMAL }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{
							kind: BaseType.XSDECIMAL,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSDECIMAL }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{
							kind: BaseType.XSDECIMAL,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{
							kind: BaseType.XSDECIMAL,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
					kind: BaseType.XSDECIMAL,
				}),
				createAtomicValue(1, { kind: BaseType.XSDECIMAL })
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{
							kind: BaseType.XSDECIMAL,
						}
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSDECIMAL,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSDECIMAL,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSDECIMAL,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:integer', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10', { kind: BaseType.XSUNTYPEDATOMIC }), {
					kind: BaseType.XSINTEGER,
				}),
				createAtomicValue(10, { kind: BaseType.XSINTEGER })
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSINTEGER,
				}),
				createAtomicValue(10, { kind: BaseType.XSINTEGER })
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
					kind: BaseType.XSINTEGER,
				}),
				createAtomicValue(10, { kind: BaseType.XSINTEGER })
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
					kind: BaseType.XSINTEGER,
				}),
				createAtomicValue(10, { kind: BaseType.XSINTEGER })
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
					kind: BaseType.XSINTEGER,
				}),
				createAtomicValue(1010, { kind: BaseType.XSINTEGER })
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
					kind: BaseType.XSINTEGER,
				}),
				createAtomicValue(1010, { kind: BaseType.XSINTEGER })
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSINTEGER }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSINTEGER }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSINTEGER }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
						}),
						{ kind: BaseType.XSINTEGER }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSINTEGER }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
						}),
						{ kind: BaseType.XSINTEGER }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSINTEGER }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{
							kind: BaseType.XSINTEGER,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSINTEGER }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{
							kind: BaseType.XSINTEGER,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{
							kind: BaseType.XSINTEGER,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
					kind: BaseType.XSINTEGER,
				}),
				createAtomicValue(1, { kind: BaseType.XSINTEGER })
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{
							kind: BaseType.XSINTEGER,
						}
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSINTEGER,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSINTEGER,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSINTEGER,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:duration', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('P10Y10M10DT10H10M10S', { kind: BaseType.XSUNTYPEDATOMIC }),
					{ kind: BaseType.XSDURATION }
				),
				createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
					kind: BaseType.XSDURATION,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('P10Y10M10DT10H10M10S', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSDURATION,
				}),
				createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
					kind: BaseType.XSDURATION,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
						kind: BaseType.XSDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
						kind: BaseType.XSDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
						kind: BaseType.XSDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
						kind: BaseType.XSDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:duration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
						kind: BaseType.XSDURATION,
					}),
					{ kind: BaseType.XSDURATION }
				),
				createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
					kind: BaseType.XSDURATION,
				})
			));
		it('from xs:yearMonthDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(YearMonthDuration.fromString('P10Y10M'), {
						kind: BaseType.XSYEARMONTHDURATION,
					}),
					{ kind: BaseType.XSDURATION }
				),
				createAtomicValue(Duration.fromString('P10Y10M'), { kind: BaseType.XSDURATION })
			));
		it('from xs:dayTimeDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DayTimeDuration.fromString('P10D'), {
						kind: BaseType.XSDAYTIMEDURATION,
					}),
					{ kind: BaseType.XSDURATION }
				),
				createAtomicValue(Duration.fromString('P10D'), { kind: BaseType.XSDURATION })
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
						}),
						{ kind: BaseType.XSDURATION }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSDURATION }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
						}),
						{ kind: BaseType.XSDURATION }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSDURATION }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{
							kind: BaseType.XSDURATION,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSDURATION }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{
							kind: BaseType.XSDURATION,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{
							kind: BaseType.XSDURATION,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
						kind: BaseType.XSDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{
							kind: BaseType.XSDURATION,
						}
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSDURATION,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSDURATION,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:yearMonthDuration', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('P10Y10M', { kind: BaseType.XSUNTYPEDATOMIC }), {
					kind: BaseType.XSYEARMONTHDURATION,
				}),
				createAtomicValue(YearMonthDuration.fromString('P10Y10M'), {
					kind: BaseType.XSYEARMONTHDURATION,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('P10Y10M', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSYEARMONTHDURATION,
				}),
				createAtomicValue(YearMonthDuration.fromString('P10Y10M'), {
					kind: BaseType.XSYEARMONTHDURATION,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
						kind: BaseType.XSYEARMONTHDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
						kind: BaseType.XSYEARMONTHDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
						kind: BaseType.XSYEARMONTHDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
						kind: BaseType.XSYEARMONTHDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:duration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
						kind: BaseType.XSDURATION,
					}),
					{ kind: BaseType.XSYEARMONTHDURATION }
				),
				createAtomicValue(YearMonthDuration.fromString('P10Y10M'), {
					kind: BaseType.XSYEARMONTHDURATION,
				})
			));
		it('from xs:yearMonthDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(YearMonthDuration.fromString('P10Y10M'), {
						kind: BaseType.XSYEARMONTHDURATION,
					}),
					{ kind: BaseType.XSYEARMONTHDURATION }
				),
				createAtomicValue(YearMonthDuration.fromString('P10Y10M'), {
					kind: BaseType.XSYEARMONTHDURATION,
				})
			));
		it('from xs:dayTimeDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DayTimeDuration.fromString('P10Y10M'), {
						kind: BaseType.XSDAYTIMEDURATION,
					}),
					{ kind: BaseType.XSYEARMONTHDURATION }
				),
				createAtomicValue(YearMonthDuration.fromString('P0M'), {
					kind: BaseType.XSYEARMONTHDURATION,
				})
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
						}),
						{ kind: BaseType.XSYEARMONTHDURATION }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSYEARMONTHDURATION }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
						}),
						{ kind: BaseType.XSYEARMONTHDURATION }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSYEARMONTHDURATION }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSYEARMONTHDURATION }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
						kind: BaseType.XSYEARMONTHDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
						}
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSYEARMONTHDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSYEARMONTHDURATION,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:dayTimeDuration', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('P10DT10H10M10S', { kind: BaseType.XSUNTYPEDATOMIC }),
					{ kind: BaseType.XSDAYTIMEDURATION }
				),
				createAtomicValue(DayTimeDuration.fromString('P10DT10H10M10S'), {
					kind: BaseType.XSDAYTIMEDURATION,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('P10DT10H10M10S', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSDAYTIMEDURATION,
				}),
				createAtomicValue(DayTimeDuration.fromString('P10DT10H10M10S'), {
					kind: BaseType.XSDAYTIMEDURATION,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
						kind: BaseType.XSDAYTIMEDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
						kind: BaseType.XSDAYTIMEDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
						kind: BaseType.XSDAYTIMEDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
						kind: BaseType.XSDAYTIMEDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:duration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
						kind: BaseType.XSDURATION,
					}),
					{ kind: BaseType.XSDAYTIMEDURATION }
				),
				createAtomicValue(DayTimeDuration.fromString('P10DT10H10M10S'), {
					kind: BaseType.XSDAYTIMEDURATION,
				})
			));
		it('from xs:yearMonthDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(YearMonthDuration.fromString('P10Y10M'), {
						kind: BaseType.XSYEARMONTHDURATION,
					}),
					{ kind: BaseType.XSDAYTIMEDURATION }
				),
				createAtomicValue(DayTimeDuration.fromString('PT0S'), {
					kind: BaseType.XSDAYTIMEDURATION,
				})
			));
		it('from xs:dayTimeDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DayTimeDuration.fromString('P10DT10H10M10S'), {
						kind: BaseType.XSDAYTIMEDURATION,
					}),
					{ kind: BaseType.XSDAYTIMEDURATION }
				),
				createAtomicValue(DayTimeDuration.fromString('P10DT10H10M10S'), {
					kind: BaseType.XSDAYTIMEDURATION,
				})
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
						}),
						{ kind: BaseType.XSDAYTIMEDURATION }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSDAYTIMEDURATION }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
						}),
						{ kind: BaseType.XSDAYTIMEDURATION }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSDAYTIMEDURATION }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSDAYTIMEDURATION }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
						kind: BaseType.XSDAYTIMEDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
						}
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSDAYTIMEDURATION,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSDAYTIMEDURATION,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:dateTime', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000-10-10T10:10:10+10:30', {
						kind: BaseType.XSUNTYPEDATOMIC,
					}),
					{ kind: BaseType.XSDATETIME }
				),
				createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
					kind: BaseType.XSDATETIME,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000-10-10T10:10:10+10:30', { kind: BaseType.XSSTRING }),
					{ kind: BaseType.XSDATETIME }
				),
				createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
					kind: BaseType.XSDATETIME,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
						kind: BaseType.XSDATETIME,
					}),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
						kind: BaseType.XSDATETIME,
					}),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
						kind: BaseType.XSDATETIME,
					}),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
						kind: BaseType.XSDATETIME,
					}),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSDATETIME }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSDATETIME }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSDATETIME }
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
					}),
					{ kind: BaseType.XSDATETIME }
				),
				createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
					kind: BaseType.XSDATETIME,
				})
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSDATETIME }
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
					}),
					{ kind: BaseType.XSDATETIME }
				),
				createAtomicValue(DateTime.fromString('2000-10-10T00:00:00+10:30'), {
					kind: BaseType.XSDATETIME,
				})
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSDATETIME }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{ kind: BaseType.XSDATETIME }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSDATETIME }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{ kind: BaseType.XSDATETIME }
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{ kind: BaseType.XSDATETIME }
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
						kind: BaseType.XSDATETIME,
					}),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{ kind: BaseType.XSDATETIME }
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSDATETIME,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSDATETIME,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSDATETIME,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:time', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10:10:10+10:30', { kind: BaseType.XSUNTYPEDATOMIC }),
					{ kind: BaseType.XSTIME }
				),
				createAtomicValue(DateTime.fromString('10:10:10+10:30'), { kind: BaseType.XSTIME })
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('10:10:10+10:30', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSTIME,
				}),
				createAtomicValue(DateTime.fromString('10:10:10+10:30'), { kind: BaseType.XSTIME })
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
						kind: BaseType.XSTIME,
					}),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
						kind: BaseType.XSTIME,
					}),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
						kind: BaseType.XSTIME,
					}),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
						kind: BaseType.XSTIME,
					}),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSTIME }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSTIME }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSTIME }
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
					}),
					{ kind: BaseType.XSTIME }
				),
				createAtomicValue(DateTime.fromString('10:10:10+10:30'), { kind: BaseType.XSTIME })
			));
		it('from xs:time', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
						kind: BaseType.XSTIME,
					}),
					{ kind: BaseType.XSTIME }
				),
				createAtomicValue(DateTime.fromString('10:10:10+10:30'), { kind: BaseType.XSTIME })
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
						}),
						{ kind: BaseType.XSTIME }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSTIME }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{ kind: BaseType.XSTIME }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSTIME }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{
							kind: BaseType.XSTIME,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{
							kind: BaseType.XSTIME,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
						kind: BaseType.XSTIME,
					}),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{
							kind: BaseType.XSTIME,
						}
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSTIME,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSTIME,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSTIME,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:date', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000-10-10+10:30', { kind: BaseType.XSUNTYPEDATOMIC }),
					{ kind: BaseType.XSDATE }
				),
				createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
					kind: BaseType.XSDATE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('2000-10-10+10:30', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSDATE,
				}),
				createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
					kind: BaseType.XSDATE,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
						kind: BaseType.XSDATE,
					}),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
						kind: BaseType.XSDATE,
					}),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
						kind: BaseType.XSDATE,
					}),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
						kind: BaseType.XSDATE,
					}),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSDATE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSDATE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSDATE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
					}),
					{ kind: BaseType.XSDATE }
				),
				createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
					kind: BaseType.XSDATE,
				})
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSDATE }
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
					}),
					{ kind: BaseType.XSDATE }
				),
				createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
					kind: BaseType.XSDATE,
				})
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSDATE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{ kind: BaseType.XSDATE }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSDATE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{
							kind: BaseType.XSDATE,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{
							kind: BaseType.XSDATE,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
						kind: BaseType.XSDATE,
					}),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{
							kind: BaseType.XSDATE,
						}
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSDATE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSDATE,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSDATE,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:gYearMonth', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('2000-10+10:30', { kind: BaseType.XSUNTYPEDATOMIC }), {
					kind: BaseType.XSGYEARMONTH,
				}),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), {
					kind: BaseType.XSGYEARMONTH,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('2000-10+10:30', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSGYEARMONTH,
				}),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), {
					kind: BaseType.XSGYEARMONTH,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
						kind: BaseType.XSGYEARMONTH,
					}),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
						kind: BaseType.XSGYEARMONTH,
					}),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
						kind: BaseType.XSGYEARMONTH,
					}),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
						kind: BaseType.XSGYEARMONTH,
					}),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSGYEARMONTH }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSGYEARMONTH }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSGYEARMONTH }
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
					}),
					{ kind: BaseType.XSGYEARMONTH }
				),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), {
					kind: BaseType.XSGYEARMONTH,
				})
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSGYEARMONTH }
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
					}),
					{ kind: BaseType.XSGYEARMONTH }
				),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), {
					kind: BaseType.XSGYEARMONTH,
				})
			));
		it('from xs:gYearMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10+10:30'), {
						kind: BaseType.XSGYEARMONTH,
					}),
					{ kind: BaseType.XSGYEARMONTH }
				),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), {
					kind: BaseType.XSGYEARMONTH,
				})
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{ kind: BaseType.XSGYEARMONTH }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSGYEARMONTH }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{
							kind: BaseType.XSGYEARMONTH,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{
							kind: BaseType.XSGYEARMONTH,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
						kind: BaseType.XSGYEARMONTH,
					}),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{
							kind: BaseType.XSGYEARMONTH,
						}
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSGYEARMONTH,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSGYEARMONTH,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSGYEARMONTH,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:gYear', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('2000+10:30', { kind: BaseType.XSUNTYPEDATOMIC }), {
					kind: BaseType.XSGYEAR,
				}),
				createAtomicValue(DateTime.fromString('2000+10:30'), { kind: BaseType.XSGYEAR })
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('2000+10:30', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSGYEAR,
				}),
				createAtomicValue(DateTime.fromString('2000+10:30'), { kind: BaseType.XSGYEAR })
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
						kind: BaseType.XSGYEAR,
					}),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
						kind: BaseType.XSGYEAR,
					}),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
						kind: BaseType.XSGYEAR,
					}),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
						kind: BaseType.XSGYEAR,
					}),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSGYEAR }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSGYEAR }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSGYEAR }
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
					}),
					{ kind: BaseType.XSGYEAR }
				),
				createAtomicValue(DateTime.fromString('2000+10:30'), { kind: BaseType.XSGYEAR })
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSGYEAR }
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
					}),
					{ kind: BaseType.XSGYEAR }
				),
				createAtomicValue(DateTime.fromString('2000+10:30'), { kind: BaseType.XSGYEAR })
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSGYEAR }
					),
				'XPTY0004'
			));
		it('from xs:gYear', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000+10:30'), {
						kind: BaseType.XSGYEAR,
					}),
					{ kind: BaseType.XSGYEAR }
				),
				createAtomicValue(DateTime.fromString('2000+10:30'), { kind: BaseType.XSGYEAR })
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSGYEAR }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{
							kind: BaseType.XSGYEAR,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{
							kind: BaseType.XSGYEAR,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
						kind: BaseType.XSGYEAR,
					}),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{
							kind: BaseType.XSGYEAR,
						}
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSGYEAR,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSGYEAR,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSGYEAR,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:gMonthDay', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('--10-10+10:30', { kind: BaseType.XSUNTYPEDATOMIC }), {
					kind: BaseType.XSGMONTHDAY,
				}),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), {
					kind: BaseType.XSGMONTHDAY,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('--10-10+10:30', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSGMONTHDAY,
				}),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), {
					kind: BaseType.XSGMONTHDAY,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
						kind: BaseType.XSGMONTHDAY,
					}),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
						kind: BaseType.XSGMONTHDAY,
					}),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
						kind: BaseType.XSGMONTHDAY,
					}),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
						kind: BaseType.XSGMONTHDAY,
					}),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSGMONTHDAY }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSGMONTHDAY }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSGMONTHDAY }
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
					}),
					{ kind: BaseType.XSGMONTHDAY }
				),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), {
					kind: BaseType.XSGMONTHDAY,
				})
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSGMONTHDAY }
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
					}),
					{ kind: BaseType.XSGMONTHDAY }
				),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), {
					kind: BaseType.XSGMONTHDAY,
				})
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSGMONTHDAY }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{ kind: BaseType.XSGMONTHDAY }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10-10+10:30'), {
						kind: BaseType.XSGMONTHDAY,
					}),
					{ kind: BaseType.XSGMONTHDAY }
				),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), {
					kind: BaseType.XSGMONTHDAY,
				})
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{
							kind: BaseType.XSGMONTHDAY,
						}
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{
							kind: BaseType.XSGMONTHDAY,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
						kind: BaseType.XSGMONTHDAY,
					}),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{
							kind: BaseType.XSGMONTHDAY,
						}
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSGMONTHDAY,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSGMONTHDAY,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSGMONTHDAY,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:gDay', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('---10+10:30', { kind: BaseType.XSUNTYPEDATOMIC }), {
					kind: BaseType.XSGDAY,
				}),
				createAtomicValue(DateTime.fromString('---10+10:30'), { kind: BaseType.XSGDAY })
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('---10+10:30', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSGDAY,
				}),
				createAtomicValue(DateTime.fromString('---10+10:30'), { kind: BaseType.XSGDAY })
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
						kind: BaseType.XSGDAY,
					}),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
						kind: BaseType.XSGDAY,
					}),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
						kind: BaseType.XSGDAY,
					}),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
						kind: BaseType.XSGDAY,
					}),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSGDAY }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSGDAY }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSGDAY }
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
					}),
					{ kind: BaseType.XSGDAY }
				),
				createAtomicValue(DateTime.fromString('---10+10:30'), { kind: BaseType.XSGDAY })
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSGDAY }
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
					}),
					{ kind: BaseType.XSGDAY }
				),
				createAtomicValue(DateTime.fromString('---10+10:30'), { kind: BaseType.XSGDAY })
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSGDAY }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{ kind: BaseType.XSGDAY }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSGDAY }
					),
				'XPTY0004'
			));
		it('from xs:gDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('---10+10:30'), {
						kind: BaseType.XSGDAY,
					}),
					{ kind: BaseType.XSGDAY }
				),
				createAtomicValue(DateTime.fromString('---10+10:30'), { kind: BaseType.XSGDAY })
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{ kind: BaseType.XSGDAY }
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
						kind: BaseType.XSGDAY,
					}),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{
							kind: BaseType.XSGDAY,
						}
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSGDAY,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSGDAY,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSGDAY,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:gMonth', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('--10+10:30', { kind: BaseType.XSUNTYPEDATOMIC }), {
					kind: BaseType.XSGMONTH,
				}),
				createAtomicValue(DateTime.fromString('--10+10:30'), { kind: BaseType.XSGMONTH })
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('--10+10:30', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSGMONTH,
				}),
				createAtomicValue(DateTime.fromString('--10+10:30'), { kind: BaseType.XSGMONTH })
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSFLOAT }), {
						kind: BaseType.XSGMONTH,
					}),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(10.123, { kind: BaseType.XSDOUBLE }), {
						kind: BaseType.XSGMONTH,
					}),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSDECIMAL }), {
						kind: BaseType.XSGMONTH,
					}),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1010, { kind: BaseType.XSINTEGER }), {
						kind: BaseType.XSGMONTH,
					}),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSGMONTH }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSGMONTH }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSGMONTH }
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
					}),
					{ kind: BaseType.XSGMONTH }
				),
				createAtomicValue(DateTime.fromString('--10+10:30'), { kind: BaseType.XSGMONTH })
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSGMONTH }
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
					}),
					{ kind: BaseType.XSGMONTH }
				),
				createAtomicValue(DateTime.fromString('--10+10:30'), { kind: BaseType.XSGMONTH })
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSGMONTH }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{ kind: BaseType.XSGMONTH }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSGMONTH }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{ kind: BaseType.XSGMONTH }
					),
				'XPTY0004'
			));
		it('from xs:gMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10+10:30'), {
						kind: BaseType.XSGMONTH,
					}),
					{ kind: BaseType.XSGMONTH }
				),
				createAtomicValue(DateTime.fromString('--10+10:30'), { kind: BaseType.XSGMONTH })
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
						kind: BaseType.XSGMONTH,
					}),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{
							kind: BaseType.XSGMONTH,
						}
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSGMONTH,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSGMONTH,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSGMONTH,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:boolean', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('true', { kind: BaseType.XSUNTYPEDATOMIC }), {
					kind: BaseType.XSBOOLEAN,
				}),
				createAtomicValue(true, { kind: BaseType.XSBOOLEAN })
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('true', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSBOOLEAN,
				}),
				createAtomicValue(true, { kind: BaseType.XSBOOLEAN })
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1, { kind: BaseType.XSFLOAT }), {
					kind: BaseType.XSBOOLEAN,
				}),
				createAtomicValue(true, { kind: BaseType.XSBOOLEAN })
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1, { kind: BaseType.XSDOUBLE }), {
					kind: BaseType.XSBOOLEAN,
				}),
				createAtomicValue(true, { kind: BaseType.XSBOOLEAN })
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1, { kind: BaseType.XSDECIMAL }), {
					kind: BaseType.XSBOOLEAN,
				}),
				createAtomicValue(true, { kind: BaseType.XSBOOLEAN })
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(1, { kind: BaseType.XSINTEGER }), {
					kind: BaseType.XSBOOLEAN,
				}),
				createAtomicValue(true, { kind: BaseType.XSBOOLEAN })
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSBOOLEAN }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSBOOLEAN }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSBOOLEAN }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
						}),
						{ kind: BaseType.XSBOOLEAN }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSBOOLEAN }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
						}),
						{ kind: BaseType.XSBOOLEAN }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSBOOLEAN }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{ kind: BaseType.XSBOOLEAN }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSBOOLEAN }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{ kind: BaseType.XSBOOLEAN }
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{ kind: BaseType.XSBOOLEAN }
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
					kind: BaseType.XSBOOLEAN,
				}),
				createAtomicValue(true, { kind: BaseType.XSBOOLEAN })
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{
							kind: BaseType.XSBOOLEAN,
						}
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
						}),
						{
							kind: BaseType.XSBOOLEAN,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSBOOLEAN,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSBOOLEAN,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:base64Binary', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
						kind: BaseType.XSUNTYPEDATOMIC,
					}),
					{ kind: BaseType.XSBASE64BINARY }
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', { kind: BaseType.XSBASE64BINARY })
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', { kind: BaseType.XSSTRING }),
					{ kind: BaseType.XSBASE64BINARY }
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', { kind: BaseType.XSBASE64BINARY })
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, { kind: BaseType.XSFLOAT }), {
						kind: BaseType.XSBASE64BINARY,
					}),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, { kind: BaseType.XSDOUBLE }), {
						kind: BaseType.XSBASE64BINARY,
					}),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, { kind: BaseType.XSDECIMAL }), {
						kind: BaseType.XSBASE64BINARY,
					}),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, { kind: BaseType.XSINTEGER }), {
						kind: BaseType.XSBASE64BINARY,
					}),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSBASE64BINARY }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSBASE64BINARY }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSBASE64BINARY }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
						}),
						{ kind: BaseType.XSBASE64BINARY }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSBASE64BINARY }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
						}),
						{ kind: BaseType.XSBASE64BINARY }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSBASE64BINARY }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{ kind: BaseType.XSBASE64BINARY }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSBASE64BINARY }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{ kind: BaseType.XSBASE64BINARY }
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{ kind: BaseType.XSBASE64BINARY }
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
						kind: BaseType.XSBASE64BINARY,
					}),
				'XPTY0004'
			));
		it('from xs:base64Binary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
						kind: BaseType.XSBASE64BINARY,
					}),
					{ kind: BaseType.XSBASE64BINARY }
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', { kind: BaseType.XSBASE64BINARY })
			));
		it('from xs:hexBinary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('736F6D65206261736536342074657874', {
						kind: BaseType.XSHEXBINARY,
					}),
					{
						kind: BaseType.XSBASE64BINARY,
					}
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', { kind: BaseType.XSBASE64BINARY })
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSBASE64BINARY,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSBASE64BINARY,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:hexBinary', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('736F6D65206261736536342074657874', {
						kind: BaseType.XSUNTYPEDATOMIC,
					}),
					{ kind: BaseType.XSHEXBINARY }
				),
				createAtomicValue('736F6D65206261736536342074657874', {
					kind: BaseType.XSHEXBINARY,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('736F6D65206261736536342074657874', {
						kind: BaseType.XSSTRING,
					}),
					{ kind: BaseType.XSHEXBINARY }
				),
				createAtomicValue('736F6D65206261736536342074657874', {
					kind: BaseType.XSHEXBINARY,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, { kind: BaseType.XSFLOAT }), {
						kind: BaseType.XSHEXBINARY,
					}),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, { kind: BaseType.XSDOUBLE }), {
						kind: BaseType.XSHEXBINARY,
					}),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, { kind: BaseType.XSDECIMAL }), {
						kind: BaseType.XSHEXBINARY,
					}),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, { kind: BaseType.XSINTEGER }), {
						kind: BaseType.XSHEXBINARY,
					}),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSHEXBINARY }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSHEXBINARY }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSHEXBINARY }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
						}),
						{ kind: BaseType.XSHEXBINARY }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSHEXBINARY }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
						}),
						{ kind: BaseType.XSHEXBINARY }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSHEXBINARY }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{ kind: BaseType.XSHEXBINARY }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSHEXBINARY }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{ kind: BaseType.XSHEXBINARY }
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{ kind: BaseType.XSHEXBINARY }
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
						kind: BaseType.XSHEXBINARY,
					}),
				'XPTY0004'
			));
		it('from xs:base64Binary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
						kind: BaseType.XSBASE64BINARY,
					}),
					{ kind: BaseType.XSHEXBINARY }
				),
				createAtomicValue('736F6D65206261736536342074657874', {
					kind: BaseType.XSHEXBINARY,
				})
			));
		it('from xs:hexBinary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('736F6D65206261736536342074657874', {
						kind: BaseType.XSHEXBINARY,
					}),
					{ kind: BaseType.XSHEXBINARY }
				),
				createAtomicValue('736F6D65206261736536342074657874', {
					kind: BaseType.XSHEXBINARY,
				})
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSHEXBINARY,
					}),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSHEXBINARY,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:anyURI', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('string', { kind: BaseType.XSUNTYPEDATOMIC }), {
					kind: BaseType.XSANYURI,
				}),
				createAtomicValue('string', { kind: BaseType.XSANYURI })
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('string', { kind: BaseType.XSSTRING }), {
					kind: BaseType.XSANYURI,
				}),
				createAtomicValue('string', { kind: BaseType.XSANYURI })
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, { kind: BaseType.XSFLOAT }), {
						kind: BaseType.XSANYURI,
					}),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, { kind: BaseType.XSDOUBLE }), {
						kind: BaseType.XSANYURI,
					}),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, { kind: BaseType.XSDECIMAL }), {
						kind: BaseType.XSANYURI,
					}),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, { kind: BaseType.XSINTEGER }), {
						kind: BaseType.XSANYURI,
					}),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSANYURI }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSANYURI }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSANYURI }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
						}),
						{ kind: BaseType.XSANYURI }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSANYURI }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
						}),
						{ kind: BaseType.XSANYURI }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSANYURI }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{ kind: BaseType.XSANYURI }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSANYURI }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{ kind: BaseType.XSANYURI }
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{ kind: BaseType.XSANYURI }
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
						kind: BaseType.XSANYURI,
					}),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{ kind: BaseType.XSANYURI }
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('736F6D65206261736536342074657874', {
							kind: BaseType.XSHEXBINARY,
						}),
						{ kind: BaseType.XSANYURI }
					),
				'XPTY0004'
			));
		it('from xs:anyURI', () =>
			chai.assert.deepEqual(
				castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
					kind: BaseType.XSANYURI,
				}),
				createAtomicValue('string', { kind: BaseType.XSANYURI })
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSANYURI,
					}),
				'XPTY0004'
			));
	});

	describe('to xs:NOTATION', () => {
		it('from xs:untypedAtomic (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSUNTYPEDATOMIC }), {
						kind: BaseType.XSNOTATION,
					}),
				'XPST0080'
			));
		it('from xs:string (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSSTRING }), {
						kind: BaseType.XSNOTATION,
					}),
				'XPST0080'
			));
		it('from xs:float (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, { kind: BaseType.XSFLOAT }), {
						kind: BaseType.XSNOTATION,
					}),
				'XPST0080'
			));
		it('from xs:double (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, { kind: BaseType.XSDOUBLE }), {
						kind: BaseType.XSNOTATION,
					}),
				'XPST0080'
			));
		it('from xs:decimal (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, { kind: BaseType.XSDECIMAL }), {
						kind: BaseType.XSNOTATION,
					}),
				'XPST0080'
			));
		it('from xs:integer (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(1, { kind: BaseType.XSINTEGER }), {
						kind: BaseType.XSNOTATION,
					}),
				'XPST0080'
			));
		it('from xs:duration (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
						}),
						{ kind: BaseType.XSNOTATION }
					),
				'XPST0080'
			));
		it('from xs:yearMonthDuration (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
						}),
						{ kind: BaseType.XSNOTATION }
					),
				'XPST0080'
			));
		it('from xs:dayTimeDuration (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
						}),
						{ kind: BaseType.XSNOTATION }
					),
				'XPST0080'
			));
		it('from xs:dateTime (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
						}),
						{ kind: BaseType.XSNOTATION }
					),
				'XPST0080'
			));
		it('from xs:time (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
						}),
						{ kind: BaseType.XSNOTATION }
					),
				'XPST0080'
			));
		it('from xs:date (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
						}),
						{ kind: BaseType.XSNOTATION }
					),
				'XPST0080'
			));
		it('from xs:gYearMonth (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
						}),
						{ kind: BaseType.XSNOTATION }
					),
				'XPST0080'
			));
		it('from xs:gYear (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
						}),
						{ kind: BaseType.XSNOTATION }
					),
				'XPST0080'
			));
		it('from xs:gMonthDay (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
						}),
						{ kind: BaseType.XSNOTATION }
					),
				'XPST0080'
			));
		it('from xs:gDay (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
						}),
						{ kind: BaseType.XSNOTATION }
					),
				'XPST0080'
			));
		it('from xs:gMonth (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
						}),
						{ kind: BaseType.XSNOTATION }
					),
				'XPST0080'
			));
		it('from xs:boolean (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue(true, { kind: BaseType.XSBOOLEAN }), {
						kind: BaseType.XSNOTATION,
					}),
				'XPST0080'
			));
		it('from xs:base64Binary (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
						}),
						{ kind: BaseType.XSNOTATION }
					),
				'XPST0080'
			));
		it('from xs:NOTATION (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('736F6D65206261736536342074657874', {
							kind: BaseType.XSNOTATION,
						}),
						{ kind: BaseType.XSNOTATION }
					),
				'XPST0080'
			));
		it('from xs:anyURI (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSANYURI }), {
						kind: BaseType.XSNOTATION,
					}),
				'XPST0080'
			));
		it('from xs:NOTATION', () =>
			chai.assert.throws(
				() =>
					castToType(createAtomicValue('string', { kind: BaseType.XSNOTATION }), {
						kind: BaseType.XSNOTATION,
					}),
				'XPST0080'
			));
	});
});

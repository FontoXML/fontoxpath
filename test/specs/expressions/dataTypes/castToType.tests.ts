import * as chai from 'chai';
import castToType from 'fontoxpath/expressions/dataTypes/castToType';
import createAtomicValue from 'fontoxpath/expressions/dataTypes/createAtomicValue';
import { BaseType, SequenceType } from 'fontoxpath/expressions/dataTypes/Value';

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
					createAtomicValue('string', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSANYSIMPLETYPE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				)
			);
		});
		it('throws when casting from xs:anySimpleType', () => {
			chai.assert.throw(() =>
				castToType(
					createAtomicValue('string', {
						kind: BaseType.XSANYSIMPLETYPE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				)
			);
		});
	});

	describe('casting to or from xs:anyAtomicType', () => {
		it('throws when casting to xs:anyAtomicType', () => {
			chai.assert.throw(() =>
				castToType(
					createAtomicValue('string', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSANYATOMICTYPE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				)
			);
		});
		it('throws when casting to xs:anyAtomicTpe', () => {
			chai.assert.throw(() =>
				castToType(
					createAtomicValue('string', {
						kind: BaseType.XSANYATOMICTYPE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				)
			);
		});
	});

	describe('to xs:untypedAtomic', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('string', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('string', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(10.123, {
						kind: BaseType.XSFLOAT,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('10.123', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(10.123, {
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('10.123', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1010, {
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('1010', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1010, {
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('1010', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:duration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
						kind: BaseType.XSDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('P10Y10M10DT10H10M10S', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:yearMonthDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10Y10M'), {
						kind: BaseType.XSYEARMONTHDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('P10Y10M', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:dayTimeDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10DT10H10M10S'), {
						kind: BaseType.XSDAYTIMEDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('P10DT10H10M10S', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('2000-10-10T10:10:10+10:30', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:time', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
						kind: BaseType.XSTIME,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('10:10:10+10:30', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('2000-10-10+10:30', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gYearMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10+10:30'), {
						kind: BaseType.XSGYEARMONTH,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('2000-10+10:30', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gYear', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000+10:30'), {
						kind: BaseType.XSGYEAR,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('2000+10:30', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gMonthDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10-10+10:30'), {
						kind: BaseType.XSGMONTHDAY,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('--10-10+10:30', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('---10+10:30'), {
						kind: BaseType.XSGDAY,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('---10+10:30', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10+10:30'), {
						kind: BaseType.XSGMONTH,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('--10+10:30', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(true, {
						kind: BaseType.XSBOOLEAN,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('true', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:base64Binary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
						kind: BaseType.XSBASE64BINARY,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:hexBinary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('21FE3A44123C21FE3A44123C', {
						kind: BaseType.XSHEXBINARY,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('21FE3A44123C21FE3A44123C', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:anyURI', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', {
						kind: BaseType.XSANYURI,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('string', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:NOTATION', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', {
						kind: BaseType.XSNOTATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('string', {
					kind: BaseType.XSUNTYPEDATOMIC,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
	});

	describe('to xs:string', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('string', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('string', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(10.123, {
						kind: BaseType.XSFLOAT,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('10.123', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(10.123, {
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('10.123', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1010, {
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('1010', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1010, {
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('1010', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:duration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
						kind: BaseType.XSDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('P10Y10M10DT10H10M10S', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:yearMonthDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10Y10M'), {
						kind: BaseType.XSYEARMONTHDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('P10Y10M', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:dayTimeDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10DT10H10M10S'), {
						kind: BaseType.XSDAYTIMEDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('P10DT10H10M10S', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('2000-10-10T10:10:10+10:30', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:time', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
						kind: BaseType.XSTIME,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('10:10:10+10:30', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('2000-10-10+10:30', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gYearMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10+10:30'), {
						kind: BaseType.XSGYEARMONTH,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('2000-10+10:30', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gYear', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000+10:30'), {
						kind: BaseType.XSGYEAR,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('2000+10:30', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gMonthDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10-10+10:30'), {
						kind: BaseType.XSGMONTHDAY,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('--10-10+10:30', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('---10+10:30'), {
						kind: BaseType.XSGDAY,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('---10+10:30', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10+10:30'), {
						kind: BaseType.XSGMONTH,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('--10+10:30', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(true, {
						kind: BaseType.XSBOOLEAN,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('true', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:base64Binary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
						kind: BaseType.XSBASE64BINARY,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:hexBinary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('21FE3A44123C21FE3A44123C', {
						kind: BaseType.XSHEXBINARY,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('21FE3A44123C21FE3A44123C', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:anyURI', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', {
						kind: BaseType.XSANYURI,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('string', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:NOTATION', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', {
						kind: BaseType.XSNOTATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('string', {
					kind: BaseType.XSSTRING,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
	});

	describe('to xs:float', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10.10', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSFLOAT,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10.1, {
					kind: BaseType.XSFLOAT,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10.10', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSFLOAT,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10.1, {
					kind: BaseType.XSFLOAT,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(10.123, {
						kind: BaseType.XSFLOAT,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSFLOAT,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10.123, {
					kind: BaseType.XSFLOAT,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(10.123, {
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSFLOAT,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10.123, {
					kind: BaseType.XSFLOAT,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1010, {
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSFLOAT,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(1010, {
					kind: BaseType.XSFLOAT,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1010, {
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSFLOAT,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(1010, {
					kind: BaseType.XSFLOAT,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(true, {
						kind: BaseType.XSBOOLEAN,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSFLOAT,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(1, { kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE })
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:double', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10.10', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10.1, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10.10', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10.1, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(10.123, {
						kind: BaseType.XSFLOAT,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10.123, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(10.123, {
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10.123, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1010, {
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(1010, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1010, {
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(1010, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(true, {
						kind: BaseType.XSBOOLEAN,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(1, { kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE })
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:double', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10.10', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10.1, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10.10', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10.1, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(10.123, {
						kind: BaseType.XSFLOAT,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10.123, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(10.123, {
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10.123, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1010, {
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(1010, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1010, {
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(1010, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(true, {
						kind: BaseType.XSBOOLEAN,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(1, { kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE })
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:decimal', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10.10', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10.1, {
					kind: BaseType.XSDECIMAL,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10.10', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10.1, {
					kind: BaseType.XSDECIMAL,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(10.123, {
						kind: BaseType.XSFLOAT,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10.123, {
					kind: BaseType.XSDECIMAL,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(10.123, {
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10.123, {
					kind: BaseType.XSDECIMAL,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1010, {
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(1010, {
					kind: BaseType.XSDECIMAL,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1010, {
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(1010, {
					kind: BaseType.XSDECIMAL,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDECIMAL, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDECIMAL, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDECIMAL, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDECIMAL, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDECIMAL, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDECIMAL, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDECIMAL, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDECIMAL, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(true, {
						kind: BaseType.XSBOOLEAN,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(1, {
					kind: BaseType.XSDECIMAL,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:integer', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10, {
					kind: BaseType.XSINTEGER,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10, {
					kind: BaseType.XSINTEGER,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(10.123, {
						kind: BaseType.XSFLOAT,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10, {
					kind: BaseType.XSINTEGER,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(10.123, {
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(10, {
					kind: BaseType.XSINTEGER,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1010, {
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(1010, {
					kind: BaseType.XSINTEGER,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1010, {
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(1010, {
					kind: BaseType.XSINTEGER,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(true, {
						kind: BaseType.XSBOOLEAN,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(1, {
					kind: BaseType.XSINTEGER,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:duration', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('P10Y10M10DT10H10M10S', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
					kind: BaseType.XSDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('P10Y10M10DT10H10M10S', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
					kind: BaseType.XSDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:duration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
						kind: BaseType.XSDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
					kind: BaseType.XSDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:yearMonthDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(YearMonthDuration.fromString('P10Y10M'), {
						kind: BaseType.XSYEARMONTHDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(Duration.fromString('P10Y10M'), {
					kind: BaseType.XSDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:dayTimeDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DayTimeDuration.fromString('P10D'), {
						kind: BaseType.XSDAYTIMEDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(Duration.fromString('P10D'), {
					kind: BaseType.XSDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, {
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:yearMonthDuration', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('P10Y10M', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSYEARMONTHDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(YearMonthDuration.fromString('P10Y10M'), {
					kind: BaseType.XSYEARMONTHDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('P10Y10M', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSYEARMONTHDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(YearMonthDuration.fromString('P10Y10M'), {
					kind: BaseType.XSYEARMONTHDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:duration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
						kind: BaseType.XSDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSYEARMONTHDURATION, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(YearMonthDuration.fromString('P10Y10M'), {
					kind: BaseType.XSYEARMONTHDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:yearMonthDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(YearMonthDuration.fromString('P10Y10M'), {
						kind: BaseType.XSYEARMONTHDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSYEARMONTHDURATION, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(YearMonthDuration.fromString('P10Y10M'), {
					kind: BaseType.XSYEARMONTHDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:dayTimeDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DayTimeDuration.fromString('P10Y10M'), {
						kind: BaseType.XSDAYTIMEDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSYEARMONTHDURATION, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(YearMonthDuration.fromString('P0M'), {
					kind: BaseType.XSYEARMONTHDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSYEARMONTHDURATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSYEARMONTHDURATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSYEARMONTHDURATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSYEARMONTHDURATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSYEARMONTHDURATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, {
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:dayTimeDuration', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('P10DT10H10M10S', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DayTimeDuration.fromString('P10DT10H10M10S'), {
					kind: BaseType.XSDAYTIMEDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('P10DT10H10M10S', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDAYTIMEDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(DayTimeDuration.fromString('P10DT10H10M10S'), {
					kind: BaseType.XSDAYTIMEDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:duration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
						kind: BaseType.XSDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DayTimeDuration.fromString('P10DT10H10M10S'), {
					kind: BaseType.XSDAYTIMEDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:yearMonthDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(YearMonthDuration.fromString('P10Y10M'), {
						kind: BaseType.XSYEARMONTHDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DayTimeDuration.fromString('PT0S'), {
					kind: BaseType.XSDAYTIMEDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:dayTimeDuration', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DayTimeDuration.fromString('P10DT10H10M10S'), {
						kind: BaseType.XSDAYTIMEDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DayTimeDuration.fromString('P10DT10H10M10S'), {
					kind: BaseType.XSDAYTIMEDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, {
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:dateTime', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000-10-10T10:10:10+10:30', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
					kind: BaseType.XSDATETIME,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000-10-10T10:10:10+10:30', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
					kind: BaseType.XSDATETIME,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
					kind: BaseType.XSDATETIME,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('2000-10-10T00:00:00+10:30'), {
					kind: BaseType.XSDATETIME,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, {
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('21FE3A44123C21FE3A44123C', {
							kind: BaseType.XSHEXBINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:time', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10:10:10+10:30', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
					kind: BaseType.XSTIME,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('10:10:10+10:30', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSTIME,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
					kind: BaseType.XSTIME,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
					kind: BaseType.XSTIME,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:time', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
						kind: BaseType.XSTIME,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
					kind: BaseType.XSTIME,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, {
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:date', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000-10-10+10:30', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
					kind: BaseType.XSDATE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000-10-10+10:30', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSDATE,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
					kind: BaseType.XSDATE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
					kind: BaseType.XSDATE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
					kind: BaseType.XSDATE,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, {
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:gYearMonth', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000-10+10:30', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSGYEARMONTH,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), {
					kind: BaseType.XSGYEARMONTH,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000-10+10:30', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSGYEARMONTH,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), {
					kind: BaseType.XSGYEARMONTH,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGYEARMONTH, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGYEARMONTH, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGYEARMONTH, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSGYEARMONTH, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), {
					kind: BaseType.XSGYEARMONTH,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGYEARMONTH, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSGYEARMONTH, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), {
					kind: BaseType.XSGYEARMONTH,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gYearMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10+10:30'), {
						kind: BaseType.XSGYEARMONTH,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSGYEARMONTH, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('2000-10+10:30'), {
					kind: BaseType.XSGYEARMONTH,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGYEARMONTH, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGYEARMONTH, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, {
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:gYear', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000+10:30', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSGYEAR,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(DateTime.fromString('2000+10:30'), {
					kind: BaseType.XSGYEAR,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('2000+10:30', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSGYEAR,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(DateTime.fromString('2000+10:30'), {
					kind: BaseType.XSGYEAR,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGYEAR, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGYEAR, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGYEAR, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSGYEAR, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('2000+10:30'), {
					kind: BaseType.XSGYEAR,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGYEAR, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSGYEAR, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('2000+10:30'), {
					kind: BaseType.XSGYEAR,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGYEAR, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000+10:30'), {
						kind: BaseType.XSGYEAR,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSGYEAR, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('2000+10:30'), {
					kind: BaseType.XSGYEAR,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGYEAR, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, {
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:gMonthDay', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('--10-10+10:30', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSGMONTHDAY,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), {
					kind: BaseType.XSGMONTHDAY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('--10-10+10:30', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSGMONTHDAY,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), {
					kind: BaseType.XSGMONTHDAY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGMONTHDAY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGMONTHDAY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGMONTHDAY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSGMONTHDAY, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), {
					kind: BaseType.XSGMONTHDAY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGMONTHDAY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSGMONTHDAY, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), {
					kind: BaseType.XSGMONTHDAY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGMONTHDAY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGMONTHDAY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10-10+10:30'), {
						kind: BaseType.XSGMONTHDAY,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSGMONTHDAY, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('--10-10+10:30'), {
					kind: BaseType.XSGMONTHDAY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, {
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:gDay', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('---10+10:30', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSGDAY,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(DateTime.fromString('---10+10:30'), {
					kind: BaseType.XSGDAY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('---10+10:30', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSGDAY,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(DateTime.fromString('---10+10:30'), {
					kind: BaseType.XSGDAY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('---10+10:30'), {
					kind: BaseType.XSGDAY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('---10+10:30'), {
					kind: BaseType.XSGDAY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('---10+10:30'), {
						kind: BaseType.XSGDAY,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('---10+10:30'), {
					kind: BaseType.XSGDAY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, {
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:gMonth', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('--10+10:30', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSGMONTH,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(DateTime.fromString('--10+10:30'), {
					kind: BaseType.XSGMONTH,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('--10+10:30', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSGMONTH,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(DateTime.fromString('--10+10:30'), {
					kind: BaseType.XSGMONTH,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(10.123, {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1010, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGMONTH, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGMONTH, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGMONTH, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
						kind: BaseType.XSDATETIME,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSGMONTH, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('--10+10:30'), {
					kind: BaseType.XSGMONTH,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGMONTH, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
						kind: BaseType.XSDATE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSGMONTH, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('--10+10:30'), {
					kind: BaseType.XSGMONTH,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGMONTH, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGMONTH, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGMONTH, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSGMONTH, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonth', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(DateTime.fromString('--10+10:30'), {
						kind: BaseType.XSGMONTH,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSGMONTH, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue(DateTime.fromString('--10+10:30'), {
					kind: BaseType.XSGMONTH,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, {
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTH,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSGMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:boolean', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('true', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSBOOLEAN,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(true, {
					kind: BaseType.XSBOOLEAN,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('true', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSBOOLEAN,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(true, {
					kind: BaseType.XSBOOLEAN,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1, {
						kind: BaseType.XSFLOAT,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSBOOLEAN,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(true, {
					kind: BaseType.XSBOOLEAN,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:double', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1, {
						kind: BaseType.XSDOUBLE,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSBOOLEAN,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(true, {
					kind: BaseType.XSBOOLEAN,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:decimal', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1, {
						kind: BaseType.XSDECIMAL,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSBOOLEAN,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(true, {
					kind: BaseType.XSBOOLEAN,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:integer', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(1, {
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSBOOLEAN,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(true, {
					kind: BaseType.XSBOOLEAN,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:boolean', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue(true, {
						kind: BaseType.XSBOOLEAN,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSBOOLEAN,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue(true, {
					kind: BaseType.XSBOOLEAN,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
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
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:base64Binary', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
					kind: BaseType.XSBASE64BINARY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
					kind: BaseType.XSBASE64BINARY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1, {
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1, {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1, {
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, {
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:base64Binary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
						kind: BaseType.XSBASE64BINARY,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
					kind: BaseType.XSBASE64BINARY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:hexBinary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('736F6D65206261736536342074657874', {
						kind: BaseType.XSHEXBINARY,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSBASE64BINARY,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
					kind: BaseType.XSBASE64BINARY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:hexBinary', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('736F6D65206261736536342074657874', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('736F6D65206261736536342074657874', {
					kind: BaseType.XSHEXBINARY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('736F6D65206261736536342074657874', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('736F6D65206261736536342074657874', {
					kind: BaseType.XSHEXBINARY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1, {
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSHEXBINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1, {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSHEXBINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1, {
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSHEXBINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSHEXBINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, {
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSHEXBINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:base64Binary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
						kind: BaseType.XSBASE64BINARY,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('736F6D65206261736536342074657874', {
					kind: BaseType.XSHEXBINARY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:hexBinary', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('736F6D65206261736536342074657874', {
						kind: BaseType.XSHEXBINARY,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }
				),
				createAtomicValue('736F6D65206261736536342074657874', {
					kind: BaseType.XSHEXBINARY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:anyURI (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSHEXBINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSHEXBINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:anyURI', () => {
		it('from xs:untypedAtomic', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', {
						kind: BaseType.XSUNTYPEDATOMIC,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSANYURI,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('string', {
					kind: BaseType.XSANYURI,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:string', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSANYURI,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('string', {
					kind: BaseType.XSANYURI,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:float (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1, {
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:double (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1, {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:decimal (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1, {
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:integer (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:duration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:yearMonthDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dayTimeDuration (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:dateTime (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:time (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:date (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYearMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gYear (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonthDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gDay (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:gMonth (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:boolean (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, {
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
		it('from xs:base64Binary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:hexBinary (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('736F6D65206261736536342074657874', {
							kind: BaseType.XSHEXBINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPTY0004'
			));
		it('from xs:anyURI', () =>
			chai.assert.deepEqual(
				castToType(
					createAtomicValue('string', {
						kind: BaseType.XSANYURI,
						seqType: SequenceType.EXACTLY_ONE,
					}),
					{
						kind: BaseType.XSANYURI,
						seqType: SequenceType.EXACTLY_ONE,
					}
				),
				createAtomicValue('string', {
					kind: BaseType.XSANYURI,
					seqType: SequenceType.EXACTLY_ONE,
				})
			));
		it('from xs:NOTATION (throws XPTY0004)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPTY0004'
			));
	});

	describe('to xs:NOTATION', () => {
		it('from xs:untypedAtomic (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSUNTYPEDATOMIC,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPST0080'
			));
		it('from xs:string (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSSTRING,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPST0080'
			));
		it('from xs:float (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1, {
							kind: BaseType.XSFLOAT,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPST0080'
			));
		it('from xs:double (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1, {
							kind: BaseType.XSDOUBLE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPST0080'
			));
		it('from xs:decimal (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1, {
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPST0080'
			));
		it('from xs:integer (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(1, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPST0080'
			));
		it('from xs:duration (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M10DT10H10M10S'), {
							kind: BaseType.XSDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSNOTATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPST0080'
			));
		it('from xs:yearMonthDuration (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSYEARMONTHDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSNOTATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPST0080'
			));
		it('from xs:dayTimeDuration (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(Duration.fromString('P10Y10M'), {
							kind: BaseType.XSDAYTIMEDURATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSNOTATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPST0080'
			));
		it('from xs:dateTime (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10T10:10:10+10:30'), {
							kind: BaseType.XSDATETIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSNOTATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPST0080'
			));
		it('from xs:time (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('10:10:10+10:30'), {
							kind: BaseType.XSTIME,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSNOTATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPST0080'
			));
		it('from xs:date (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10-10+10:30'), {
							kind: BaseType.XSDATE,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSNOTATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPST0080'
			));
		it('from xs:gYearMonth (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000-10+10:30'), {
							kind: BaseType.XSGYEARMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSNOTATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPST0080'
			));
		it('from xs:gYear (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('2000+10:30'), {
							kind: BaseType.XSGYEAR,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSNOTATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPST0080'
			));
		it('from xs:gMonthDay (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10-10+10:30'), {
							kind: BaseType.XSGMONTHDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSNOTATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPST0080'
			));
		it('from xs:gDay (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('---10+10:30'), {
							kind: BaseType.XSGDAY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSNOTATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPST0080'
			));
		it('from xs:gMonth (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(DateTime.fromString('--10+10:30'), {
							kind: BaseType.XSGMONTH,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSNOTATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPST0080'
			));
		it('from xs:boolean (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue(true, {
							kind: BaseType.XSBOOLEAN,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPST0080'
			));
		it('from xs:base64Binary (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('c29tZSBiYXNlNjQgdGV4dA==', {
							kind: BaseType.XSBASE64BINARY,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSNOTATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPST0080'
			));
		it('from xs:NOTATION (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('736F6D65206261736536342074657874', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{ kind: BaseType.XSNOTATION, seqType: SequenceType.EXACTLY_ONE }
					),
				'XPST0080'
			));
		it('from xs:anyURI (throws XPST0080)', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSANYURI,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPST0080'
			));
		it('from xs:NOTATION', () =>
			chai.assert.throws(
				() =>
					castToType(
						createAtomicValue('string', {
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}),
						{
							kind: BaseType.XSNOTATION,
							seqType: SequenceType.EXACTLY_ONE,
						}
					),
				'XPST0080'
			));
	});
});

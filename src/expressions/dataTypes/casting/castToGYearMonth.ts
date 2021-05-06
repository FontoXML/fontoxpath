import createAtomicValue from '../createAtomicValue';
import { BaseType, SequenceType, ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGYearMonthValue = (value) =>
	createAtomicValue(value, { kind: BaseType.XSGYEARMONTH, seqType: SequenceType.EXACTLY_ONE });

export default function castToGYearMonth(
	instanceOf: (typeName: ValueType) => boolean
): (value: DateTime) => CastResult {
	if (
		instanceOf({ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => ({
			successful: true,
			value: createGYearMonthValue(
				value.convertToType({
					kind: BaseType.XSGYEARMONTH,
					seqType: SequenceType.EXACTLY_ONE,
				})
			),
		});
	}
	if (
		instanceOf({ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => ({
			successful: true,
			value: createGYearMonthValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:gYearMonth or any of its derived types.'
		),
	});
}

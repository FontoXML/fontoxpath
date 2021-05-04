import createAtomicValue from '../createAtomicValue';
import { BaseType, ValueType, SequenceType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createDateTimeValue = (value) =>
	createAtomicValue(value, { kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE });

export default function castToDateTime(
	instanceOf: (typeName: ValueType) => boolean
): (value: DateTime) => CastResult {
	if (instanceOf({ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE })) {
		return (value) => ({
			successful: true,
			value: createDateTimeValue(
				value.convertToType({
					kind: BaseType.XSDATETIME,
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
			value: createDateTimeValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:dateTime or any of its derived types.'
		),
	});
}

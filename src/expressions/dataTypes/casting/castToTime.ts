import createAtomicValue from '../createAtomicValue';
import { BaseType, SequenceType, ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createTimeValue = (value) =>
	createAtomicValue(value, { kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE });

export default function castToTime(
	instanceOf: (typeName: ValueType) => boolean
): (value: DateTime) => CastResult {
	if (instanceOf({ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE })) {
		return (value) => ({
			successful: true,
			value: createTimeValue(
				value.convertToType({ kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE })
			),
		});
	}
	if (
		instanceOf({ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => ({
			successful: true,
			value: createTimeValue(DateTime.fromString(value)),
		});
	}
	return (value) => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:time or any of its derived types.'
		),
	});
}

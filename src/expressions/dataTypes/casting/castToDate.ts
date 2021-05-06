import createAtomicValue from '../createAtomicValue';
import { BaseType, SequenceType, ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createDateValue = (value) =>
	createAtomicValue(value, { kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE });

export default function castToDate(
	instanceOf: (typeName: ValueType) => boolean
): (value: DateTime) => CastResult {
	if (instanceOf({ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE })) {
		return (value) => ({
			successful: true,
			value: createDateValue(
				value.convertToType({ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE })
			),
		});
	}
	if (
		instanceOf({ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => ({
			successful: true,
			value: createDateValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:date or any of its derived types.'
		),
	});
}

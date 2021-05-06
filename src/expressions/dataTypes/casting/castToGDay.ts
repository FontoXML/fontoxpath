import createAtomicValue from '../createAtomicValue';
import { BaseType, SequenceType, ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGDayValue = (value) =>
	createAtomicValue(value, { kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE });

export default function castToGDay(
	instanceOf: (typeName: ValueType) => boolean
): (value: DateTime) => CastResult {
	if (
		instanceOf({ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => ({
			successful: true,
			value: createGDayValue(
				value.convertToType({ kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE })
			),
		});
	}
	if (
		instanceOf({ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => ({
			successful: true,
			value: createGDayValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:gDay or any of its derived types.'
		),
	});
}

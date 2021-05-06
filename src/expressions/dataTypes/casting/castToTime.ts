import AtomicValue from '../AtomicValue';
import createAtomicValue from '../createAtomicValue';
import { BaseType, SequenceType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createTimeValue = (value: any): AtomicValue =>
	createAtomicValue(value, { kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE });

export default function castToTime(
	instanceOf: (typeName: BaseType) => boolean
): (value: DateTime) => CastResult {
	if (instanceOf(BaseType.XSDATETIME)) {
		return (value) => ({
			successful: true,
			value: createTimeValue(
				value.convertToType({ kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE })
			),
		});
	}
	if (
		instanceOf(BaseType.XSUNTYPEDATOMIC) ||
		instanceOf(BaseType.XSSTRING)
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

import createAtomicValue from '../createAtomicValue';
import { BaseType, ValueType, SequenceType } from '../Value';
import Duration from '../valueTypes/Duration';
import CastResult from './CastResult';

const createDurationValue = (value) =>
	createAtomicValue(value, { kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE });

export default function castToDuration(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (instanceOf({ kind: BaseType.XSYEARMONTHDURATION, seqType: SequenceType.EXACTLY_ONE })) {
		return (value) => ({
			successful: true,
			value: createDurationValue(Duration.fromYearMonthDuration(value)),
		});
	}
	if (instanceOf({ kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.EXACTLY_ONE })) {
		return (value) => ({
			successful: true,
			value: createDurationValue(Duration.fromDayTimeDuration(value)),
		});
	}
	if (instanceOf({ kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE })) {
		return (value) => ({
			successful: true,
			value: createDurationValue(value),
		});
	}
	if (
		instanceOf({ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => {
			const parsedDuration = Duration.fromString(value);
			if (parsedDuration) {
				return {
					successful: true,
					value: createDurationValue(parsedDuration),
				};
			}
			return {
				successful: false,
				error: new Error(`FORG0001: Can not cast ${value} to xs:duration`),
			};
		};
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:duration or any of its derived types.'
		),
	});
}

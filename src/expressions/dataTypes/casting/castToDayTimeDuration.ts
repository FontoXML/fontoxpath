import createAtomicValue from '../createAtomicValue';
import { BaseType, SequenceType, ValueType } from '../Value';
import DayTimeDuration from '../valueTypes/DayTimeDuration';
import CastResult from './CastResult';

const createDayTimeDurationValue = (value) =>
	createAtomicValue(value, {
		kind: BaseType.XSDAYTIMEDURATION,
		seqType: SequenceType.EXACTLY_ONE,
	});

export default function castToDayTimeDuration(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (
		instanceOf({ kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE }) &&
		!instanceOf({ kind: BaseType.XSYEARMONTHDURATION, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => ({
			successful: true,
			value: createDayTimeDurationValue(value.getDayTimeDuration()),
		});
	}
	if (instanceOf({ kind: BaseType.XSYEARMONTHDURATION, seqType: SequenceType.EXACTLY_ONE })) {
		return () => ({
			successful: true,
			value: createDayTimeDurationValue(DayTimeDuration.fromString('PT0.0S')),
		});
	}
	if (
		instanceOf({ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => {
			const parsedDuration = DayTimeDuration.fromString(value);
			if (parsedDuration) {
				return {
					successful: true,
					value: createDayTimeDurationValue(parsedDuration),
				};
			}
			return {
				successful: false,
				error: new Error(`FORG0001: Can not cast ${value} to xs:dayTimeDuration`),
			};
		};
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:dayTimeDuration or any of its derived types.'
		),
	});
}

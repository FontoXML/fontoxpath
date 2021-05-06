import createAtomicValue from '../createAtomicValue';
import { BaseType, SequenceType } from '../Value';
import Duration from '../valueTypes/Duration';
import CastResult from './CastResult';

const createDurationValue = (value) =>
	createAtomicValue(value, { kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE });

export default function castToDuration(
	instanceOf: (typeName: BaseType) => boolean
): (value: any) => CastResult {
	if (instanceOf(BaseType.XSYEARMONTHDURATION)) {
		return (value) => ({
			successful: true,
			value: createDurationValue(Duration.fromYearMonthDuration(value)),
		});
	}
	if (instanceOf(BaseType.XSDAYTIMEDURATION)) {
		return (value) => ({
			successful: true,
			value: createDurationValue(Duration.fromDayTimeDuration(value)),
		});
	}
	if (instanceOf(BaseType.XSDURATION)) {
		return (value) => ({
			successful: true,
			value: createDurationValue(value),
		});
	}
	if (instanceOf(BaseType.XSUNTYPEDATOMIC) || instanceOf(BaseType.XSSTRING)) {
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

import createAtomicValue from '../createAtomicValue';
import { BaseType, ValueType, SequenceType } from '../Value';
import YearMonthDuration from '../valueTypes/YearMonthDuration';
import CastResult from './CastResult';

const createYearMonthDurationValue = (value) =>
	createAtomicValue(value, {
		kind: BaseType.XSYEARMONTHDURATION,
		seqType: SequenceType.EXACTLY_ONE,
	});

export default function castToYearMonthDuration(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (
		instanceOf({ kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE }) &&
		!instanceOf({ kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => ({
			successful: true,
			value: createYearMonthDurationValue(value.getYearMonthDuration()),
		});
	}
	if (instanceOf({ kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.EXACTLY_ONE })) {
		return (_value) => ({
			successful: true,
			value: createYearMonthDurationValue(YearMonthDuration.fromString('P0M')),
		});
	}
	if (
		instanceOf({ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => {
			const parsedDuration = YearMonthDuration.fromString(value);
			if (parsedDuration) {
				return {
					successful: true,
					value: createYearMonthDurationValue(parsedDuration),
				};
			}
			return {
				successful: false,
				error: new Error(`FORG0001: Cannot cast "${value}" to xs:yearMonthDuration.`),
			};
		};
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:yearMonthDuration or any of its derived types.'
		),
	});
}

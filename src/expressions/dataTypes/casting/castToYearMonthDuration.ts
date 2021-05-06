import createAtomicValue from '../createAtomicValue';
import { SequenceType } from '../Value';
import { BaseType } from '../BaseType';
import YearMonthDuration from '../valueTypes/YearMonthDuration';
import CastResult from './CastResult';

const createYearMonthDurationValue = (value) =>
	createAtomicValue(value, {
		kind: BaseType.XSYEARMONTHDURATION,
		seqType: SequenceType.EXACTLY_ONE,
	});

export default function castToYearMonthDuration(
	instanceOf: (typeName: BaseType) => boolean
): (value) => CastResult {
	if (instanceOf(BaseType.XSDURATION) && !instanceOf(BaseType.XSDAYTIMEDURATION)) {
		return (value) => ({
			successful: true,
			value: createYearMonthDurationValue(value.getYearMonthDuration()),
		});
	}
	if (instanceOf(BaseType.XSDAYTIMEDURATION)) {
		return (_value) => ({
			successful: true,
			value: createYearMonthDurationValue(YearMonthDuration.fromString('P0M')),
		});
	}
	if (instanceOf(BaseType.XSUNTYPEDATOMIC) || instanceOf(BaseType.XSSTRING)) {
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

import AtomicValue from '../AtomicValue';
import createAtomicValue from '../createAtomicValue';
import { BaseType, SequenceType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGMonthDayValue = (value: any): AtomicValue =>
	createAtomicValue(value, { kind: BaseType.XSGMONTHDAY, seqType: SequenceType.EXACTLY_ONE });

export default function castToGMonthDay(
	instanceOf: (typeName: BaseType) => boolean
): (value: DateTime) => CastResult {
	if (
		instanceOf(BaseType.XSDATE) ||
		instanceOf(BaseType.XSDATETIME)
	) {
		return (value) => ({
			successful: true,
			value: createGMonthDayValue(
				value.convertToType({
					kind: BaseType.XSGMONTHDAY,
					seqType: SequenceType.EXACTLY_ONE,
				})
			),
		});
	}
	if (
		instanceOf(BaseType.XSUNTYPEDATOMIC) ||
		instanceOf(BaseType.XSSTRING)
	) {
		return (value) => ({
			successful: true,
			value: createGMonthDayValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:gMonthDay or any of its derived types.'
		),
	});
}

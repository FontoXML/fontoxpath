import AtomicValue from '../AtomicValue';
import createAtomicValue from '../createAtomicValue';
import { SequenceMultiplicity, ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGMonthValue = (value: any): AtomicValue => createAtomicValue(value, ValueType.XSGMONTH);

export default function castToGMonth(
	instanceOf: (typeName: ValueType) => boolean
): (value: any) => CastResult {
	if (instanceOf(ValueType.XSDATE) || instanceOf(ValueType.XSDATETIME)) {
		return (value) => ({
			successful: true,
			value: createGMonthValue(
				value.convertToType({
					kind: ValueType.XSGMONTH,
					seqType: SequenceMultiplicity.EXACTLY_ONE,
				})
			),
		});
	}
	if (instanceOf(ValueType.XSUNTYPEDATOMIC) || instanceOf(ValueType.XSSTRING)) {
		return (value) => ({
			successful: true,
			value: createGMonthValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:gMonth or any of its derived types.'
		),
	});
}

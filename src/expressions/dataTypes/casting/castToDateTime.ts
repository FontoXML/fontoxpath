import AtomicValue from '../AtomicValue';
import createAtomicValue from '../createAtomicValue';
import { SequenceMultiplicity, ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createDateTimeValue = (value: any): AtomicValue =>
	createAtomicValue(value, ValueType.XSDATETIME);

export default function castToDateTime(
	instanceOf: (typeName: ValueType) => boolean
): (value: any) => CastResult {
	if (instanceOf(ValueType.XSDATE)) {
		return (value) => ({
			successful: true,
			value: createDateTimeValue(
				value.convertToType({
					kind: ValueType.XSDATETIME,
					seqType: SequenceMultiplicity.EXACTLY_ONE,
				})
			),
		});
	}
	if (instanceOf(ValueType.XSUNTYPEDATOMIC) || instanceOf(ValueType.XSSTRING)) {
		return (value) => ({
			successful: true,
			value: createDateTimeValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:dateTime or any of its derived types.'
		),
	});
}

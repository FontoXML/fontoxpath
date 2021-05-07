import AtomicValue from '../AtomicValue';
import { BaseType } from '../BaseType';
import createAtomicValue from '../createAtomicValue';
import { SequenceType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGMonthValue = (value: any): AtomicValue =>
	createAtomicValue(value, { kind: BaseType.XSGMONTH, seqType: SequenceType.EXACTLY_ONE });

export default function castToGMonth(
	instanceOf: (typeName: BaseType) => boolean
): (value: any) => CastResult {
	if (instanceOf(BaseType.XSDATE) || instanceOf(BaseType.XSDATETIME)) {
		return (value) => ({
			successful: true,
			value: createGMonthValue(
				value.convertToType({ kind: BaseType.XSGMONTH, seqType: SequenceType.EXACTLY_ONE })
			),
		});
	}
	if (instanceOf(BaseType.XSUNTYPEDATOMIC) || instanceOf(BaseType.XSSTRING)) {
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

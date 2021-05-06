import AtomicValue from '../AtomicValue';
import createAtomicValue from '../createAtomicValue';
import { BaseType, SequenceType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGDayValue = (value: any): AtomicValue =>
	createAtomicValue(value, { kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE });

export default function castToGDay(
	instanceOf: (typeName: BaseType) => boolean
): (value: any) => CastResult {
	if (instanceOf(BaseType.XSDATE) || instanceOf(BaseType.XSDATETIME)) {
		return (value) => ({
			successful: true,
			value: createGDayValue(
				value.convertToType({ kind: BaseType.XSGDAY, seqType: SequenceType.EXACTLY_ONE })
			),
		});
	}
	if (instanceOf(BaseType.XSUNTYPEDATOMIC) || instanceOf(BaseType.XSSTRING)) {
		return (value) => ({
			successful: true,
			value: createGDayValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:gDay or any of its derived types.'
		),
	});
}

import AtomicValue from '../AtomicValue';
import { BaseType } from '../BaseType';
import createAtomicValue from '../createAtomicValue';
import { SequenceMultiplicity } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createDateValue = (value: any): AtomicValue =>
	createAtomicValue(value, { kind: BaseType.XSDATE, seqType: SequenceMultiplicity.EXACTLY_ONE });

export default function castToDate(
	instanceOf: (typeName: BaseType) => boolean
): (value: any) => CastResult {
	if (instanceOf(BaseType.XSDATETIME)) {
		return (value) => ({
			successful: true,
			value: createDateValue(
				value.convertToType({
					kind: BaseType.XSDATE,
					seqType: SequenceMultiplicity.EXACTLY_ONE,
				})
			),
		});
	}
	if (instanceOf(BaseType.XSUNTYPEDATOMIC) || instanceOf(BaseType.XSSTRING)) {
		return (value) => ({
			successful: true,
			value: createDateValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:date or any of its derived types.'
		),
	});
}

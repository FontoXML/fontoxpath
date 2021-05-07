import AtomicValue from '../AtomicValue';
import { BaseType } from '../BaseType';
import createAtomicValue from '../createAtomicValue';
import { SequenceMultiplicity } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGYearValue = (value: any): AtomicValue =>
	createAtomicValue(value, { kind: BaseType.XSGYEAR, seqType: SequenceMultiplicity.EXACTLY_ONE });

export default function castToGYear(
	instanceOf: (typeName: BaseType) => boolean
): (value: DateTime) => CastResult {
	if (instanceOf(BaseType.XSDATE) || instanceOf(BaseType.XSDATETIME)) {
		return (value) => ({
			successful: true,
			value: createGYearValue(
				value.convertToType({
					kind: BaseType.XSGYEAR,
					seqType: SequenceMultiplicity.EXACTLY_ONE,
				})
			),
		});
	}
	if (instanceOf(BaseType.XSUNTYPEDATOMIC) || instanceOf(BaseType.XSSTRING)) {
		return (value) => ({
			successful: true,
			value: createGYearValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:gYear or any of its derived types.'
		),
	});
}

import AtomicValue from '../AtomicValue';
import { BaseType } from '../BaseType';
import createAtomicValue from '../createAtomicValue';
import { SequenceType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createDateTimeValue = (value: any): AtomicValue =>
	createAtomicValue(value, { kind: BaseType.XSDATETIME, seqType: SequenceType.EXACTLY_ONE });

export default function castToDateTime(
	instanceOf: (typeName: BaseType) => boolean
): (value: any) => CastResult {
	if (instanceOf(BaseType.XSDATE)) {
		return (value) => ({
			successful: true,
			value: createDateTimeValue(
				value.convertToType({
					kind: BaseType.XSDATETIME,
					seqType: SequenceType.EXACTLY_ONE,
				})
			),
		});
	}
	if (instanceOf(BaseType.XSUNTYPEDATOMIC) || instanceOf(BaseType.XSSTRING)) {
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

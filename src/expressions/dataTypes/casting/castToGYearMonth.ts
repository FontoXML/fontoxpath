import AtomicValue from '../AtomicValue';
import createAtomicValue from '../createAtomicValue';
import { BaseType, SequenceType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGYearMonthValue = (value: any): AtomicValue =>
	createAtomicValue(value, { kind: BaseType.XSGYEARMONTH, seqType: SequenceType.EXACTLY_ONE });

export default function castToGYearMonth(
	instanceOf: (typeName: BaseType) => boolean
): (value: DateTime) => CastResult {
	if (
		instanceOf(BaseType.XSDATE) ||
		instanceOf(BaseType.XSDATETIME)
	) {
		return (value) => ({
			successful: true,
			value: createGYearMonthValue(
				value.convertToType({
					kind: BaseType.XSGYEARMONTH,
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
			value: createGYearMonthValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:gYearMonth or any of its derived types.'
		),
	});
}

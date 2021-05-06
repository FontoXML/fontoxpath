import createAtomicValue from '../createAtomicValue';
import { BaseType, SequenceType, ValueType } from '../Value';
import CastResult from './CastResult';

const createHexBinaryValue = (value) =>
	createAtomicValue(value, { kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE });

function stringToHex(s: string) {
	let hex = '';
	for (let i = 0, l = s.length; i < l; i++) {
		hex += Number(s.charCodeAt(i)).toString(16);
	}
	return hex.toUpperCase();
}

// This declaration is needed, as we don't depend anymore on lib.dom.
declare var atob: (s: string) => string;

export default function castToHexBinary(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (instanceOf({ kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE })) {
		return (value) => ({
			successful: true,
			value: createHexBinaryValue(stringToHex(atob(value))),
		});
	}
	if (
		instanceOf({ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => ({
			successful: true,
			value: createHexBinaryValue(value),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:hexBinary or any of its derived types.'
		),
	});
}

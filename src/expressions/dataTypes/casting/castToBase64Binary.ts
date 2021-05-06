import createAtomicValue from '../createAtomicValue';
import { BaseType, SequenceType, ValueType } from '../Value';
import CastResult from './CastResult';

const createBase64BinaryValue = (value) =>
	createAtomicValue(value, { kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE });

function hexToString(hex) {
	let text = '';
	for (let i = 0; i < hex.length; i += 2) {
		text += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	}
	return text;
}

// This declaration is needed, as we don't depend anymore on lib.dom.
declare var btoa: (s: string) => string;

export default function castToBase64Binary(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (instanceOf({ kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE })) {
		return (value) => ({
			successful: true,
			value: createBase64BinaryValue(btoa(hexToString(value))),
		});
	}
	if (
		instanceOf({ kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }) ||
		instanceOf({ kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE })
	) {
		return (value) => ({
			successful: true,
			value: createBase64BinaryValue(value),
		});
	}
	return () => ({
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:base64Binary or any of its derived types.'
		),
		successful: false,
	});
}

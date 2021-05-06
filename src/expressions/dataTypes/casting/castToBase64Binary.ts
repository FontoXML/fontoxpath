import AtomicValue from '../AtomicValue';
import createAtomicValue from '../createAtomicValue';
import { BaseType, SequenceType } from '../Value';
import CastResult from './CastResult';

const createBase64BinaryValue = (value: any): AtomicValue =>
	createAtomicValue(value, { kind: BaseType.XSBASE64BINARY, seqType: SequenceType.EXACTLY_ONE });

function hexToString(hex: string) {
	let text = '';
	for (let i = 0; i < hex.length; i += 2) {
		text += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	}
	return text;
}

// This declaration is needed, as we don't depend anymore on lib.dom.
declare var btoa: (s: string) => string;

export default function castToBase64Binary(
	instanceOf: (typeName: BaseType) => boolean
): (value: any) => CastResult {
	if (instanceOf(BaseType.XSHEXBINARY)) {
		return (value) => ({
			successful: true,
			value: createBase64BinaryValue(btoa(hexToString(value))),
		});
	}
	if (
		instanceOf(BaseType.XSSTRING) ||
		instanceOf(BaseType.XSUNTYPEDATOMIC)
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

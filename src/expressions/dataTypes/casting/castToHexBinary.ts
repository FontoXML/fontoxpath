import AtomicValue from '../AtomicValue';
import { BaseType } from '../BaseType';
import createAtomicValue from '../createAtomicValue';
import { SequenceMultiplicity } from '../Value';
import CastResult from './CastResult';

const createHexBinaryValue = (value: any): AtomicValue =>
	createAtomicValue(value, {
		kind: BaseType.XSHEXBINARY,
		seqType: SequenceMultiplicity.EXACTLY_ONE,
	});

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
	instanceOf: (typeName: BaseType) => boolean
): (value: any) => CastResult {
	if (instanceOf(BaseType.XSBASE64BINARY)) {
		return (value) => ({
			successful: true,
			value: createHexBinaryValue(stringToHex(atob(value))),
		});
	}
	if (instanceOf(BaseType.XSSTRING) || instanceOf(BaseType.XSUNTYPEDATOMIC)) {
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

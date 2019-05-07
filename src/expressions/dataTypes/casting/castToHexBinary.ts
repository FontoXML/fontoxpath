import createAtomicValue from '../createAtomicValue';

const createHexBinaryValue = value => createAtomicValue(value, 'xs:hexBinary');

import CastResult from './CastResult';

function stringToHex(string) {
	let hex = '';
	for (let i = 0, l = string.length; i < l; i++) {
		hex += Number(string.charCodeAt(i)).toString(16);
	}
	return hex.toUpperCase();
}

// This declaration is needed, as we don't depend anymore on lib.dom.
declare var atob: ((s: string) => string);

export default function castToGDay(instanceOf: (string) => boolean): (Value) => CastResult {
	if (instanceOf('xs:base64Binary')) {
		return value => ({
			successful: true,
			value: createHexBinaryValue(stringToHex(atob(value)))
		});
	}
	if (instanceOf('xs:string') || instanceOf('xs:untypedAtomic')) {
		return value => ({
			successful: true,
			value: createHexBinaryValue(value)
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:hexBinary or any of its derived types.'
		)
	});
}

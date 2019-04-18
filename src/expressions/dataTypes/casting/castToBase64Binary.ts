import createAtomicValue from '../createAtomicValue';
import CastResult from './CastResult';

const createBase64BinaryValue = value => createAtomicValue(value, 'xs:base64Binary');

function hexToString(hex) {
	let string = '';
	for (let i = 0; i < hex.length; i += 2) {
		string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	}
	return string;
}

declare var btoa;

export default function castToBase64Binary(instanceOf: (string) => boolean): (Value) => CastResult {
	if (instanceOf('xs:hexBinary')) {
		return value => ({
			successful: true,
			value: createBase64BinaryValue(btoa(hexToString(value)))
		});
	}
	if (instanceOf('xs:string') || instanceOf('xs:untypedAtomic')) {
		return value => ({
			successful: true,
			value: createBase64BinaryValue(value)
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:base64Binary or any of its derived types.'
		)
	});
}

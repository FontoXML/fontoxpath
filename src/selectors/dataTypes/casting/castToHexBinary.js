import createAtomicValue from '../createAtomicValue';

const createHexBinaryValue = value => createAtomicValue(value, 'xs:hexBinary');

function stringToHex (string) {
	let hex = '';
	for (let i = 0, l = string.length; i < l; i++) {
		hex += Number(string.charCodeAt(i)).toString(16);
	}
	return hex.toUpperCase();
}

/**
 * @param  {./AtomicValueDataType}  value
 * @param  {function(string):boolean}  instanceOf
 * @return {{successful: boolean, value: ../AtomicValue<string>}|{successful: boolean, error: !Error}}
 */
export default function castToHexBinary (value, instanceOf) {
	if (instanceOf('xs:hexBinary')) {
		return {
			successful: true,
			value: createHexBinaryValue(value)
		};
	}
	if (instanceOf('xs:base64Binary')) {
		return {
			successful: true,
			value: createHexBinaryValue(stringToHex(atob(value)))
		};
	}
	if (instanceOf('xs:string') || instanceOf('xs:untypedAtomic')) {
		return {
			successful: true,
			value: createHexBinaryValue(value)
		};
	}
	return {
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:hexBinary or any of its derived types.')
	};
}

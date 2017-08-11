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
 * @param  {function(string):boolean}  instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
*/
export default function castToHexBinary (instanceOf) {
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
	return value => ({
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:hexBinary or any of its derived types.')
	});
}

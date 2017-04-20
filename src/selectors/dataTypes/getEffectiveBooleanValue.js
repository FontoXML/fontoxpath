import isInstanceOfType from './isInstanceOfType';

/**
 * @param  {./Value}  value
 */
export default function getEffectiveBooleanValue (value) {
	const jsValue = value.value;

	if (isInstanceOfType(value, 'xs:string') ||
		isInstanceOfType(value, 'xs:anyURI') ||
		isInstanceOfType(value, 'xs:untypedAtomic') ||
		isInstanceOfType(value, 'xs:QName')) {
		return jsValue.length !== 0;
	}

	if (isInstanceOfType(value, 'xs:boolean')) {
		return jsValue;
	}

	if (isInstanceOfType(value, 'xs:numeric')) {
		return !isNaN(jsValue) && jsValue !== 0;
	}

	if (isInstanceOfType(value, 'node()')) {
		return true;
	}

	throw new Error('FORG0006: A wrong argument type was specified in a function call.');
}

import isSubtypeOf from './isSubtypeOf';

/**
 * @param  {./Value}  value
 */
export default function getEffectiveBooleanValue (value) {
	const jsValue = value.value;

	if (isSubtypeOf(value.type, 'xs:string') ||
		isSubtypeOf(value.type, 'xs:anyURI') ||
		isSubtypeOf(value.type, 'xs:untypedAtomic') ||
		isSubtypeOf(value.type, 'xs:QName')) {
		return jsValue.length !== 0;
	}

	if (isSubtypeOf(value.type, 'xs:boolean')) {
		return jsValue;
	}

	if (isSubtypeOf(value.type, 'xs:numeric')) {
		return !isNaN(jsValue) && jsValue !== 0;
	}

	if (isSubtypeOf(value.type, 'node()')) {
		return true;
	}

	throw new Error('FORG0006: A wrong argument type was specified in a function call.');
}

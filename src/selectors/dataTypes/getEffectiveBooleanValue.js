import isSubtypeOf from './isSubtypeOf';

/**
 * @param  {./Value}  value
 */
export default function getEffectiveBooleanValue (value) {
	const jsValue = value.value;

	// If its operand is a sequence whose first item is a node, fn:boolean returns true.
	if (isSubtypeOf(value.type, 'node()')) {
		return true;
	}

	// If its operand is a singleton value of type xs:boolean or derived from xs:boolean, fn:boolean returns the value of its operand unchanged.
	if (isSubtypeOf(value.type, 'xs:boolean')) {
		return jsValue;
	}

	// If its operand is a singleton value of type xs:string, xs:anyURI, xs:untypedAtomic, or a type derived from one of these, fn:boolean returns false if the operand value has zero length; otherwise it returns true.
		if (isSubtypeOf(value.type, 'xs:string') ||
		isSubtypeOf(value.type, 'xs:anyURI') ||
		isSubtypeOf(value.type, 'xs:untypedAtomic')) {
		return jsValue.length !== 0;
	}

	// If its operand is a singleton value of any numeric type or derived from a numeric type, fn:boolean returns false if the operand value is NaN or is numerically equal to zero; otherwise it returns true.
	if (isSubtypeOf(value.type, 'xs:numeric')) {
		return !isNaN(jsValue) && jsValue !== 0;
	}

	// In all other cases, fn:boolean raises a type error [err:FORG0006]FO31.
	throw new Error('FORG0006: A wrong argument type was specified in a function call.');
}

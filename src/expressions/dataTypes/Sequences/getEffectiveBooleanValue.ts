import { errFORG0006 } from '../../functions/FunctionOperationErrors';
import isSubtypeOf from '../isSubtypeOf';
import Value, { BaseType, SequenceType } from '../Value';

export default function getEffectiveBooleanValue(value: Value): boolean {
	const jsValue = value.value;

	// If its operand is a sequence whose first item is a node, fn:boolean returns true.
	if (isSubtypeOf(value.type.kind, BaseType.NODE)) {
		return true;
	}

	// If its operand is a singleton value of type xs:boolean or derived from xs:boolean, fn:boolean returns the value of its operand unchanged.
	if (isSubtypeOf(value.type.kind, BaseType.XSBOOLEAN)) {
		return jsValue as boolean;
	}

	// If its operand is a singleton value of type xs:string, xs:anyURI, xs:untypedAtomic, or a type derived from one of these, fn:boolean returns false if the operand value has zero length; otherwise it returns true.
	if (
		isSubtypeOf(value.type.kind, BaseType.XSSTRING) ||
		isSubtypeOf(value.type.kind, BaseType.XSANYURI) ||
		isSubtypeOf(value.type.kind, BaseType.XSUNTYPEDATOMIC)
	) {
		return (jsValue as string).length !== 0;
	}

	// If its operand is a singleton value of any numeric type or derived from a numeric type, fn:boolean returns false if the operand value is NaN or is numerically equal to zero; otherwise it returns true.
	if (isSubtypeOf(value.type.kind, BaseType.XSNUMERIC)) {
		return !isNaN(jsValue as number) && jsValue !== 0;
	}

	// In all other cases, fn:boolean raises a type error [err:FORG0006]FO31.
	throw errFORG0006();
}

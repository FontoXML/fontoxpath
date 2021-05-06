import castToType from '../dataTypes/castToType';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import { getPrimitiveTypeName } from '../dataTypes/typeHelpers';
import Value, { SequenceType } from '../dataTypes/Value';
import { BaseType } from '../dataTypes/BaseType';

/**
 * Promote all given (numeric) items to single common type
 * https://www.w3.org/TR/xpath-31/#promotion
 */
export default function convertItemsToCommonType(items: (Value | null)[]): (Value | null)[] {
	if (
		items.every((item) => {
			// xs:integer is the only numeric type with inherits from another numeric type
			return (
				item === null ||
				isSubtypeOf(item.type.kind, BaseType.XSINTEGER) ||
				isSubtypeOf(item.type.kind, BaseType.XSDECIMAL)
			);
		})
	) {
		// They are all integers, we do not have to convert them to decimals
		return items;
	}
	const commonTypeName = items
		.map((item) => (item ? getPrimitiveTypeName(item.type.kind) : null))
		.reduce((typeName, itemType) => {
			if (itemType === null) {
				return typeName;
			}
			return itemType === typeName ? typeName : null;
		});

	if (commonTypeName !== null) {
		// All items are already of the same type
		return items;
	}

	// If each value is an instance of one of the types xs:string or xs:anyURI, then all the values are cast to type xs:string
	if (
		items.every((item) => {
			return (
				item === null ||
				isSubtypeOf(item.type.kind, BaseType.XSSTRING) ||
				isSubtypeOf(item.type.kind, BaseType.XSANYURI)
			);
		})
	) {
		return items.map((item) =>
			item
				? castToType(item, { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE })
				: null
		);
	}

	// If each value is an instance of one of the types xs:decimal or xs:float, then all the values are cast to type xs:float.
	if (
		items.every((item) => {
			return (
				item === null ||
				isSubtypeOf(item.type.kind, BaseType.XSDECIMAL) ||
				isSubtypeOf(item.type.kind, BaseType.XSFLOAT)
			);
		})
	) {
		return items.map((item) =>
			item
				? castToType(item, { kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE })
				: item
		);
	}
	// If each value is an instance of one of the types xs:decimal, xs:float, or xs:double, then all the values are cast to type xs:double.
	if (
		items.every((item) => {
			return (
				item === null ||
				isSubtypeOf(item.type.kind, BaseType.XSDECIMAL) ||
				isSubtypeOf(item.type.kind, BaseType.XSFLOAT) ||
				isSubtypeOf(item.type.kind, BaseType.XSDOUBLE)
			);
		})
	) {
		return items.map((item) =>
			item
				? castToType(item, { kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE })
				: item
		);
	}

	// Otherwise, a type error is raised. The exact error type is determined by the caller.
	return null;
}

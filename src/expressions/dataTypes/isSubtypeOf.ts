import builtinDataTypesByType, { TypeModel } from './builtins/builtinDataTypesByType';
import { ValueType } from './Value';
import { Variety } from './Variety';

function isSubtypeOfType(subType: TypeModel, superType: TypeModel) {
	if (superType.variety === Variety.UNION) {
		// It is a union type, which can only be the topmost types
		return !!superType.memberTypes.find((memberType) => isSubtypeOfType(subType, memberType));
	}

	while (subType) {
		if (subType.type === superType.type) {
			return true;
		}
		if (subType.variety === Variety.UNION) {
			return !!subType.memberTypes.find((memberType) =>
				isSubtypeOf(memberType.type, superType.type)
			);
		}
		subType = subType.parent;
	}
	return false;
}

/**
 * xs:int is a subtype of xs:integer
 * xs:decimal is a subtype of xs:numeric
 * xs:NMTOKENS is a subtype of xs:NM TOKEN
 */
export default function isSubtypeOf(baseSubType: ValueType, baseSuperType: ValueType): boolean {
	if (baseSubType === baseSuperType) {
		return true;
	}

	const superType: TypeModel = builtinDataTypesByType[baseSuperType];
	const subType: TypeModel = builtinDataTypesByType[baseSubType];

	return isSubtypeOfType(subType, superType);
}

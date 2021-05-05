import builtinDataTypesByType, { TypeModel } from './builtins/builtinDataTypesByType';
import { BaseType, startWithXS, ValueType } from './Value';
import { Variety } from './Variety';

function isSubtypeOfType(subType, superType) {
	if (superType.variety === Variety.UNION) {
		// It is a union type, which can only be the topmost types
		return !!superType.memberTypes.find((memberType) => isSubtypeOfType(subType, memberType));
	}

	while (subType) {
		if (subType.type.kind === superType.type.kind) {
			return true;
		}
		if (subType.variety === Variety.UNION) {
			return !!subType.memberTypes.find((memberType) => isSubtypeOf(memberType, superType));
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
export default function isSubtypeOf(baseSubType: BaseType, baseSuperType: BaseType): boolean {
	if (baseSubType === baseSuperType) {
		return true;
	}

	const superType: TypeModel = builtinDataTypesByType[baseSuperType];
	const subType: TypeModel = builtinDataTypesByType[baseSubType];

	if (!superType) {
		if (!startWithXS(baseSuperType)) {
			// Note that 'xs' is the only namespace currently supported
			throw new Error(`XPST0081: The type ${baseSuperType} could not be found.`);
		}
		throw new Error(`XPST0051: The type ${baseSuperType} could not be found.`);
	}

	return isSubtypeOfType(subType, superType);
}

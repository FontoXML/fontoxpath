import builtinDataTypesByType from './builtins/builtinDataTypesByType';
import { startWithXS, ValueType } from './Value';

function isSubtypeOfType(subType, superType) {
	if (superType.variety === 'union') {
		// It is a union type, which can only be the topmost types
		return !!superType.memberTypes.find((memberType) => isSubtypeOfType(subType, memberType));
	}

	while (subType) {
		if (subType.name.kind === superType.name.kind) {
			return true;
		}
		if (subType.variety === 'union') {
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
export default function isSubtypeOf(subTypeName: ValueType, superTypeName: ValueType): boolean {
	if (subTypeName.kind === superTypeName.kind) {
		return true;
	}

	const superType = builtinDataTypesByType[superTypeName.kind];
	const subType = builtinDataTypesByType[subTypeName.kind];

	if (!superType) {
		if (!startWithXS(superTypeName.kind)) {
			// Note that 'xs' is the only namespace currently supported
			throw new Error(`XPST0081: The type ${superTypeName} could not be found.`);
		}
		throw new Error(`XPST0051: The type ${superTypeName} could not be found.`);
	}

	return isSubtypeOfType(subType, superType);
}

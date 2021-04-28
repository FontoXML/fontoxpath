import builtinDataTypesByName from './builtins/builtinDataTypesByName';
import { ValueType } from './Value';

function isSubtypeOfType(subType, superType) {
	if (superType.variety === 'union') {
		// It is a union type, which can only be the topmost types
		return !!superType.memberTypes.find((memberType) => isSubtypeOfType(subType, memberType));
	}

	while (subType) {
		if (subType.name === superType.name) {
			return true;
		}
		if (subType.variety === 'union') {
			return !!subType.memberTypes.find((memberType) =>
				isSubtypeOfType(memberType, superType)
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
export default function isSubtypeOf(subTypeName: ValueType, superTypeName: ValueType): boolean {
	if (subTypeName === superTypeName) {
		return true;
	}

	const superType = builtinDataTypesByName[superTypeName.kind];
	const subType = builtinDataTypesByName[subTypeName.kind];

	if (!superType) {
		if (!superTypeName.startsWith('xs:')) {
			// Note that 'xs' is the only namespace currently supported
			throw new Error(`XPST0081: The type ${superTypeName} could not be found.`);
		}
		throw new Error(`XPST0051: The type ${superTypeName} could not be found.`);
	}

	return isSubtypeOfType(subType, superType);
}

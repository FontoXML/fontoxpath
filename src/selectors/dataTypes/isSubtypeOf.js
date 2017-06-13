import builtinDataTypesByName from './builtins/builtinDataTypesByName';
const instanceOfTypeShortcutTable = Object.create(null);

function isSubtypeOfType (subType, superType) {
	if (superType.variety === 'union') {
		// It is a union type, which can only be the topmost types
		return !!superType.memberTypes.find(memberType => isSubtypeOfType(subType, memberType));
	}

	while (subType) {
		if (subType.name === superType.name) {
			return true;
		}
		if (subType.variety === 'union') {
			return !!subType.memberTypes.find(memberType => isSubtypeOfType(memberType, superType));
		}
		subType = subType.parent;
	}
	return false;
}

/**
 * xs:int is a subtype of xs:integer
 * xs:decimal is a subtype of xs:numeric
 * xs:NMTOKENS is a subtype of xs:NM TOKEN
 * @param  {./ETypeNames}  subTypeName
 * @param  {./ETypeNames}  superTypeName
 */
export default function isSubtypeOf (subTypeName, superTypeName) {
	if (subTypeName === superTypeName) {
		return true;
	}

	const superType = builtinDataTypesByName[superTypeName];
	/**
	 * @type {!./types/Type}
	 */
	const subType = builtinDataTypesByName[subTypeName];

	return isSubtypeOfType(subType, superType);
}

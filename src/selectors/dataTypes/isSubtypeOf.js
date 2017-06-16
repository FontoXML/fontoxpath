import builtinDataTypesByName from './builtins/builtinDataTypesByName';

/**
 * @param   {!./types/Type}  subType
 * @param   {!./types/Type}  superType
 * @return  {boolean}
 */
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
 * @param   {./ETypeNames}  subTypeName
 * @param   {./ETypeNames}  superTypeName
 * @return  {boolean}
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

	if (!superType) {
		if (!superTypeName.startsWith('xs:')) {
			// Note that 'xs' is the only namespace currently supported
			throw new Error(`XPST0081: The type ${superTypeName} does not exist.`);
		}
		throw new Error(`XPST0051: The type ${superTypeName} does not exist.`);
	}

	return isSubtypeOfType(subType, superType);
}

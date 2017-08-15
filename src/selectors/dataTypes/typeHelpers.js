import builtinDataTypesByName from './builtins/builtinDataTypesByName';
/**
 * @param   {string}  typeName
 * @return  {?string}
 */
export function getPrimitiveTypeName (typeName) {
	let type = builtinDataTypesByName[typeName];
	while (type && type.variety !== 'primitive') {
		type = type.parent;
	}
	return !type ? null : type.name;
}

/**
 * @param   {string}  string
 * @param   {string}  typeName
 * @return  {string}
 */
export function normalizeWhitespace (string, typeName) {
	const type = builtinDataTypesByName[typeName];
	const restrictionsByName = type.restrictionsByName;
	if (!restrictionsByName || !restrictionsByName.whiteSpace) {
		if (!type.parent) {
			return string;
		}
		return normalizeWhitespace(string, type.parent.name);
	}
	const whiteSpaceType = type.restrictionsByName.whiteSpace;
	switch (whiteSpaceType) {
		case 'preserve':
			return string;
		case 'replace':
			return string.replace(/[\u0009\u000A\u000D]/g, ' ');

		case 'collapse':
			return string.replace(/[\u0009\u000A\u000D]/g, ' ').replace(/ {2,}/g, ' ').replace(/^ | $/g, '');
	}
	return string;
}

/**
 * @param   {string}   string
 * @param   {string}   typeName
 * @return  {boolean}
 */
export function validatePattern (string, typeName) {
	let type = builtinDataTypesByName[typeName];
	while (type && type.validator === null) {
		if (type.variety === 'list' || type.variety === 'union') {
			return true;
		}
		type = type.parent;
	}
	if (!type) {
		return true;
	}
	return type.validator(string);
}

function getHandlerForFacet (type, facetName) {
	while (type) {
		if (type.facetHandlers && type.facetHandlers[facetName]) {
			return type.facetHandlers[facetName];
		}
		type = type.parent;
	}
	return () => true;
}

/**
 * @param   {string}  value
 * @param   {string}  typeName
 * @return  {boolean}
 */
export function validateRestrictions (value, typeName) {
	let type = builtinDataTypesByName[typeName];
	while (type) {
		if (!type.restrictionsByName) {
			type = type.parent;
			continue;
		}

		const matchesRestrictions = Object.keys(type.restrictionsByName).every(restrictionName => {
			if (restrictionName === 'whiteSpace') {
				// whiteSpace will be handled separately
				return true;
			}

			const validationFunction = getHandlerForFacet(type, restrictionName);
			if (!validationFunction) {
				return true;
			}
			return validationFunction(value, type.restrictionsByName[restrictionName]);
		});

		if (!matchesRestrictions) {
			return false;
		}
		type = type.parent;
	}
	return true;
}

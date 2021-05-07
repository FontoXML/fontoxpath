import { BaseType } from './BaseType';
import builtinDataTypesByType, { TypeModel } from './builtins/builtinDataTypesByType';
import { Variety } from './Variety';

export function getPrimitiveTypeName(typeName: BaseType): BaseType | null {
	let type = builtinDataTypesByType[typeName];
	while (type && type.variety !== Variety.PRIMITIVE) {
		type = type.parent;
	}
	return !type ? null : type.type.kind;
}

export function normalizeWhitespace(input: string, typeName: BaseType): string {
	const type = builtinDataTypesByType[typeName];
	const restrictionsByName = type.restrictionsByName;
	if (!restrictionsByName || !restrictionsByName.whiteSpace) {
		if (!type.parent) {
			return input;
		}
		return normalizeWhitespace(input, type.parent.type.kind);
	}
	const whiteSpaceType = type.restrictionsByName.whiteSpace;
	switch (whiteSpaceType) {
		case 'preserve':
			return input;
		case 'replace':
			return input.replace(/[\u0009\u000A\u000D]/g, ' ');

		case 'collapse':
			return input
				.replace(/[\u0009\u000A\u000D]/g, ' ')
				.replace(/ {2,}/g, ' ')
				.replace(/^ | $/g, '');
	}
	return input;
}

export function validatePattern(input: string, type: BaseType): boolean {
	let typeModel = builtinDataTypesByType[type];
	while (typeModel && typeModel.validator === null) {
		if (typeModel.variety === Variety.LIST || typeModel.variety === Variety.UNION) {
			return true;
		}
		typeModel = typeModel.parent;
	}
	if (!typeModel) {
		return true;
	}
	return typeModel.validator(input);
}

function getHandlerForFacet(typeModel: TypeModel, facetName: string) {
	while (typeModel) {
		if (typeModel.facetHandlers && typeModel.facetHandlers[facetName]) {
			return typeModel.facetHandlers[facetName];
		}
		typeModel = typeModel.parent;
	}
	return () => true;
}

export function validateRestrictions(value: string, baseType: BaseType): boolean {
	let type = builtinDataTypesByType[baseType];
	while (type) {
		if (!type.restrictionsByName) {
			type = type.parent;
			continue;
		}

		const matchesRestrictions = Object.keys(type.restrictionsByName).every(
			(restrictionName) => {
				if (restrictionName === 'whiteSpace') {
					// whiteSpace will be handled separately
					return true;
				}

				const validationFunction = getHandlerForFacet(type, restrictionName);
				if (!validationFunction) {
					return true;
				}
				return validationFunction(value, type.restrictionsByName[restrictionName]);
			}
		);

		if (!matchesRestrictions) {
			return false;
		}
		type = type.parent;
	}
	return true;
}

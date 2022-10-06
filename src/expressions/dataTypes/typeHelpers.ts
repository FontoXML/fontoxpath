import builtinDataTypesByType, { TypeModel } from './builtins/builtinDataTypesByType';
import { SequenceMultiplicity, SequenceType, ValueType } from './Value';
import { Variety } from './Variety';

export function getPrimitiveTypeName(typeName: ValueType): ValueType | null {
	let type = builtinDataTypesByType[typeName];
	while (type && type.variety !== Variety.PRIMITIVE) {
		type = type.parent;
	}
	return !type ? null : type.type;
}

export function normalizeWhitespace(input: string, typeName: ValueType): string {
	const type = builtinDataTypesByType[typeName];
	const restrictionsByName = type.restrictionsByName;
	if (!restrictionsByName || !restrictionsByName.whiteSpace) {
		if (!type.parent) {
			return input;
		}
		return normalizeWhitespace(input, type.parent.type);
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

export function validatePattern(input: string, type: ValueType): boolean {
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

export function validateRestrictions(value: string, valueType: ValueType): boolean {
	let type = builtinDataTypesByType[valueType];
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

export function doesTypeAllowEmpty(type: SequenceType | null): boolean {
	if (!type) {
		// Unknown types can be anything
		return true;
	}
	return (
		type.mult === SequenceMultiplicity.ZERO_OR_MORE ||
		type.mult === SequenceMultiplicity.ZERO_OR_ONE
	);
}

export function doesTypeAllowMultiple(type: SequenceType | null): boolean {
	if (!type) {
		// Unknown types can be anything
		return true;
	}
	return (
		type.mult === SequenceMultiplicity.ZERO_OR_MORE ||
		type.mult === SequenceMultiplicity.ONE_OR_MORE
	);
}

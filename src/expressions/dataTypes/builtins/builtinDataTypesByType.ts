import facetHandlersByDataTypeName from '../facets/facetsByDataType';
import { BaseType, ValueType, SequenceType } from '../Value';
import { Variety } from '../Variety';
import builtinModels from './builtinModels';
import { getValidatorForType } from './dataTypeValidatorByType';

export type TypeModel = {
	facetHandlers: object;
	memberTypes: TypeModel[];
	name: ValueType;
	parent: TypeModel;
	restrictionsByName: { [s: string]: number | string };
	validator: (value: string) => boolean;
	variety: Variety;
};

const builtinDataTypesByType: { [typeName in BaseType]: TypeModel } = Object.create(null);

builtinModels.forEach((model) => {
	const name = model.name;
	const restrictionsByName = model.restrictions || {};

	if (model.variety === Variety.PRIMITIVE) {
		const parent = model.parent ? builtinDataTypesByType[model.parent.kind] : null;
		const validator = getValidatorForType(name.kind) || null;
		const facetHandlers = facetHandlersByDataTypeName.getFacetByDataType(name.kind);
		builtinDataTypesByType[name.kind] = {
			variety: Variety.PRIMITIVE,
			name,
			restrictionsByName,
			parent,
			validator,
			facetHandlers,
			memberTypes: [],
		};
	} else if (model.variety === Variety.DERIVED) {
		const base = builtinDataTypesByType[model.base.kind];
		const validator = getValidatorForType(name.kind) || null;
		builtinDataTypesByType[name.kind] = {
			variety: Variety.DERIVED,
			name,
			restrictionsByName,
			parent: base,
			validator,
			facetHandlers: base.facetHandlers,
			memberTypes: [],
		};
	} else if (model.variety === Variety.LIST) {
		const type = builtinDataTypesByType[model.type.kind];
		builtinDataTypesByType[name.kind] = {
			variety: Variety.LIST,
			name,
			restrictionsByName,
			parent: type,
			validator: null,
			facetHandlers: facetHandlersByDataTypeName.list,
			memberTypes: [],
		};
	} else {
		const memberTypes = model.memberTypes.map(
			(memberTypeRef) => builtinDataTypesByType[memberTypeRef.kind]
		);
		builtinDataTypesByType[name.kind] = {
			variety: Variety.UNION,
			name,
			restrictionsByName,
			parent: null,
			validator: null,
			facetHandlers: facetHandlersByDataTypeName.union,
			memberTypes,
		};
	}
});

export default builtinDataTypesByType;

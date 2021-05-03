import facetHandlersByDataTypeName from '../facets/facetsByDataTypeName';
import { BaseType, ValueType } from '../Value';
import builtinModels from './builtinModels';
import { getValidatorForType } from './dataTypeValidatorByName';

export type TypeModel = {
	facetHandlers: object;
	memberTypes: TypeModel[];
	name: ValueType;
	parent: TypeModel;
	restrictionsByName: { [s: string]: number | string };
	validator: (value: string) => boolean;
	variety: 'primitive' | 'derived' | 'list' | 'union';
};

const builtinDataTypesByType: { [typeName in BaseType]: TypeModel } = Object.create(null);

builtinModels.forEach((model) => {
	const name = model.name;
	const restrictionsByName = model.restrictions || {};

	if (model.variety === 'primitive') {
		const parent = model.parent ? builtinDataTypesByType[model.parent.kind] : null;
		const validator = getValidatorForType(name.kind) || null;
		const facetHandlers = facetHandlersByDataTypeName.getFacetByDataType(name.kind);
		builtinDataTypesByType[name.kind] = {
			variety: 'primitive',
			name,
			restrictionsByName,
			parent,
			validator,
			facetHandlers,
			memberTypes: [],
		};
	} else if (model.variety === 'derived') {
		const base = builtinDataTypesByType[model.base.kind];
		const validator = getValidatorForType(name.kind) || null;
		builtinDataTypesByType[name.kind] = {
			variety: 'derived',
			name,
			restrictionsByName,
			parent: base,
			validator,
			facetHandlers: base.facetHandlers,
			memberTypes: [],
		};
	} else if (model.variety === 'list') {
		const type = builtinDataTypesByType[model.type.kind];
		builtinDataTypesByType[name.kind] = {
			variety: 'list',
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
			variety: 'union',
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

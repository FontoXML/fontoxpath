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

const builtinDataTypesByName: { [typeName in BaseType]: TypeModel } = Object.create(null);

builtinModels.forEach((model) => {
	const name = model.name;
	const restrictionsByName = model.restrictions || {};

	if (model.variety === 'primitive') {
		const parent = model.parent ? builtinDataTypesByName[model.parent.kind] : null;
		const validator = getValidatorForType(name.kind) || null;
		const facetHandlers = facetHandlersByDataTypeName[name.kind];
		builtinDataTypesByName[name.kind] = {
			variety: 'primitive',
			name,
			restrictionsByName,
			parent,
			validator,
			facetHandlers,
			memberTypes: [],
		};
	} else if (model.variety === 'derived') {
		const base = builtinDataTypesByName[model.base.kind];
		const validator = getValidatorForType(name.kind) || null;
		builtinDataTypesByName[name.kind] = {
			variety: 'derived',
			name,
			restrictionsByName,
			parent: base,
			validator,
			facetHandlers: base.facetHandlers,
			memberTypes: [],
		};
	} else if (model.variety === 'list') {
		const type = builtinDataTypesByName[model.type.kind];
		builtinDataTypesByName[name.kind] = {
			variety: 'union', // TODO: why not list?
			name,
			restrictionsByName,
			parent: type,
			validator: null,
			facetHandlers: facetHandlersByDataTypeName.list,
			memberTypes: [],
		};
	} else {
		const memberTypes = model.memberTypes.map(
			(memberTypeRef) => builtinDataTypesByName[memberTypeRef.kind]
		);
		builtinDataTypesByName[name.kind] = {
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

export default builtinDataTypesByName;

import facetHandlersByDataTypeName from '../facets/facetsByDataTypeName';
import { ValueType } from '../Value';
import builtinModels from './builtinModels';
import dataTypeValidatorByName from './dataTypeValidatorByName';

export type TypeModel = {
	facetHandlers: object;
	memberTypes: TypeModel[];
	name: ValueType;
	parent: TypeModel;
	restrictionsByName: { [s: string]: number | string };
	validator: (value: string) => boolean;
	variety: 'primitive' | 'derived' | 'list' | 'union';
};

const builtinDataTypesByName: { [typeName in ValueType]: TypeModel } = Object.create(null);

builtinModels.forEach((model) => {
	const name = model.name;
	const restrictionsByName = model.restrictions || {};

	if (model.variety === 'primitive') {
		const parent = model.parent ? builtinDataTypesByName[model.parent] : null;
		const validator = dataTypeValidatorByName[name] || null;
		const facetHandlers = facetHandlersByDataTypeName[name];
		builtinDataTypesByName[name] = {
			variety: 'primitive',
			name,
			restrictionsByName,
			parent,
			validator,
			facetHandlers,
			memberTypes: [],
		};
	} else if (model.variety === 'derived') {
		const base = builtinDataTypesByName[model.base];
		const validator = dataTypeValidatorByName[name] || null;
		builtinDataTypesByName[name] = {
			variety: 'derived',
			name,
			restrictionsByName,
			parent: base,
			validator,
			facetHandlers: base.facetHandlers,
			memberTypes: [],
		};
	} else if (model.variety === 'list') {
		const type = builtinDataTypesByName[model.type];
		builtinDataTypesByName[name] = {
			variety: 'union',
			name,
			restrictionsByName,
			parent: type,
			validator: null,
			facetHandlers: facetHandlersByDataTypeName.list,
			memberTypes: [],
		};
	} else if (model.variety === 'union') {
		const memberTypes = model.memberTypes.map(
			(memberTypeRef) => builtinDataTypesByName[memberTypeRef]
		);
		builtinDataTypesByName[name] = {
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

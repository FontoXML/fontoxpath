import facetHandlersByDataTypeName from '../facets/facetsByDataType';
import { ValueType } from '../Value';
import { Variety } from '../Variety';
import builtinModels from './builtinModels';
import { getValidatorForType } from './dataTypeValidatorByType';

export type TypeModel = {
	facetHandlers: {
		[typeName: string]: (input: string | number, options: string | number) => boolean;
	};
	memberTypes: TypeModel[];
	parent: TypeModel;
	restrictionsByName: { [s: string]: number | string };
	type: ValueType;
	validator: (value: string) => boolean;
	variety: Variety;
};

const builtinDataTypesByType: { [typeName in ValueType]: TypeModel } = Object.create(null);

builtinModels.forEach((model) => {
	const name = model.name;
	const restrictionsByName = model.restrictions || {};

	switch (model.variety) {
		case Variety.PRIMITIVE: {
			const parent = model.parent ? builtinDataTypesByType[model.parent] : null;
			const validator = getValidatorForType(name) || null;
			const facetHandlers = facetHandlersByDataTypeName.getFacetByDataType(name);
			builtinDataTypesByType[name] = {
				variety: Variety.PRIMITIVE,
				type: name,
				restrictionsByName,
				parent,
				validator,
				facetHandlers,
				memberTypes: [],
			};
			break;
		}

		case Variety.DERIVED: {
			const base = builtinDataTypesByType[model.base];
			const validator = getValidatorForType(name) || null;
			builtinDataTypesByType[name] = {
				variety: Variety.DERIVED,
				type: name,
				restrictionsByName,
				parent: base,
				validator,
				facetHandlers: base.facetHandlers,
				memberTypes: [],
			};
			break;
		}

		case Variety.LIST: {
			const type = builtinDataTypesByType[model.type];
			builtinDataTypesByType[name] = {
				variety: Variety.LIST,
				type: name,
				restrictionsByName,
				parent: type,
				validator: null,
				facetHandlers: facetHandlersByDataTypeName.list,
				memberTypes: [],
			};
			break;
		}

		case Variety.UNION: {
			const memberTypes = model.memberTypes.map(
				(memberTypeRef) => builtinDataTypesByType[memberTypeRef],
			);
			builtinDataTypesByType[name] = {
				variety: Variety.UNION,
				type: name,
				restrictionsByName,
				parent: null,
				validator: null,
				facetHandlers: facetHandlersByDataTypeName.union,
				memberTypes,
			};
		}
	}
});

export default builtinDataTypesByType;

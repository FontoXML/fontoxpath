import builtinModels from './builtinModels';
import dataTypeValidatorByName from './dataTypeValidatorByName';
import facetsByDataTypeName from '../facets/facetsByDataTypeName';
import PrimitiveType from '../types/PrimitiveType';
import DerivedType from '../types/DerivedType';
import ListType from '../types/ListType';
import UnionType from '../types/UnionType';

const builtinDataTypesByName = Object.create(null);

builtinModels.forEach((model, index) => {
	const name = model.name,
		restrictions = model.restrictions;

	if (model.variety === 'primitive') {
		const parent = model.parent ? builtinDataTypesByName[model.parent] : null,
			validator = dataTypeValidatorByName[name] || null,
			facets = facetsByDataTypeName[name];
		builtinDataTypesByName[name] = new PrimitiveType(name, restrictions, parent, validator, facets);
	}
	else if (model.variety === 'derived') {
		const base = builtinDataTypesByName[model.base],
		validator = dataTypeValidatorByName[name] || null;
		builtinDataTypesByName[name] = new DerivedType(name, restrictions, base, validator);
	}
	else if (model.variety === 'list') {
		const type = builtinDataTypesByName[model.type];
		builtinDataTypesByName[name] = new ListType(name, restrictions, type);
	}
	else if (model.variety === 'union') {
		const memberTypes = model.memberTypes.map((memberTypeRef) => builtinDataTypesByName[memberTypeRef]);
		builtinDataTypesByName[name] = new UnionType(name || index, model.restrictions, memberTypes);
	}
});

export default builtinDataTypesByName;

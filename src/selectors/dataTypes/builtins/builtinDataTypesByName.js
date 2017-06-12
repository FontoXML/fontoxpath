import builtinModels from './builtinModels';
import dataTypeValidatorByName from './dataTypeValidatorByName';
import facetHandlersByDataTypeName from '../facets/facetsByDataTypeName';

/**
 * @dict
 */
const builtinDataTypesByName = Object.create(null);

builtinModels.forEach((model, index) => {
	const name = model.name;
	const restrictionsByName = model.restrictions || {};

	if (model.variety === 'primitive') {
		const parent = model.parent ? builtinDataTypesByName[model.parent] : null,
			validator = dataTypeValidatorByName[name] || null,
			facetHandlers = facetHandlersByDataTypeName[name];
		builtinDataTypesByName[name] = {
			variety: 'primitive',
			name: name,
			restrictionsByName: restrictionsByName,
			parent: parent,
			validator: validator,
			facetHandlers: facetHandlers,
			memberTypes: []
		};
	}
	else if (model.variety === 'derived') {
		const base = builtinDataTypesByName[model.base],
		validator = dataTypeValidatorByName[name] || null;
		builtinDataTypesByName[name] = {
			variety: 'derived',
			name: name,
			restrictionsByName: restrictionsByName,
			parent: base,
			validator: validator,
			facetHandlers: base.facetHandlers,
			memberTypes: []
		};
	}
	else if (model.variety === 'list') {
		const type = builtinDataTypesByName[model.type];
		builtinDataTypesByName[name] = {
			variety: 'union',
			name: name,
			restrictionsByName: restrictionsByName,
			parent: type,
			validator: null,
			facetHandlers: facetHandlersByDataTypeName.list,
			memberTypes: []
		};
	}
	else if (model.variety === 'union') {
		const memberTypes = model.memberTypes.map((memberTypeRef) => builtinDataTypesByName[memberTypeRef]);
		builtinDataTypesByName[name] = {
			variety: 'union',
			name: name || index,
			restrictionsByName: restrictionsByName,
			parent: null,
			validator: null,
			facetHandlers: facetHandlersByDataTypeName.union,
			memberTypes: memberTypes
		};
	}
});



export default builtinDataTypesByName;

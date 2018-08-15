/**
* @typedef {{functionDeclarations: !Array<!Object>}}
*/
let ModuleContents;

/**
 * @dict
 */
const loadedModulesByNamespaceURI = Object.create(null);

/**
* @param  {string}          uri
* @param  {ModuleContents}  moduleContents
*/
export const loadModuleFile = function loadModuleFile (uri, moduleContents) {
	let loadedModuleContents = loadedModulesByNamespaceURI[uri];
	if (!loadedModuleContents) {
		loadedModuleContents = loadedModulesByNamespaceURI[uri] = {
			functionDeclarations: []
		};
	}

	loadedModuleContents.functionDeclarations =
		loadedModuleContents.functionDeclarations.concat(moduleContents.functionDeclarations);
};

export const enhanceStaticContextWithModule = function enhanceStaticContextWithModule (staticContext, uri) {
	const moduleContents = loadedModulesByNamespaceURI[uri];

	moduleContents.functionDeclarations
		.forEach(
			functionDeclaration => staticContext.registerFunctionDefinition(
				functionDeclaration.namespaceURI,
				functionDeclaration.localName,
				functionDeclaration.arity,
				functionDeclaration.functionDefinition)
		);
};

const loadedModulesByNamespaceURI = Object.create(null);

export const loadModuleFile = (uri, moduleContents) => {
	let loadedModuleContents = loadedModulesByNamespaceURI[uri];
	if (!loadedModuleContents) {
		loadedModuleContents = loadedModulesByNamespaceURI[uri] = {
			functionDeclarations: []
		};
	}

	loadedModuleContents.functionDeclarations = loadedModuleContents.functionDeclarations.concat(
		moduleContents.functionDeclarations
	);
};

export const enhanceStaticContextWithModule = (staticContext, uri) => {
	const moduleContents = loadedModulesByNamespaceURI[uri];

	if (!moduleContents) {
		throw new Error(`XQST0051: No modules found with the namespace uri ${uri}`);
	}

	moduleContents.functionDeclarations.forEach(functionDeclaration =>
		staticContext.registerFunctionDefinition(
			uri,
			functionDeclaration.localName,
			functionDeclaration.arity,
			functionDeclaration.functionDefinition
		)
	);
};

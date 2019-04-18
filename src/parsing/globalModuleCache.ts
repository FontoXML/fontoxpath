import StaticContext, { FunctionDefinition } from "src/expressions/StaticContext";

const loadedModulesByNamespaceURI = Object.create(null);

export const loadModuleFile = (uri: string, moduleContents: { functionDeclarations: any; }) => {
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

export const enhanceStaticContextWithModule = (staticContext: StaticContext, uri: string) => {
	const moduleContents = loadedModulesByNamespaceURI[uri];

	if (!moduleContents) {
		throw new Error(`XQST0051: No modules found with the namespace uri ${uri}`);
	}

	moduleContents.functionDeclarations.forEach((functionDeclaration: { localName: string; arity: number; functionDefinition: FunctionDefinition; }) =>
		staticContext.registerFunctionDefinition(
			uri,
			functionDeclaration.localName,
			functionDeclaration.arity,
			functionDeclaration.functionDefinition
		)
	);
};

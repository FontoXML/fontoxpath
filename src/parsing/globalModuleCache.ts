import DynamicContext from '../expressions/DynamicContext';
import ExecutionParameters from '../expressions/ExecutionParameters';
import StaticContext, { FunctionDefinition } from '../expressions/StaticContext';
import { FunctionDeclaration, VariableDeclaration } from './processProlog';

const loadedModulesByNamespaceURI = Object.create(null);

export const loadModuleFile = (
	uri: string,
	moduleContents: {
		functionDeclarations: FunctionDeclaration[];
		variableDeclarations: VariableDeclaration[];
	}
) => {
	let loadedModuleContents = loadedModulesByNamespaceURI[uri];
	if (!loadedModuleContents) {
		loadedModuleContents = loadedModulesByNamespaceURI[uri] = {
			functionDeclarations: [],
			variableDeclarations: [],
		};
	}

	loadedModuleContents.functionDeclarations = loadedModuleContents.functionDeclarations.concat(
		moduleContents.functionDeclarations
	);
	loadedModuleContents.variableDeclarations = loadedModuleContents.variableDeclarations.concat(
		moduleContents.variableDeclarations
	);
};

export const enhanceStaticContextWithModule = (staticContext: StaticContext, uri: string) => {
	const moduleContents = loadedModulesByNamespaceURI[uri];

	if (!moduleContents) {
		throw new Error(`XQST0051: No modules found with the namespace uri ${uri}`);
	}

	moduleContents.functionDeclarations.forEach((functionDeclaration: FunctionDeclaration) =>
		staticContext.registerFunctionDefinition(
			uri,
			functionDeclaration.localName,
			functionDeclaration.arity,
			functionDeclaration.functionDefinition as FunctionDefinition
		)
	);

	moduleContents.variableDeclarations.forEach((variableDeclaration: VariableDeclaration) => {
		staticContext.registerVariable(uri, variableDeclaration.localName);
		staticContext.registerVariableDeclaration(
			uri,
			variableDeclaration.localName,
			(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) =>
				variableDeclaration.expression.evaluateMaybeStatically(
					dynamicContext,
					executionParameters
				)
		);
	});
};

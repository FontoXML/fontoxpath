import { printAndRethrowError } from '../evaluationUtils/printAndRethrowError';
import { StackTraceEntry } from '../expressions/debug/StackTraceEntry';
import DynamicContext from '../expressions/DynamicContext';
import ExecutionParameters from '../expressions/ExecutionParameters';
import StaticContext from '../expressions/StaticContext';
import { ModuleDeclaration, VariableDeclaration } from './processProlog';

const loadedModulesByNamespaceURI: { [uri: string]: ModuleDeclaration } = Object.create(null);

export const loadModuleFile = (uri: string, moduleContents: ModuleDeclaration) => {
	let loadedModuleContents = loadedModulesByNamespaceURI[uri];
	if (!loadedModuleContents) {
		loadedModuleContents = loadedModulesByNamespaceURI[uri] = {
			functionDeclarations: [],
			variableDeclarations: [],
			performStaticAnalysis: null,
			source: moduleContents.source,
		};
	}

	// If the dependent module is already statically analized, this one does not have to be anymore
	const staticallyAnalyseEarlierModules =
		loadedModuleContents.performStaticAnalysis ||
		(() => {
			/* This module is already statically compiled */
		});
	loadedModuleContents.functionDeclarations = loadedModuleContents.functionDeclarations.concat(
		moduleContents.functionDeclarations
	);
	loadedModuleContents.variableDeclarations = loadedModuleContents.variableDeclarations.concat(
		moduleContents.variableDeclarations
	);
	loadedModuleContents.performStaticAnalysis = (m) => {
		staticallyAnalyseEarlierModules(m);
		if (moduleContents.performStaticAnalysis) {
			moduleContents.performStaticAnalysis(m);
		}
	};
};

export const enhanceStaticContextWithModule = (staticContext: StaticContext, uri: string) => {
	const moduleContents = loadedModulesByNamespaceURI[uri];

	if (!moduleContents) {
		throw new Error(`XQST0051: No modules found with the namespace uri ${uri}`);
	}

	moduleContents.functionDeclarations.forEach((functionDeclaration) => {
		if (functionDeclaration.isPublic) {
			// Skip private functions
			staticContext.registerFunctionDefinition(
				uri,
				functionDeclaration.localName,
				functionDeclaration.arity,
				functionDeclaration
			);
		}
	});

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

/**
 * Perform static compilation on all registered modules
 *
 * This also happens when the first XPath is executed, but it is good practice to run this function after all XQuery modules are registered.
 *
 * @see registerXQueryModule
 *
 * @public
 */
export const performStaticCompilationOnModules = () => {
	Object.keys(loadedModulesByNamespaceURI).forEach((namespaceURI) => {
		const moduleContents = loadedModulesByNamespaceURI[namespaceURI];
		if (moduleContents.performStaticAnalysis) {
			try {
				moduleContents.performStaticAnalysis(moduleContents);
			} catch (error: unknown) {
				moduleContents.performStaticAnalysis = null;
				printAndRethrowError(moduleContents.source, error as Error | StackTraceEntry);
			}
		}
		moduleContents.performStaticAnalysis = null;
	});
};

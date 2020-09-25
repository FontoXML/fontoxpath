import domBackedDocumentWriter from '../documentWriter/domBackedDocumentWriter';
import IDocumentWriter from '../documentWriter/IDocumentWriter';
import wrapExternalDocumentWriter from '../documentWriter/wrapExternalDocumentWriter';
import DomFacade from '../domFacade/DomFacade';
import ExternalDomFacade from '../domFacade/ExternalDomFacade';
import IDomFacade from '../domFacade/IDomFacade';
import { Options } from '../evaluateXPath';
import adaptJavaScriptValueToXPathValue from '../expressions/adaptJavaScriptValueToXPathValue';
import sequenceFactory from '../expressions/dataTypes/sequenceFactory';
import DynamicContext from '../expressions/DynamicContext';
import ExecutionParameters from '../expressions/ExecutionParameters';
import Expression from '../expressions/Expression';
import builtInFunctions from '../expressions/functions/builtInFunctions';
import { registerFunction } from '../expressions/functions/functionRegistry';
import { FUNCTIONS_NAMESPACE_URI } from '../expressions/staticallyKnownNamespaces';
import DomBackedNodesFactory from '../nodesFactory/DomBackedNodesFactory';
import INodesFactory from '../nodesFactory/INodesFactory';
import wrapExternalNodesFactory from '../nodesFactory/wrapExternalNodesFactory';
import staticallyCompileXPath from '../parsing/staticallyCompileXPath';
import { Node } from '../types/Types';

const generateGlobalVariableBindingName = (variableName: string) => `Q{}${variableName}[0]`;

// bootstrap builtin functions
builtInFunctions.forEach((builtInFunction) => {
	registerFunction(
		builtInFunction.namespaceURI,
		builtInFunction.localName,
		builtInFunction.argumentTypes,
		builtInFunction.returnType,
		builtInFunction.callFunction
	);
});

function createDefaultNamespaceResolver(contextItem: any): (s: string) => string {
	if (!contextItem || typeof contextItem !== 'object' || !('lookupNamespaceURI' in contextItem)) {
		return (_prefix) => null;
	}
	return (prefix) => (contextItem as Node)['lookupNamespaceURI'](prefix || null);
}

function normalizeEndOfLines(xpathString: string) {
	// Replace all character sequences of 0xD followed by 0xA and all 0xD not followed by 0xA with 0xA.
	return xpathString.replace(/(\x0D\x0A)|(\x0D(?!\x0A))/g, String.fromCharCode(0xa));
}

export default function buildEvaluationContext(
	expressionString: string,
	contextItem: any,
	domFacade: IDomFacade | null,
	variables: object,
	externalOptions: Options,
	compilationOptions: {
		allowUpdating: boolean;
		allowXQuery: boolean;
		debug: boolean;
		disableCache: boolean;
	}
): {
	dynamicContext: DynamicContext;
	executionParameters: ExecutionParameters;
	expression: Expression;
} {
	if (variables === null || variables === undefined) {
		variables = variables || {};
	}
	let internalOptions: Options;
	if (externalOptions) {
		internalOptions = {
			// tslint:disable-next-line:no-console
			logger: externalOptions['logger'] || { trace: console.log.bind(console) },
			documentWriter: externalOptions['documentWriter'],
			moduleImports: externalOptions['moduleImports'],
			namespaceResolver: externalOptions['namespaceResolver'],
			nodesFactory: externalOptions['nodesFactory'],
		};
	} else {
		internalOptions = {
			// tslint:disable-next-line:no-console
			logger: { trace: console.log.bind(console) },
			moduleImports: {},
			namespaceResolver: null,
			nodesFactory: null,
			documentWriter: null,
		};
	}
	const wrappedDomFacade: DomFacade = new DomFacade(
		domFacade === null ? new ExternalDomFacade() : domFacade
	);

	expressionString = normalizeEndOfLines(expressionString);

	const moduleImports = internalOptions.moduleImports || Object.create(null);

	const namespaceResolver =
		internalOptions.namespaceResolver || createDefaultNamespaceResolver(contextItem);

	const defaultFunctionNamespaceURI =
		externalOptions['defaultFunctionNamespaceURI'] || FUNCTIONS_NAMESPACE_URI;

	const expressionAndStaticContext = staticallyCompileXPath(
		expressionString,
		compilationOptions,
		namespaceResolver,
		variables,
		moduleImports,
		defaultFunctionNamespaceURI
	);

	const contextSequence = contextItem
		? adaptJavaScriptValueToXPathValue(wrappedDomFacade, contextItem)
		: sequenceFactory.empty();

	const nodesFactory: INodesFactory =
		!internalOptions.nodesFactory && compilationOptions.allowXQuery
			? new DomBackedNodesFactory(contextItem)
			: wrapExternalNodesFactory(internalOptions.nodesFactory);

	const documentWriter: IDocumentWriter = internalOptions.documentWriter
		? wrapExternalDocumentWriter(internalOptions.documentWriter)
		: domBackedDocumentWriter;

	const variableBindings = Object.keys(variables).reduce((typedVariableByName, variableName) => {
		typedVariableByName[generateGlobalVariableBindingName(variableName)] = () =>
			adaptJavaScriptValueToXPathValue(wrappedDomFacade, variables[variableName]);
		return typedVariableByName;
	}, Object.create(null));

	let dynamicContext;
	for (const binding of expressionAndStaticContext.staticContext.getVariableBindings()) {
		if (!variableBindings[binding]) {
			variableBindings[binding] = () =>
				expressionAndStaticContext.staticContext.getVariableDeclaration(binding)(
					dynamicContext,
					executionParameters
				);
		}
	}

	dynamicContext = new DynamicContext({
		contextItem: contextSequence.first(),
		contextItemIndex: 0,
		contextSequence,
		variableBindings,
	});

	const executionParameters = new ExecutionParameters(
		wrappedDomFacade,
		nodesFactory,
		documentWriter,
		externalOptions['currentContext'],
		new Map(),
		internalOptions.logger
	);

	return {
		dynamicContext,
		executionParameters,
		expression: expressionAndStaticContext.expression,
	};
}

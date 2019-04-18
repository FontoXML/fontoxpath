import domBackedDocumentWriter from '../documentWriter/domBackedDocumentWriter';
import IDocumentWriter from '../documentWriter/IDocumentWriter';
import wrapExternalDocumentWriter from '../documentWriter/wrapExternalDocumentWriter';
import DomFacade from '../domFacade/DomFacade';
import ExternalDomFacade from '../domFacade/ExternalDomFacade';
import IDomFacade from '../domFacade/IDomFacade';
import IWrappingDomFacade from '../domFacade/IWrappingDomFacade';
import { UpdatingOptions } from '../evaluateUpdatingExpression';
import { Options } from '../evaluateXPath';
import adaptJavaScriptValueToXPathValue from '../expressions/adaptJavaScriptValueToXPathValue';
import sequenceFactory from '../expressions/dataTypes/sequenceFactory';
import DynamicContext from '../expressions/DynamicContext';
import ExecutionParameters from '../expressions/ExecutionParameters';
import Expression from '../expressions/Expression';
import builtInFunctions from '../expressions/functions/builtInFunctions';
import { registerFunction } from '../expressions/functions/functionRegistry';
import DomBackedNodesFactory from '../nodesFactory/DomBackedNodesFactory';
import INodesFactory from '../nodesFactory/INodesFactory';
import wrapExternalNodesFactory from '../nodesFactory/wrapExternalNodesFactory';
import staticallyCompileXPath from '../parsing/staticallyCompileXPath';
import { Node } from '../types/Types';

export const generateGlobalVariableBindingName = (variableName: string) => `GLOBAL_${variableName}`;

// bootstrap builtin functions
builtInFunctions.forEach(builtInFunction => {
	registerFunction(
		builtInFunction.namespaceURI,
		builtInFunction.localName,
		builtInFunction.argumentTypes,
		builtInFunction.returnType,
		builtInFunction.callFunction
	);
});

function createDefaultNamespaceResolver(contextItem: Node): (s: string) => string {
	if (!contextItem || typeof contextItem !== 'object' || !('lookupNamespaceURI' in contextItem)) {
		return _prefix => null;
	}
	return prefix => contextItem['lookupNamespaceURI'](prefix || null);
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
	externalOptions: Options | UpdatingOptions,
	compilationOptions: {
		allowUpdating: boolean;
		allowXQuery: boolean;
		debug: boolean;
	}
): {
	dynamicContext: DynamicContext;
	executionParameters: ExecutionParameters;
	expression: Expression;
} {
	if (variables === null || variables === undefined) {
		variables = variables || {};
	}
	let internalOptions: UpdatingOptions;
	if (externalOptions) {
		internalOptions = {
			moduleImports: externalOptions['moduleImports'],
			namespaceResolver: externalOptions['namespaceResolver'],
			nodesFactory: externalOptions['nodesFactory']
		};
	} else {
		internalOptions = { namespaceResolver: null, nodesFactory: null, moduleImports: {} };
	}
	const wrappedDomFacade: IWrappingDomFacade = new DomFacade(
		domFacade === null ? new ExternalDomFacade() : domFacade
	);

	expressionString = normalizeEndOfLines(expressionString);

	const moduleImports = internalOptions.moduleImports || Object.create(null);

	const namespaceResolver =
		internalOptions.namespaceResolver || createDefaultNamespaceResolver(contextItem);
	const expression = staticallyCompileXPath(
		expressionString,
		compilationOptions,
		namespaceResolver,
		variables,
		moduleImports
	);

	const contextSequence = contextItem
		? adaptJavaScriptValueToXPathValue(contextItem)
		: sequenceFactory.empty();

	const nodesFactory: INodesFactory =
		!internalOptions.nodesFactory && compilationOptions.allowXQuery
			? new DomBackedNodesFactory(contextItem)
			: wrapExternalNodesFactory(internalOptions.nodesFactory);

	const documentWriter: IDocumentWriter = internalOptions.documentWriter
		? wrapExternalDocumentWriter(internalOptions.documentWriter)
		: domBackedDocumentWriter;

	const dynamicContext = new DynamicContext({
		contextItem: contextSequence.first(),
		contextItemIndex: 0,
		contextSequence,
		variableBindings: Object.keys(variables).reduce((typedVariableByName, variableName) => {
			typedVariableByName[generateGlobalVariableBindingName(variableName)] = () =>
				adaptJavaScriptValueToXPathValue(variables[variableName]);
			return typedVariableByName;
		}, Object.create(null))
	});

	const executionParameters = new ExecutionParameters(
		wrappedDomFacade,
		nodesFactory,
		documentWriter
	);

	return {
		dynamicContext,
		executionParameters,
		expression
	};
}

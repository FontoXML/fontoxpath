import domBackedDocumentWriter from '../documentWriter/domBackedDocumentWriter';
import wrapExternalDocumentWriter from '../documentWriter/wrapExternalDocumentWriter';
import IDocumentWriter from '../documentWriter/IDocumentWriter';

import domBackedDomFacade from '../domFacade/domBackedDomFacade';
import DomFacade from '../domFacade/DomFacade';
import IDomFacade from '../domFacade/IDomFacade';

import DomBackedNodesFactory from '../nodesFactory/DomBackedNodesFactory';
import INodesFactory from '../nodesFactory/INodesFactory';
import wrapExternalNodesFactory from '../nodesFactory/wrapExternalNodesFactory';

import adaptJavaScriptValueToXPathValue from '../expressions/adaptJavaScriptValueToXPathValue';
import SequenceFactory from '../expressions/dataTypes/SequenceFactory';
import DynamicContext from '../expressions/DynamicContext';
import ExecutionParameters from '../expressions/ExecutionParameters';
import Expression from '../expressions/Expression';
import builtInFunctions from '../expressions/functions/builtInFunctions';
import { registerFunction } from '../expressions/functions/functionRegistry';
import staticallyCompileXPath from '../parsing/staticallyCompileXPath';
import { Options } from '../evaluateXPath';
import { UpdatingOptions } from '../evaluateUpdatingExpression';
import IExternalDomFacade from '../domFacade/IExternalDomFacade';
import IWrappingDomFacade from '../domFacade/IWrappingDomFacade';

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

function createDefaultNamespaceResolver(contextItem: Node | any): (s: string) => string {
	if (!contextItem || typeof contextItem !== 'object' || !('lookupNamespaceURI' in contextItem)) {
		return _prefix => null;
	}
	return prefix => /** @type {Node} */ (contextItem)['lookupNamespaceURI'](prefix || null);
}

function normalizeEndOfLines(xpathString: string) {
	// Replace all character sequences of 0xD followed by 0xA and all 0xD not followed by 0xA with 0xA.
	return xpathString.replace(/(\x0D\x0A)|(\x0D(?!\x0A))/g, String.fromCharCode(0xa));
}

export default function buildEvaluationContext(
	expressionString: string,
	contextItem: any,
	domFacade: IExternalDomFacade | null,
	variables: object,
	externalOptions: Options | UpdatingOptions,
	compilationOptions: {
		allowUpdating: boolean;
		allowXQuery: boolean;
		disableCache: boolean;
	}
): {
	expression: Expression;
	executionParameters: ExecutionParameters;
	dynamicContext: DynamicContext;
} {
	if (variables === null || variables === undefined) {
		variables = variables || {};
	}
	let internalOptions: {
		 namespaceResolver: (s: string) => string;
		 nodesFactory: INodesFactory;
		 moduleImports: {[s: string]: string; } | {};
	};
	if (externalOptions) {
		internalOptions = {
			namespaceResolver: externalOptions['namespaceResolver'],
			nodesFactory: externalOptions['nodesFactory'],
			moduleImports: externalOptions['moduleImports'],

		};
	} else {
		internalOptions = { namespaceResolver: null, nodesFactory: null, moduleImports: {} }
	};
	let wrappedDomFacade: IWrappingDomFacade;
	if (domFacade === null) {
		wrappedDomFacade = domBackedDomFacade;
	} else {
		// Always wrap in an actual domFacade
		wrappedDomFacade = new DomFacade(domFacade);
	}

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
		: SequenceFactory.empty();

	let nodesFactory: INodesFactory = internalOptions.nodesFactory;
	if (!nodesFactory && compilationOptions['allowXQuery']) {
		nodesFactory = new DomBackedNodesFactory(contextItem);
	} else {
		nodesFactory = wrapExternalNodesFactory(nodesFactory);
	}

	let documentWriter: IDocumentWriter = (internalOptions as UpdatingOptions).documentWriter;
	if (!documentWriter) {
		documentWriter = domBackedDocumentWriter;
	} else {
		documentWriter = wrapExternalDocumentWriter(documentWriter);
	}

	const dynamicContext = new DynamicContext({
		contextItemIndex: 0,
		contextSequence: contextSequence,
		contextItem: contextSequence.first(),
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
		executionParameters,
		dynamicContext,
		expression
	};
}

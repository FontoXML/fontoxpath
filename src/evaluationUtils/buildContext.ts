import domBackedDocumentWriter from '../documentWriter/domBackedDocumentWriter';
import IDocumentWriter from '../documentWriter/IDocumentWriter';
import wrapExternalDocumentWriter from '../documentWriter/wrapExternalDocumentWriter';
import domBackedDomFacade from '../domFacade/domBackedDomFacade';
import DomFacade from '../domFacade/DomFacade';
import ExternalDomFacade from '../domFacade/ExternalDomFacade';
import IWrappingDomFacade from '../domFacade/IWrappingDomFacade';
import { UpdatingOptions } from '../evaluateUpdatingExpression';
import { Options } from '../evaluateXPath';
import adaptJavaScriptValueToXPathValue from '../expressions/adaptJavaScriptValueToXPathValue';
import SequenceFactory from '../expressions/dataTypes/SequenceFactory';
import DynamicContext from '../expressions/DynamicContext';
import ExecutionParameters from '../expressions/ExecutionParameters';
import Expression from '../expressions/Expression';
import builtInFunctions from '../expressions/functions/builtInFunctions';
import { registerFunction } from '../expressions/functions/functionRegistry';
import DomBackedNodesFactory from '../nodesFactory/DomBackedNodesFactory';
import INodesFactory from '../nodesFactory/INodesFactory';
import wrapExternalNodesFactory from '../nodesFactory/wrapExternalNodesFactory';
import staticallyCompileXPath from '../parsing/staticallyCompileXPath';

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
	return prefix => contextItem['lookupNamespaceURI'](prefix || null);
}

function normalizeEndOfLines(xpathString: string) {
	// Replace all character sequences of 0xD followed by 0xA and all 0xD not followed by 0xA with 0xA.
	return xpathString.replace(/(\x0D\x0A)|(\x0D(?!\x0A))/g, String.fromCharCode(0xa));
}

export default function buildEvaluationContext(
	expressionString: string,
	contextItem: any,
	domFacade: ExternalDomFacade | null,
	variables: object,
	externalOptions: Options | UpdatingOptions,
	compilationOptions: {
		allowUpdating: boolean;
		allowXQuery: boolean;
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
	let internalOptions: {
		moduleImports: { [s: string]: string } | {};
		namespaceResolver: (s: string) => string;
		nodesFactory: INodesFactory;
	};
	if (externalOptions) {
		internalOptions = {
			moduleImports: externalOptions['moduleImports'],
			namespaceResolver: externalOptions['namespaceResolver'],
			nodesFactory: externalOptions['nodesFactory']
		};
	} else {
		internalOptions = { namespaceResolver: null, nodesFactory: null, moduleImports: {} };
	}
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
	if (!nodesFactory && compilationOptions.allowXQuery) {
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
		contextSequence,
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

import adaptJavaScriptValueToXPathValue from '../expressions/adaptJavaScriptValueToXPathValue';
import DynamicContext from '../expressions/DynamicContext';
import DomFacade from '../DomFacade';
import ExecutionParameters from '../expressions/ExecutionParameters';
import domBackedDomFacade from '../domBackedDomFacade';
import domBackedDocumentWriter from '../domBackedDocumentWriter';
import DomBackedNodesFactory from '../DomBackedNodesFactory';
import Expression from '../expressions/Expression';
import SequenceFactory from '../expressions/dataTypes/SequenceFactory';
import staticallyCompileXPath from '../parsing/staticallyCompileXPath';
import { generateGlobalVariableBindingName } from '../expressions/ExecutionSpecificStaticContext';

function createDefaultNamespaceResolver(contextItem: Node | any): (string) => string {
	if (!contextItem || typeof contextItem !== 'object' || !('lookupNamespaceURI' in contextItem)) {
		return (_prefix) => null;
	}
	return prefix => (/** @type {Node} */(contextItem)).lookupNamespaceURI(prefix || null);
}

function normalizeEndOfLines (xpathString) {
	// Replace all character sequences of 0xD followed by 0xA and all 0xD not followed by 0xA with 0xA.
	return xpathString.replace(/(\x0D\x0A)|(\x0D(?!\x0A))/g, String.fromCharCode(0xA));
}

export default function buildEvaluationContext(
	expressionString: string,
	contextItem: any,
	domFacade: DomFacade | null,
	variables: object,
	options: object,
	compilationOptions: {
		allowXQuery: boolean,
		allowUpdating: boolean,
		disableCache: boolean
	}): { expression: Expression; dynamicContext: DynamicContext; executionParameters: ExecutionParameters; } {
	if (variables === null || variables === undefined) {
		variables = variables || {};
	}
	options = options || { namespaceResolver: null, nodesFactory: null, language: 'XPath3.1', moduleImports: {} };
	if (domFacade === null) {
		domFacade = domBackedDomFacade;
	}
	expressionString = normalizeEndOfLines(expressionString);
	// Always wrap in an actual domFacade
	const wrappedDomFacade = new DomFacade(domFacade);

	const moduleImports = options['moduleImports'] || Object.create(null);

	const namespaceResolver = options['namespaceResolver'] || createDefaultNamespaceResolver(contextItem);
	const expression = staticallyCompileXPath(
		expressionString,
		compilationOptions,
		namespaceResolver,
		variables,
		moduleImports);

	const contextSequence = contextItem ? adaptJavaScriptValueToXPathValue(contextItem) : SequenceFactory.empty();

	/**
	 * @type {INodesFactory}
	 */
	let nodesFactory = options['nodesFactory'];
	if (!nodesFactory && compilationOptions.allowXQuery) {
		nodesFactory = new DomBackedNodesFactory(contextItem);
	}

	/**
	 * @type {IDocumentWriter}
	 */
	let documentWriter = options['documentWriter'];
	if (!documentWriter && compilationOptions.allowUpdating) {
		documentWriter = domBackedDocumentWriter;
	}

	/**
	 * @type {!DynamicContext}
	 */
	const dynamicContext = new DynamicContext({
		contextItemIndex: 0,
		contextSequence: contextSequence,
		contextItem: contextSequence.first(),
		variableBindings: Object.keys(variables).reduce((typedVariableByName, variableName) => {
			typedVariableByName[generateGlobalVariableBindingName(variableName)] =
				() => adaptJavaScriptValueToXPathValue(variables[variableName]);
			return typedVariableByName;
		}, Object.create(null))
	});

	const executionParameters = new ExecutionParameters(wrappedDomFacade, nodesFactory, documentWriter);

	return {
		executionParameters,
		dynamicContext,
		expression
	};
}

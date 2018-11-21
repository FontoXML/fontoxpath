import adaptJavaScriptValueToXPathValue from '../expressions/adaptJavaScriptValueToXPathValue';
import DynamicContext from '../expressions/DynamicContext';
import DomFacade from '../DomFacade';
import ExecutionParameters from '../expressions/ExecutionParameters';
import domBackedDomFacade from '../domBackedDomFacade';
import Expression from '../expressions/Expression';
import Sequence from '../expressions/dataTypes/Sequence';
import staticallyCompileXPath from '../parsing/staticallyCompileXPath';
import { generateGlobalVariableBindingName } from '../expressions/ExecutionSpecificStaticContext';

/**
 * @param   {Node|*}  contextItem
 * @return  {function(string):?string}
 */
function createDefaultNamespaceResolver (contextItem) {
	if (!contextItem || typeof contextItem !== 'object' || !('lookupNamespaceURI' in contextItem)) {
		return (_prefix) => null;
	}
	return prefix => (/** @type {Node} */(contextItem)).lookupNamespaceURI(prefix || null);
}

function normalizeEndOfLines (xpathString) {
	// Replace all character sequences of 0xD followed by 0xA and all 0xD not followed by 0xA with 0xA.
	return xpathString.replace(/(\x0D\x0A)|(\x0D(?!\x0A))/g, String.fromCharCode(0xA));
}

const warningNodesFactory = {
	createElementNS: () => {
		throw new Error('Please pass a node factory if an XQuery script uses node constructors');
	},
	createTextNode: () => {
		throw new Error('Please pass a node factory if an XQuery script uses node constructors');
	},
	createComment: () => {
		throw new Error('Please pass a node factory if an XQuery script uses node constructors');
	},
	createProcessingInstruction: () => {
		throw new Error('Please pass a node factory if an XQuery script uses node constructors');
	},
	createAttributeNS: () => {
		throw new Error('Please pass a node factory if an XQuery script uses node constructors');
	}
};

/**
 * @param  {!string}      expressionString  The updateScript to execute. Supports XPath 3.1.
 * @param  {*}            contextItem  The initial context for the script
 * @param  {?IDomFacade}  domFacade  The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {!Object}      variables  Extra variables (name=>value). Values can be number / string or boolean.
 * @param  {!Object}      options  Extra options for evaluating this expression
 * @param  {!Object}      compilationOptions  Extra options for compiling this expression
*
* @return {{expression: !Expression, dynamicContext: !DynamicContext, executionParameters: !ExecutionParameters}}
 */
export default function buildEvaluationContext (expressionString, contextItem, domFacade, variables, options, compilationOptions) {
	if (variables === null || variables === undefined) {
		variables = /** @type {!Object} */(variables || {});
	}
	options = /** @type {!Object} */(options || { namespaceResolver: null, nodesFactory: null, language: 'XPath3.1', moduleImports: {} });
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

	const contextSequence = contextItem ? adaptJavaScriptValueToXPathValue(contextItem) : Sequence.empty();

	/**
	 * @type {INodesFactory}
	 */
	let nodesFactory = options['nodesFactory'];
	if (!nodesFactory) {
		if (contextItem && 'nodeType' in /** @type {!Node} */(contextItem)) {
			const ownerDocument = /** @type {Document} }*/(contextItem.ownerDocument || contextItem);
			if ((typeof ownerDocument.createElementNS === 'function') &&
				(typeof ownerDocument.createProcessingInstruction === 'function') &&
				(typeof ownerDocument.createTextNode === 'function') &&
				(typeof ownerDocument.createComment === 'function')) {

				nodesFactory = /** @type {!INodesFactory} */({
					createElementNS: ownerDocument.createElementNS.bind(ownerDocument),
					createTextNode: ownerDocument.createTextNode.bind(ownerDocument),
					createComment: ownerDocument.createComment.bind(ownerDocument),
					createProcessingInstruction: ownerDocument.createProcessingInstruction.bind(ownerDocument),
					createAttributeNS: ownerDocument.createAttributeNS.bind(ownerDocument)
				});
			}
		}

		if (!nodesFactory) {
			// We do not have a nodesFactory instance as a parameter, nor can we generate one from the context item.
			// Throw an error as soon as one of these functions is called.
			nodesFactory = warningNodesFactory;
		}
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

	const executionParameters = new ExecutionParameters(wrappedDomFacade, nodesFactory);


	return {
		executionParameters,
		dynamicContext,
		expression
	};
}

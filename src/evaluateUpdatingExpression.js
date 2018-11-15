import parseExpression from './parsing/parseExpression';
import adaptJavaScriptValueToXPathValue from './expressions/adaptJavaScriptValueToXPathValue';
import DynamicContext from './expressions/DynamicContext';
import DomFacade from './DomFacade';
import ExecutionParameters from './expressions/ExecutionParameters';
import domBackedDomFacade from './domBackedDomFacade';

import atomize from './expressions/dataTypes/atomize';
import castToType from './expressions/dataTypes/castToType';
import Sequence from './expressions/dataTypes/Sequence';
import isSubtypeOf from './expressions/dataTypes/isSubtypeOf';
import staticallyCompileXPath from './parsing/staticallyCompileXPath';

import { generateGlobalVariableBindingName } from './expressions/ExecutionSpecificStaticContext';

import { DONE_TOKEN, ready, notReady } from './expressions/util/iterators';

import PendingUpdate from './expressions/xquery-update/PendingUpdate';

import PossiblyUpdatingExpression from './expressions/PossiblyUpdatingExpression';

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

/**
 * Evaluates an XPath on the given contextItem. Returns the string result as if the XPath is wrapped in string(...).
 *
 * @param  {!string}       updateScript     The updateScript to execute. Supports XPath 3.1.
 * @param  {*}             contextItem  The initial context for the script
 * @param  {?IDomFacade=}  domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?Object=}      variables    Extra variables (name=>value). Values can be number / string or boolean.
 * @param  {?Object=}      options      Extra options for evaluating this XPath
 *
 * @return  {Promise<{updateList: Array<Object>, result: Object}>}         The string result.
 */
export default async function evaluateUpdatingExpression (updateScript, contextItem, domFacade, variables, options) {
	variables = variables || {};
	if (!domFacade) {
		domFacade = domBackedDomFacade;
	}
	updateScript = normalizeEndOfLines(updateScript);
	// Always wrap in an actual domFacade
	const wrappedDomFacade = new DomFacade(domFacade);

	const moduleImports = options['moduleImports'] || Object.create(null);

	const namespaceResolver = options['namespaceResolver'] || createDefaultNamespaceResolver(contextItem);
	const compiledExpression = 	(/** @type {!PossiblyUpdatingExpression} */(staticallyCompileXPath(
		updateScript,
		{
			allowXQuery: true,
			allowXQueryUpdateFacility: true,
			disableCache: false
		},
		namespaceResolver,
		variables,
		moduleImports)));

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
			nodesFactory = {
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

	const resultIterator = compiledExpression.evaluateWithUpdateList(dynamicContext, executionParameters);

	const attempt = resultIterator.next();
	while (!attempt.ready) {
		await attempt.promise;
	}

	return {
		'result': attempt.value.xdmValue,
		'pendingUpdateList': attempt.value.pendingUpdateList.map(update => update.toTransferable())
	};
}

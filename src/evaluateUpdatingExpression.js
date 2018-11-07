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
 * @param  {any }          contextItem  The initial context for the script
 * @param  {?IDomFacade=}  domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?Object=}      variables    Extra variables (name=>value). Values can be number / string or boolean.
 * @param  {?Object=}      options      Extra options for evaluating this XPath
 *
 * @return  {Promise<{updateList: pendingUpdate[], result: Object}>}         The string result.
 */
export default async function evaluateUpdatingExpression (updateScript, contextItem, domFacade, variables, options) {
	variables = variables || {};
	updateScript = normalizeEndOfLines(updateScript);
	// Always wrap in an actual domFacade
	const wrappedDomFacade = new DomFacade(domFacade);

	const moduleImports = options['moduleImports'] || Object.create(null);

	const namespaceResolver = options['namespaceResolver'] || createDefaultNamespaceResolver(contextItem);
	const compiledExpression = staticallyCompileXPath(
		updateScript,
		{
			allowXQuery: true,
			allowXQueryUpdateFacility: true
		},
		namespaceResolver,
		variables,
		moduleImports);

	const contextSequence = contextItem ? adaptJavaScriptValueToXPathValue(contextItem) : Sequence.empty();

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

		/**
	 * @type {INodesFactory}
	 */
	let nodesFactory = options['nodesFactory'];

	const executionParameters = new ExecutionParameters(wrappedDomFacade, nodesFactory);

	const resultIterator = compiledExpression.evaluateWithUpdateList(dynamicContext, executionParameters);

	let attempt = resultIterator.next();
	while (!attempt.ready) {
		await attempt.promise;
	}

	return attempt.value;
}

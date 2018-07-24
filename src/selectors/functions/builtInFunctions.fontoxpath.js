import DynamicContext from '../DynamicContext';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';
import createAtomicValue from '../dataTypes/createAtomicValue';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import { DONE_TOKEN, ready, notReady } from '../util/iterators';

import { FONTOXPATH_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import StaticContext from '../StaticContext';
import ExecutionSpecificStaticContext from '../ExecutionSpecificStaticContext';

/**
 * @param  {!../DynamicContext}      dynamicContext
 * @param  {!../ExecutionParameters} executionParameters
 * @param  {!../dataTypes/Sequence}  query
 * @param  {!../dataTypes/Sequence}  args
 */
function fontoxpathEvaluate (dynamicContext, executionParameters, _staticContext, query, args) {
	let resultIterator;
	let queryString;
	return new Sequence({
		next: () => {
			if (!resultIterator) {
				const queryValue = query.value().next();
				if (!queryValue.ready) {
					return queryValue;
				}
				queryString = queryValue.value.value;
				const variables = args.first().keyValuePairs.reduce((expandedArgs, arg) => {
					expandedArgs[arg.key.value] = `GLOBAL_${arg.key.value}`;
					return expandedArgs;
				}, {});

				// Take off the context item
				const contextItemSequence = variables['.'] ? variables['.']() : Sequence.empty();
				delete variables['.'];

				const selector = executionParameters.createSelectorFromXPath(queryString, { allowXQuery: false });
				selector.performStaticEvaluation(
					new StaticContext(
						new ExecutionSpecificStaticContext(
							() => null,
							args.first().keyValuePairs.reduce((expandedArgs, arg) => {
								expandedArgs[arg.key.value] = createDoublyIterableSequence(arg.value);
								return expandedArgs;
							}, variables))));

				const context = contextItemSequence.isEmpty() ? {
					contextItem: null,
					contextSequence: contextItemSequence,
					contextItemIndex: -1,
					variableBindings: variables,
					domFacade: executionParameters.domFacade,
					resolveNamespacePrefix: dynamicContext.resolveNamespacePrefix,
					createSelectorFromXPath: dynamicContext.createSelectorFromXPath
				} : {
					contextItem: contextItemSequence.first(),
					contextSequence: contextItemSequence,
					contextItemIndex: 0,
					variableBindings: variables,
					domFacade: executionParameters.domFacade,
					resolveNamespacePrefix: dynamicContext.resolveNamespacePrefix,
					createSelectorFromXPath: dynamicContext.createSelectorFromXPath
				};
				const innerDynamicContext = new DynamicContext(context);

				resultIterator = selector.evaluate(innerDynamicContext, executionParameters).value();
			}
			return resultIterator.next();

		}
	});
}

/**
 * @param   {../DynamicContext}  _dynamicContext
 * @param  {!../ExecutionParameters} _executionParameters
 * @param   {!Sequence}           val
 * @param   {!Sequence}           howLong
 * @return  {!Sequence}
 */
function fontoxpathSleep (_dynamicContext, _executionParameters, _staticContext, val, howLong) {
	let doneWithSleep = false;
	let readyPromise;

	const valueIterator = val.value();
	return new Sequence({
		next: () => {
			if (!readyPromise) {
				/**
				 * @type {!../util/iterators.AsyncResult}
				 */
				const time = howLong ? howLong.tryGetFirst() : ready(createAtomicValue(0, 'xs:integer'));
				if (!time.ready) {
					return notReady(readyPromise);
				}
				readyPromise = new Promise(
					resolve => setTimeout(() => {
						doneWithSleep = true;
						resolve();
					}, time.value.value)
				);
			}
			if (!doneWithSleep) {
				return notReady(readyPromise);
			}
			return valueIterator.next();
		}
	});
}

function fontoxpathFetch (_dynamicContext, _executionParameters, _staticContext, url) {
	let doneWithFetch = false;
	let result = null;
	let done = false;
	let readyPromise = null;

	return new Sequence({
		next: () => {
			if (!readyPromise) {
				const urlValue = url.value().next();
				if (!urlValue.ready) {
					return urlValue;
				}
				readyPromise = fetch(urlValue.value.value)
					.then(response => response.text())
					.then(text => new DOMParser().parseFromString(text, 'application/xml'))
					.then(doc => {
						doneWithFetch = true;
						result = doc;
					});
			}
			if (!doneWithFetch) {
				return notReady(readyPromise);
			}
			if (!done) {
				done = true;
				return ready(createNodeValue(result));
			}
			return DONE_TOKEN;
		}
	});
}

export default {
	declarations: [
		{
			namespaceURI: FONTOXPATH_NAMESPACE_URI,
			localName: 'evaluate',
			argumentTypes: ['xs:string', 'map(*)'],
			returnType: 'item()*',
			callFunction: fontoxpathEvaluate
		},
		{
			namespaceURI: FONTOXPATH_NAMESPACE_URI,
			localName: 'sleep',
			argumentTypes: ['item()*', 'xs:numeric'],
			returnType: 'item()*',
			callFunction: fontoxpathSleep
		},
		{
			namespaceURI: FONTOXPATH_NAMESPACE_URI,
			localName: 'sleep',
			argumentTypes: ['item()*'],
			returnType: 'item()*',
			callFunction: fontoxpathSleep
		},
		{
			namespaceURI: FONTOXPATH_NAMESPACE_URI,
			localName: 'fetch',
			argumentTypes: ['xs:string', 'map(*)'],
			returnType: 'item()*',
			callFunction: fontoxpathFetch
		},
		{
			namespaceURI: FONTOXPATH_NAMESPACE_URI,
			localName: 'fetch',
			argumentTypes: ['xs:string'],
			returnType: 'item()*',
			callFunction: fontoxpathFetch
		}

	]
};

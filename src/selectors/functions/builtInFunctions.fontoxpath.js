import DynamicContext from '../DynamicContext';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';

/**
 * @param  {../DynamicContext}      dynamicContext
 * @param  {../dataTypes/Sequence}  query
 * @param  {../dataTypes/Sequence}  args
 */
function fontoxpathEvaluate (dynamicContext, query, args) {
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
				const variables = {};
				args.first().keyValuePairs.reduce((expandedArgs, arg) => {
					expandedArgs[arg.key.value] = arg.value;
					return expandedArgs;
				}, variables);

				// Take off the context item
				const contextItemSequence = variables['.'] || Sequence.empty();
				delete variables['.'];

				const selector = dynamicContext.createSelectorFromXPath(queryString);
				const context = contextItemSequence.isEmpty() ? {
					contextItem: null,
					contextSequence: contextItemSequence,
					contextItemIndex: -1,
					variables,
					domFacade: dynamicContext.domFacade,
					resolveNamespacePrefix: dynamicContext.resolveNamespacePrefix,
					createSelectorFromXPath: dynamicContext.createSelectorFromXPath
				} : {
					contextItem: contextItemSequence.first(),
					contextSequence: contextItemSequence,
					contextItemIndex: 0,
					variables,
					domFacade: dynamicContext.domFacade,
					resolveNamespacePrefix: dynamicContext.resolveNamespacePrefix,
					createSelectorFromXPath: dynamicContext.createSelectorFromXPath
				};
				const innerDynamicContext = new DynamicContext(context);

				resultIterator = selector.evaluate(innerDynamicContext);
			}
			return resultIterator.next();

		}
	});
}


function fontoxpathSleep (_dynamicContext, howLong, val = Sequence.empty()) {
	let ready = false;
	const readyPromise = new Promise(
		resolve => setTimeout(() => {
			ready = true;
			resolve();
		}, howLong.first().value)
	);

	const valueIterator = val.value();
	return new Sequence({
		next: () => {
			if (!ready) {
				return { done: false, value: undefined, ready: false, promise: readyPromise };
			}
			return valueIterator.next();
		}
	});
}

function fontoxpathFetch (_dynamicContext, url) {
	let ready = false;
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
						ready = true;
						result = doc;
					});
			}
			if (!ready) {
				return { done: false, value: undefined, ready: false, promise: readyPromise };
			}
			if (!done) {
				done = true;
				return { done: false, ready: true, value: createNodeValue(result) };
			}
			return { done: true, value: undefined, ready: true, promise: undefined };
		}
	});
}

export default {
	declarations: [
		{
			name: 'fontoxpath:evaluate',
			argumentTypes: ['xs:string', 'map(*)'],
			returnType: 'item()*',
			callFunction: fontoxpathEvaluate
		},
		{
			name: 'fontoxpath:sleep',
			argumentTypes: ['xs:numeric', 'item()*'],
			returnType: 'item()*',
			callFunction: fontoxpathSleep
		},
		{
			name: 'fontoxpath:sleep',
			argumentTypes: ['xs:numeric'],
			returnType: 'item()*',
			callFunction: fontoxpathSleep
		},
		{
			name: 'fontoxpath:fetch',
			argumentTypes: ['xs:string', 'map(*)'],
			returnType: 'item()*',
			callFunction: fontoxpathFetch
		},
		{
			name: 'fontoxpath:fetch',
			argumentTypes: ['xs:string'],
			returnType: 'item()*',
			callFunction: fontoxpathFetch
		}

	]
};

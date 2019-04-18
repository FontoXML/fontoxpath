import createAtomicValue from '../dataTypes/createAtomicValue';
import createNodeValue from '../dataTypes/createNodeValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import DynamicContext from '../DynamicContext';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import { AsyncIterator, DONE_TOKEN, IterationHint, notReady, ready } from '../util/iterators';

import { FONTOXPATH_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import compileAstToExpression from '../../parsing/compileAstToExpression';
import parseExpression from '../../parsing/parseExpression';

import ExecutionSpecificStaticContext from '../ExecutionSpecificStaticContext';
import StaticContext from '../StaticContext';
import FunctionDefinitionType from './FunctionDefinitionType';

import astHelper from '../../parsing/astHelper';
import MapValue from '../dataTypes/MapValue';
import Value from '../dataTypes/Value';

const fontoxpathEvaluate: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	staticContext,
	query,
	args
) => {
	let resultIterator: AsyncIterator<Value>;
	let queryString: string;
	return sequenceFactory.create({
		next: () => {
			if (!resultIterator) {
				const queryValue = query.value.next(IterationHint.NONE);
				if (!queryValue.ready) {
					return queryValue;
				}
				queryString = queryValue.value.value;
				const variables = (args.first() as MapValue).keyValuePairs.reduce(
					(expandedArgs, arg) => {
						expandedArgs[arg.key.value] = createDoublyIterableSequence(arg.value());
						return expandedArgs;
					},
					Object.create(null)
				);

				// Take off the context item
				const contextItemSequence = variables['.']
					? variables['.']()
					: sequenceFactory.empty();
				delete variables['.'];

				const ast = parseExpression(queryString, { allowXQuery: false });
				const queryBodyContents = astHelper.followPath(ast, [
					'mainModule',
					'queryBody',
					'*'
				]);

				const selector = compileAstToExpression(queryBodyContents, {
					allowUpdating: false,
					allowXQuery: false
				});
				const executionSpecificStaticContext = new ExecutionSpecificStaticContext(
					prefix => staticContext.resolveNamespace(prefix),
					Object.keys(variables).reduce((vars, varName) => {
						vars[varName] = varName;
						return vars;
					}, {})
				);

				selector.performStaticEvaluation(new StaticContext(executionSpecificStaticContext));

				const variableBindings = Object.keys(variables).reduce(
					(variablesByBindingKey, varName) => {
						variablesByBindingKey[
							executionSpecificStaticContext.lookupVariable(null, varName)
						] = variables[varName];
						return variablesByBindingKey;
					},
					Object.create(null)
				);

				const context = contextItemSequence.isEmpty()
					? {
							contextItem: null,
							contextItemIndex: -1,
							contextSequence: contextItemSequence,
							variableBindings
					  }
					: {
							contextItem: contextItemSequence.first(),
							contextItemIndex: 0,
							contextSequence: contextItemSequence,
							variableBindings
					  };

				const innerDynamicContext = new DynamicContext(context);

				resultIterator = selector.evaluate(innerDynamicContext, executionParameters).value;
			}
			return resultIterator.next(IterationHint.NONE);
		}
	});
};

const fontoxpathSleep: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	val,
	howLong
) => {
	let doneWithSleep = false;
	let readyPromise: Promise<{}>;

	const valueIterator = val.value;
	return sequenceFactory.create({
		next: (hint: IterationHint) => {
			if (!readyPromise) {
				const time = howLong
					? howLong.tryGetFirst()
					: ready(createAtomicValue(0, 'xs:integer'));
				if (!time.ready) {
					return notReady(readyPromise);
				}
				readyPromise = new Promise(resolve =>
					setTimeout(() => {
						doneWithSleep = true;
						resolve();
					}, time.value.value)
				);
			}
			if (!doneWithSleep) {
				return notReady(readyPromise);
			}
			return valueIterator.next(hint);
		}
	});
};

declare const VERSION: string | undefined;

const fontoxpathVersion: FunctionDefinitionType = () => {
	let version: string;
	// TODO: Refactor when https://github.com/google/closure-compiler/issues/1601 is fixed
	if (typeof VERSION === 'undefined') {
		version = 'devbuild';
	} else {
		version = VERSION;
	}
	return sequenceFactory.singleton(createAtomicValue(version, 'xs:string'));
};

// TODO: implement a domparser instead of using the global one from the browser
declare var DOMParser;
declare var fetch;

const fontoxpathFetch: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	url
) => {
	let doneWithFetch = false;
	let result = null;
	let done = false;
	let readyPromise = null;

	return sequenceFactory.create({
		next: () => {
			if (!readyPromise) {
				const urlValue = url.value.next(IterationHint.NONE);
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
};

export default {
	declarations: [
		{
			argumentTypes: ['xs:string', 'map(*)'],
			callFunction: fontoxpathEvaluate,
			localName: 'evaluate',
			namespaceURI: FONTOXPATH_NAMESPACE_URI,
			returnType: 'item()*'
		},
		{
			argumentTypes: ['item()*', 'xs:numeric'],
			callFunction: fontoxpathSleep,
			localName: 'sleep',
			namespaceURI: FONTOXPATH_NAMESPACE_URI,
			returnType: 'item()*'
		},
		{
			argumentTypes: ['item()*'],
			callFunction: fontoxpathSleep,
			localName: 'sleep',
			namespaceURI: FONTOXPATH_NAMESPACE_URI,
			returnType: 'item()*'
		},
		{
			argumentTypes: ['xs:string', 'map(*)'],
			callFunction: fontoxpathFetch,
			localName: 'fetch',
			namespaceURI: FONTOXPATH_NAMESPACE_URI,
			returnType: 'item()*'
		},
		{
			argumentTypes: ['xs:string'],
			callFunction: fontoxpathFetch,
			localName: 'fetch',
			namespaceURI: FONTOXPATH_NAMESPACE_URI,
			returnType: 'item()*'
		},
		{
			argumentTypes: [],
			callFunction: fontoxpathVersion,
			localName: 'version',
			namespaceURI: FONTOXPATH_NAMESPACE_URI,
			returnType: 'xs:string'
		}
	]
};

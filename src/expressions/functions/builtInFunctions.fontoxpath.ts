import DynamicContext from '../DynamicContext';
import SequenceFactory from '../dataTypes/SequenceFactory';
import createNodeValue from '../dataTypes/createNodeValue';
import createAtomicValue from '../dataTypes/createAtomicValue';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import { DONE_TOKEN, ready, notReady } from '../util/iterators';

import { FONTOXPATH_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import compileAstToExpression from '../../parsing/compileAstToExpression';
import parseExpression from '../../parsing/parseExpression';

import StaticContext from '../StaticContext';
import ExecutionSpecificStaticContext from '../ExecutionSpecificStaticContext';
import FunctionDefinitionType from './FunctionDefinitionType';

import astHelper from '../../parsing/astHelper';
import MapValue from '../dataTypes/MapValue';
import Value from '../dataTypes/Value';

const fontoxpathEvaluate: FunctionDefinitionType = function(
	_dynamicContext,
	executionParameters,
	staticContext,
	query,
	args
) {
	let resultIterator;
	let queryString;
	return SequenceFactory.create({
		next: () => {
			if (!resultIterator) {
				const queryValue = query.value.next();
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
					: SequenceFactory.empty();
				delete variables['.'];

				const ast = parseExpression(queryString, { allowXQuery: false });
				const queryBodyContents = astHelper.followPath(ast, [
					'mainModule',
					'queryBody',
					'*'
				]);

				const selector = compileAstToExpression(queryBodyContents, {
					allowXQuery: false,
					allowUpdating: false
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
							contextSequence: contextItemSequence,
							contextItemIndex: -1,
							variableBindings: variableBindings
					  }
					: {
							contextItem: contextItemSequence.first(),
							contextSequence: contextItemSequence,
							contextItemIndex: 0,
							variableBindings: variableBindings
					  };

				const innerDynamicContext = new DynamicContext(context);

				resultIterator = selector.evaluate(innerDynamicContext, executionParameters).value;
			}
			return resultIterator.next();
		}
	});
};

const fontoxpathSleep: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	val,
	howLong
) {
	let doneWithSleep = false;
	let readyPromise;

	const valueIterator = val.value;
	return SequenceFactory.create({
		next: () => {
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
			return valueIterator.next();
		}
	});
};

declare const VERSION: string | undefined;

const fontoxpathVersion: FunctionDefinitionType = function() {
	let version;
	// TODO: Refactor when https://github.com/google/closure-compiler/issues/1601 is fixed
	if (typeof VERSION === 'undefined') {
		version = 'devbuild';
	} else {
		version = VERSION;
	}
	return SequenceFactory.singleton(createAtomicValue(version, 'xs:string'));
};

const fontoxpathFetch: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	url
) {
	let doneWithFetch = false;
	let result = null;
	let done = false;
	let readyPromise = null;

	return SequenceFactory.create({
		next: () => {
			if (!readyPromise) {
				const urlValue = url.value.next();
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
		},
		{
			namespaceURI: FONTOXPATH_NAMESPACE_URI,
			localName: 'version',
			argumentTypes: [],
			returnType: 'xs:string',
			callFunction: fontoxpathVersion
		}
	]
};

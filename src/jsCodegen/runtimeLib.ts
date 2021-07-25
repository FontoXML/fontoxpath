import { adaptSingleJavaScriptValue } from '../expressions/adaptJavaScriptValueToXPathValue';
import atomize from '../expressions/dataTypes/atomize';
import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import sequenceFactory from '../expressions/dataTypes/sequenceFactory';
import getEffectiveBooleanValue from '../expressions/dataTypes/Sequences/getEffectiveBooleanValue';
import Value from '../expressions/dataTypes/Value';
import { DONE_TOKEN, IterationResult, ready } from '../expressions/util/iterators';
import convertXDMReturnValue from '../parsing/convertXDMReturnValue';

export function determinePredicateTruthValue(iterator: { next: () => IterationResult<Value> }) {
	if (!iterator.next) {
		return Boolean(iterator);
	}
	const firstResult = iterator.next();
	if (firstResult.done) {
		return false;
	}

	return getEffectiveBooleanValue(firstResult.value);
}

// Make sure Closure Compiler does not change property names.
declare interface IRuntimeLib {
	adaptSingleJavaScriptValue: typeof adaptSingleJavaScriptValue;
	atomize: typeof atomize;
	determinePredicateTruthValue: typeof determinePredicateTruthValue;
	DONE_TOKEN: typeof DONE_TOKEN;
	getEffectiveBooleanValue: typeof getEffectiveBooleanValue;
	isSubtypeOf: typeof isSubtypeOf;
	ready: typeof ready;
	sequenceFactory: typeof sequenceFactory;
	Value: typeof Value;
	convertXDMReturnValue: typeof convertXDMReturnValue;
}

const runtimeLib: IRuntimeLib = {
	adaptSingleJavaScriptValue,
	atomize,
	determinePredicateTruthValue,
	DONE_TOKEN,
	getEffectiveBooleanValue,
	isSubtypeOf,
	ready,
	sequenceFactory,
	Value,
	convertXDMReturnValue,
};

export default runtimeLib;

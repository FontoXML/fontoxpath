import { adaptSingleJavaScriptValue } from '../expressions/adaptJavaScriptValueToXPathValue';
import atomize, { atomizeSingleValue } from '../expressions/dataTypes/atomize';
import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import getEffectiveBooleanValue from '../expressions/dataTypes/Sequences/getEffectiveBooleanValue';
import Value from '../expressions/dataTypes/Value';
import { DONE_TOKEN, IterationResult, ready } from '../expressions/util/iterators';
import { XPDY0002 } from '../expressions/XPathErrors';

export function determinePredicateTruthValue(iterator: { next: () => IterationResult<Value> }) {
	if (typeof iterator === 'boolean') {
		return iterator;
	} else if (typeof iterator === 'string') {
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
}

const runtimeLib: IRuntimeLib = {
	adaptSingleJavaScriptValue,
	atomize,
	determinePredicateTruthValue,
	DONE_TOKEN,
	getEffectiveBooleanValue,
	isSubtypeOf,
	ready,
};

export default runtimeLib;

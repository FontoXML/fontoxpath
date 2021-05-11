import { adaptSingleJavaScriptValue } from '../expressions/adaptJavaScriptValueToXPathValue';
import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import getEffectiveBooleanValue from '../expressions/dataTypes/Sequences/getEffectiveBooleanValue';
import Value, { ValueType } from '../expressions/dataTypes/Value';
import { DONE_TOKEN, IterationResult, ready } from '../expressions/util/iterators';
import { XPDY0002 } from '../expressions/XPathErrors';

export function determinePredicateTruthValue(iterator: { next: () => IterationResult<Value> }) {
	if (typeof iterator === 'boolean') {
		return iterator;
	}

	const firstResult = iterator.next();
	if (firstResult.done) {
		return false;
	}

	return getEffectiveBooleanValue(firstResult.value);
}

export {
	ready,
	DONE_TOKEN,
	isSubtypeOf,
	getEffectiveBooleanValue,
	adaptSingleJavaScriptValue,
	XPDY0002,
	ValueType,
};

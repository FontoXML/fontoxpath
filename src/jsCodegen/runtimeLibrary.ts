import { NODE_TYPES } from '../domFacade/ConcreteNode';
import { adaptSingleJavaScriptValue } from '../expressions/adaptJavaScriptValueToXPathValue';
import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import getEffectiveBooleanValue from '../expressions/dataTypes/Sequences/getEffectiveBooleanValue';
import { DONE_TOKEN, ready } from '../expressions/util/iterators';

export function determinePredicateTruthValue(iterator) {
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
	NODE_TYPES,
	ready,
	DONE_TOKEN,
	isSubtypeOf,
	getEffectiveBooleanValue,
	adaptSingleJavaScriptValue,
};

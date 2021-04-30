import { NODE_TYPES } from '../domFacade/ConcreteNode';
import { adaptSingleJavaScriptValue } from '../expressions/adaptJavaScriptValueToXPathValue';
import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import getEffectiveBooleanValue from '../expressions/dataTypes/Sequences/getEffectiveBooleanValue';
import { errFORG0006 } from '../expressions/functions/FunctionOperationErrors';
import { DONE_TOKEN, ready } from '../expressions/util/iterators';

export function determinePredicateTruthValue(iterator) {
	// TODO: maybe handle this in generated code instead?
	if (typeof iterator === 'boolean') {
		return iterator;
	}

	const firstResult = iterator.next();
	if (firstResult.done) {
		return false;
	}
	if (isSubtypeOf(firstResult.value.type, 'node()')) {
		return true;
	}

	const secondResult = iterator.next();
	if (!secondResult.done) {
		throw errFORG0006();
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

import { adaptSingleJavaScriptValue } from '../expressions/adaptJavaScriptValueToXPathValue';
import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import getEffectiveBooleanValue from '../expressions/dataTypes/Sequences/getEffectiveBooleanValue';
import Value from '../expressions/dataTypes/Value';
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

const runtimeLib = {
	['DONE_TOKEN']: DONE_TOKEN,
	['XPDY0002']: XPDY0002,
	['adaptSingleJavaScriptValue']: adaptSingleJavaScriptValue,
	['determinePredicateTruthValue']: determinePredicateTruthValue,
	['getEffectiveBooleanValue']: getEffectiveBooleanValue,
	['isSubtypeOf']: isSubtypeOf,
	['ready']: ready,
};

export default runtimeLib;

import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import getEffectiveBooleanValue from '../expressions/dataTypes/Sequences/getEffectiveBooleanValue';
import { errFORG0006 } from '../expressions/functions/FunctionOperationErrors';
import { DONE_TOKEN, ready } from '../expressions/util/iterators';
// import {NODE_TYPES} from '../domFacade/ConcreteNode';

const NODE_TYPES = {
	ELEMENT_NODE: 1,
	ATTRIBUTE_NODE: 2,
	TEXT_NODE: 3,
	CDATA_SECTION_NODE: 4,
	PROCESSING_INSTRUCTION_NODE: 7,
	COMMENT_NODE: 8,
	DOCUMENT_NODE: 9,
	DOCUMENT_TYPE_NODE: 10,
	DOCUMENT_FRAGMENT_NODE: 11,
};

function determinePredicateTruthValue(iterator) {
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

export { NODE_TYPES, ready, DONE_TOKEN, isSubtypeOf, getEffectiveBooleanValue, determinePredicateTruthValue };

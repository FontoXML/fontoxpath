import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';
import atomize from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import builtInFunctionsNode from './builtInFunctions.node';
import createSingleValueIterator from '../util/createSingleValueIterator';

import { DONE_TOKEN, notReady, ready } from '../util/iterators';

/**
 * @type {function(../DynamicContext, ../dataTypes/Sequence):../dataTypes/Sequence}
 */
const nodeName = builtInFunctionsNode.functions.nodeName;

/**
* @typedef {../util/iterators.AsyncIterator}
*/
let AsyncIterator;

/**
 * @template T
 * @param  {!Array<T>}                                      items
 * @param  {!function(T, number, Array<T>):AsyncIterator}  cb
 * @return {AsyncIterator}
 */
function asyncGenerateEvery (items, cb) {
	let i = 0;
	const l = items.length;
	let done = false;
	let filterGenerator = null;
	return {
		next: () => {
			if (!done) {
				while (i < l) {
					if (!filterGenerator) {
						filterGenerator = cb(items[i], i, items);
					}
					const filterResult = filterGenerator.next();
					if (!filterResult.ready) {
						return filterResult;
					}
					filterGenerator = null;
					if (filterResult.value) {
						i++;
						continue;
					}
					return ready(false);
				}
				done = true;
				return ready(true);

			}
			return DONE_TOKEN;
		}
	};
}

function filterElementAndTextNodes (node) {
	return node.nodeType === node.ELEMENT_NODE || node.nodeType === node.TEXT_NODE;
}

function anyAtomicTypeDeepEqual (_dynamicContext, item1, item2) {
	if ((isSubtypeOf(item1.type, 'xs:decimal') || isSubtypeOf(item1.type, 'xs:float')) &&
		(isSubtypeOf(item2.type, 'xs:decimal') || isSubtypeOf(item2.type, 'xs:float'))) {
		const temp1 = castToType(item1, 'xs:float');
		const temp2 = castToType(item2, 'xs:float');
		return temp1.value === temp2.value || (isNaN(item1.value) && isNaN(item2.value));
	}
	if (
		(isSubtypeOf(item1.type, 'xs:decimal') || isSubtypeOf(item1.type, 'xs:float') || isSubtypeOf(item1.type, 'xs:double')) &&
			(isSubtypeOf(item2.type, 'xs:decimal') || isSubtypeOf(item2.type, 'xs:float') || isSubtypeOf(item2.type, 'xs:double'))) {
		const temp1 = castToType(item1, 'xs:double'),
		temp2 = castToType(item2, 'xs:double');
		return temp1.value === temp2.value || (isNaN(item1.value) && isNaN(item2.value));
	}
	if (isSubtypeOf(item1.type, 'xs:QName') && isSubtypeOf(item2.type, 'xs:QName')) {
		return item1.value.namespaceURI === item2.value.namespaceURI &&
			item1.value.localPart === item2.value.localPart;
	}
	return item1.value === item2.value;
}

/**
 * @param   {../DynamicContext}  dynamicContext
 * @param   {!Sequence}             sequence1
 * @param   {!Sequence}             sequence2
 * @return  {!AsyncIterator}
 */
function sequenceDeepEqual (dynamicContext, sequence1, sequence2) {
	const it1 = sequence1.value();
	const it2 = sequence2.value();
	let item1 = null;
	let item2 = null;
	let comparisonGenerator = null;
	let done;
	return {
		next: () => {
			while (!done) {
				if (!item1) {
					item1 = it1.next();
				}
				if (!item2) {
					item2 = it2.next();
				}

				if (!item1.ready) {
					const oldItem = item1;
					item1 = null;
					return notReady(oldItem.promise);
				}
				if (!item2.ready) {
					const oldItem = item2;
					item2 = null;
					return notReady(oldItem.promise);
				}

				if (item1.done || item2.done) {
					done = true;
					return ready(item1.done === item2.done);
				}
				if (!comparisonGenerator) {
					comparisonGenerator = itemDeepEqual(dynamicContext, item1.value, item2.value);
				}
				const comparisonResult = comparisonGenerator.next();
				if (!comparisonResult.ready) {
					return comparisonResult;
				}
				comparisonGenerator = null;
				if (comparisonResult.value === false) {
					done = true;
					return comparisonResult;
				}
				// Compare next one
				item1 = null;
				item2 = null;
			}
			return DONE_TOKEN;
		}
	};
}

/**
 * @param   {../DynamicContext}   dynamicContext
 * @param   {../dataTypes/MapValue}  item1
 * @param   {../dataTypes/MapValue}  item2
 * @return  {AsyncIterator}
 */
function mapTypeDeepEqual (dynamicContext, item1, item2) {
	if (item1.keyValuePairs.length !== item2.keyValuePairs.length) {
		return createSingleValueIterator(false);
	}

	return asyncGenerateEvery(item1.keyValuePairs, mapEntry1 => {
		const mapEntry2 = item2.keyValuePairs.find((entry) => anyAtomicTypeDeepEqual(dynamicContext, entry.key, mapEntry1.key));

		if (!mapEntry2) {
			return createSingleValueIterator(false);
		}

		return sequenceDeepEqual(dynamicContext, mapEntry1.value, mapEntry2.value);
	});
}

/**
 * @param   {../DynamicContext}   dynamicContext
 * @param   {../dataTypes/ArrayValue}  item1
 * @param   {../dataTypes/ArrayValue}  item2
 * @return  {AsyncIterator}
 */
function arrayTypeDeepEqual (dynamicContext, item1, item2) {
	if (item1.members.length !== item2.members.length) {
		return createSingleValueIterator(false);
	}

	return asyncGenerateEvery(item1.members, (arrayEntry1, index) => {
		const arrayEntry2 = item2.members[index];
		return sequenceDeepEqual(dynamicContext, arrayEntry1, arrayEntry2);
	});
}

/**
 * @param   {../DynamicContext}   dynamicContext
 * @param   {../dataTypes/Value}  item1
 * @param   {../dataTypes/Value}  item2
 * @return  {AsyncIterator}
 */
function nodeDeepEqual (dynamicContext, item1, item2) {
	let item1Nodes = dynamicContext.domFacade.getChildNodes(item1.value);
	let item2Nodes = dynamicContext.domFacade.getChildNodes(item2.value);

	item1Nodes = item1Nodes.filter(filterElementAndTextNodes);
	item2Nodes = item2Nodes.filter(filterElementAndTextNodes);

	item1Nodes = new Sequence(item1Nodes.map(createNodeValue));
	item2Nodes = new Sequence(item2Nodes.map(createNodeValue));

	return sequenceDeepEqual(dynamicContext, item1Nodes, item2Nodes);
}

/**
 * @param   {../DynamicContext}   dynamicContext
 * @param   {../dataTypes/Value}  item1
 * @param   {../dataTypes/Value}  item2
 * @return  {AsyncIterator}
 */
function elementNodeDeepEqual (dynamicContext, item1, item2) {
	const namesAreEqualResultGenerator = sequenceDeepEqual(
		dynamicContext,
		nodeName(dynamicContext, Sequence.singleton(item1)),
		nodeName(dynamicContext, Sequence.singleton(item2)));
	const nodeDeepEqualGenerator = nodeDeepEqual(dynamicContext, item1, item2);
	const attributes1 = dynamicContext.domFacade.getAllAttributes(item1.value)
		.filter(attr => attr.namespaceURI !== 'http://www.w3.org/2000/xmlns/')
		.sort((attrA, attrB) => attrA.name > attrB.name ? 1 : -1)
		.map(attr => createNodeValue(attr));

	const attributes2 = dynamicContext.domFacade.getAllAttributes(item2.value)
		.filter(attr => attr.namespaceURI !== 'http://www.w3.org/2000/xmlns/')
		.sort((attrA, attrB) => attrA.name > attrB.name ? 1 : -1)
		.map(attr => createNodeValue(attr));

	const attributesDeepEqualGenerator = sequenceDeepEqual(
		dynamicContext,
		new Sequence(attributes1),
		new Sequence(attributes2));
	let done = false;
	return {
		next: () => {
			if (done) {
				return DONE_TOKEN;
			}
			const namesAreEqualResult = namesAreEqualResultGenerator.next();
			if (!namesAreEqualResult.ready) {
				return namesAreEqualResult;
			}
			if (!namesAreEqualResult.done && namesAreEqualResult.value === false) {
				done = true;
				return namesAreEqualResult;
			}

			const attributesEqualResult = attributesDeepEqualGenerator.next();
			if (!attributesEqualResult.ready) {
				return attributesEqualResult;
			}
			if (!attributesEqualResult.done && attributesEqualResult.value === false) {
				done = true;
				return attributesEqualResult;
			}

			const contentsEqualResult = nodeDeepEqualGenerator.next();
			if (!contentsEqualResult.ready) {
				return contentsEqualResult;
			}
			done = true;
			return contentsEqualResult;
		}
	};
}

/**
 * Nodes which contain an atomic type (text -> string, processing-instruction -> string, attribute -> any atomic type)
 * @param   {../DynamicContext}   dynamicContext
 * @param   {../dataTypes/Value}  item1
 * @param   {../dataTypes/Value}  item2
 * @return  {AsyncIterator}
 */
function atomicTypeNodeDeepEqual (dynamicContext, item1, item2) {
	const namesAreEqualResultGenerator = sequenceDeepEqual(
		dynamicContext,
		nodeName(dynamicContext, Sequence.singleton(item1)),
		nodeName(dynamicContext, Sequence.singleton(item2)));
	let done = false;
	return {
		next: () => {
			if (done) {
				return DONE_TOKEN;
			}
			const namesAreEqualResult = namesAreEqualResultGenerator.next();
			if (!namesAreEqualResult.ready) {
				return namesAreEqualResult;
			}
			if (!namesAreEqualResult.done) {
				if (namesAreEqualResult.value === false) {
					done = true;
					return namesAreEqualResult;
				}
			}
			return ready(anyAtomicTypeDeepEqual(
				dynamicContext,
				atomize(item1, dynamicContext),
				atomize(item2, dynamicContext)));
		}
	};
}

/**
 * @param   {../DynamicContext}   dynamicContext
 * @param   {../dataTypes/Value}  item1
 * @param   {../dataTypes/Value}  item2
 * @return  {AsyncIterator}
 */
function itemDeepEqual (dynamicContext, item1, item2) {
	// All atomic types
	if (isSubtypeOf(item1.type, 'xs:anyAtomicType') && isSubtypeOf(item2.type, 'xs:anyAtomicType')) {
		return createSingleValueIterator(anyAtomicTypeDeepEqual(dynamicContext, item1, item2));
	}

	// Maps
	if (isSubtypeOf(item1.type, 'map(*)') && isSubtypeOf(item2.type, 'map(*)')) {
		return mapTypeDeepEqual(dynamicContext, item1, item2);
	}

	// Arrays
	if (isSubtypeOf(item1.type, 'array(*)') && isSubtypeOf(item2.type, 'array(*)')) {
		return arrayTypeDeepEqual(dynamicContext, item1, item2);
	}

	// Nodes
	if (isSubtypeOf(item1.type, 'node()') && isSubtypeOf(item2.type, 'node()')) {
		// Document nodes
		if (isSubtypeOf(item1.type, 'document()') && isSubtypeOf(item2.type, 'document()')) {
			return nodeDeepEqual(dynamicContext, item1, item2);
		}

		// Element nodes, cannot be compared due to missing schema information
		if (isSubtypeOf(item1.type, 'element()') && isSubtypeOf(item2.type, 'element()')) {
			return elementNodeDeepEqual(dynamicContext, item1, item2);
		}

		// Attribute nodes
		if (isSubtypeOf(item1.type, 'attribute()') && isSubtypeOf(item2.type, 'attribute()')) {
			return atomicTypeNodeDeepEqual(dynamicContext, item1, item2);
		}

		// Processing instruction node
		if (isSubtypeOf(item1.type, 'processing-instruction()') && isSubtypeOf(item2.type, 'processing-instruction()')) {
			return atomicTypeNodeDeepEqual(dynamicContext, item1, item2);
		}

		// Text nodes, or comment nodes
		if ((isSubtypeOf(item1.type, 'text()') || isSubtypeOf(item1.type, 'comment()')) &&
			(isSubtypeOf(item2.type, 'text()') || isSubtypeOf(item2.type, 'comment()'))) {
			return atomicTypeNodeDeepEqual(dynamicContext, item1, item2);
		}
	}

	return createSingleValueIterator(false);
}

export default sequenceDeepEqual;

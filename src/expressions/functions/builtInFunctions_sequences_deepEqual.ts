import ArrayValue from '../dataTypes/ArrayValue';
import { atomizeSingleValue } from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import createPointerValue from '../dataTypes/createPointerValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import { equal } from '../dataTypes/valueTypes/DateTime';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import StaticContext from '../StaticContext';
import createSingleValueIterator from '../util/createSingleValueIterator';
import {
	DONE_TOKEN,
	IAsyncIterator,
	IterationHint,
	IterationResult,
	notReady,
	ready,
} from '../util/iterators';
import builtInFunctionsNode from './builtInFunctions_node';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import { TextNodePointer } from '../../domClone/Pointer';
import DomFacade from '../../domFacade/DomFacade';

const nodeName = builtInFunctionsNode.functions.nodeName;

function asyncGenerateEvery<T>(
	items: T[],
	callback: (item: T, index: number, all: T[]) => IAsyncIterator<boolean>
): IAsyncIterator<boolean> {
	let i = 0;
	const l = items.length;
	let done = false;
	let filterGenerator: IAsyncIterator<boolean> = null;
	return {
		next: () => {
			if (!done) {
				while (i < l) {
					if (!filterGenerator) {
						filterGenerator = callback(items[i], i, items);
					}
					const filterResult = filterGenerator.next(IterationHint.NONE);
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
		},
	};
}

function filterElementAndTextNodes(node, domFacade: DomFacade) {
	const nodeType = domFacade.getNodeType(node);
	return nodeType === NODE_TYPES.ELEMENT_NODE || nodeType === NODE_TYPES.TEXT_NODE;
}

function anyAtomicTypeDeepEqual(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	item1,
	item2
) {
	if (
		(isSubtypeOf(item1.type, 'xs:decimal') || isSubtypeOf(item1.type, 'xs:float')) &&
		(isSubtypeOf(item2.type, 'xs:decimal') || isSubtypeOf(item2.type, 'xs:float'))
	) {
		const temp1 = castToType(item1, 'xs:float');
		const temp2 = castToType(item2, 'xs:float');
		return temp1.value === temp2.value || (isNaN(item1.value) && isNaN(item2.value));
	}
	if (
		(isSubtypeOf(item1.type, 'xs:decimal') ||
			isSubtypeOf(item1.type, 'xs:float') ||
			isSubtypeOf(item1.type, 'xs:double')) &&
		(isSubtypeOf(item2.type, 'xs:decimal') ||
			isSubtypeOf(item2.type, 'xs:float') ||
			isSubtypeOf(item2.type, 'xs:double'))
	) {
		const temp1 = castToType(item1, 'xs:double');
		const temp2 = castToType(item2, 'xs:double');
		return temp1.value === temp2.value || (isNaN(item1.value) && isNaN(item2.value));
	}

	if (isSubtypeOf(item1.type, 'xs:QName') && isSubtypeOf(item2.type, 'xs:QName')) {
		return (
			item1.value.namespaceURI === item2.value.namespaceURI &&
			item1.value.localName === item2.value.localName
		);
	}

	if (
		(isSubtypeOf(item1.type, 'xs:dateTime') ||
			isSubtypeOf(item1.type, 'xs:date') ||
			isSubtypeOf(item1.type, 'xs:time') ||
			isSubtypeOf(item1.type, 'xs:gYearMonth') ||
			isSubtypeOf(item1.type, 'xs:gYear') ||
			isSubtypeOf(item1.type, 'xs:gMonthDay') ||
			isSubtypeOf(item1.type, 'xs:gMonth') ||
			isSubtypeOf(item1.type, 'xs:gDay')) &&
		(isSubtypeOf(item2.type, 'xs:dateTime') ||
			isSubtypeOf(item2.type, 'xs:date') ||
			isSubtypeOf(item2.type, 'xs:time') ||
			isSubtypeOf(item2.type, 'xs:gYearMonth') ||
			isSubtypeOf(item2.type, 'xs:gYear') ||
			isSubtypeOf(item2.type, 'xs:gMonthDay') ||
			isSubtypeOf(item2.type, 'xs:gMonth') ||
			isSubtypeOf(item2.type, 'xs:gDay'))
	) {
		return equal(item1.value, item2.value);
	}
	return item1.value === item2.value;
}

function compareNormalizedTextNodes(
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	staticContext: StaticContext,
	textValues1: Value[],
	textValues2: Value[]
) {
	const [atomicValue1, atomicValue2] = [textValues1, textValues2].map((textValues) => {
		const value = textValues.reduce((wholeValue, textValue) => {
			wholeValue =
				wholeValue + atomizeSingleValue(textValue, executionParameters).first().value;

			return wholeValue;
		}, '');
		return {
			type: 'xs:string',
			value,
		};
	});

	return ready(
		anyAtomicTypeDeepEqual(
			dynamicContext,
			executionParameters,
			staticContext,
			atomicValue1,
			atomicValue2
		)
	);
}

function takeConsecutiveTextValues(
	item: IterationResult<Value>,
	textValues: Value[],
	iterator: IAsyncIterator<Value>,
	domFacade: DomFacade
): IterationResult<Value> {
	while (item.value && isSubtypeOf(item.value.type, 'text()')) {
		textValues.push(item.value);
		const nextSibling = domFacade.getNextSiblingPointer(item.value.value as TextNodePointer);
		item = iterator.next(IterationHint.NONE);
		if (nextSibling && domFacade.getNodeType(nextSibling) !== NODE_TYPES.TEXT_NODE) {
			break;
		}
	}
	return item;
}

function sequenceDeepEqual(
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	staticContext: StaticContext,
	sequence1: ISequence,
	sequence2: ISequence
): IAsyncIterator<boolean> {
	const domFacade = executionParameters.domFacade;
	const it1 = sequence1.value;
	const it2 = sequence2.value;
	let item1: IterationResult<Value> = null;
	let item2: IterationResult<Value> = null;
	let comparisonGenerator: IAsyncIterator<boolean> = null;
	let done: boolean;
	const textValues1: Value[] = [];
	const textValues2: Value[] = [];
	return {
		next: (_hint: IterationHint) => {
			while (!done) {
				if (!item1) {
					item1 = it1.next(IterationHint.NONE);
				}
				item1 = takeConsecutiveTextValues(item1, textValues1, it1, domFacade);

				if (!item2) {
					item2 = it2.next(IterationHint.NONE);
				}
				item2 = takeConsecutiveTextValues(item2, textValues2, it2, domFacade);

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

				if (textValues1.length || textValues2.length) {
					const textComparisonResult = compareNormalizedTextNodes(
						dynamicContext,
						executionParameters,
						staticContext,
						textValues1,
						textValues2
					);
					textValues1.length = 0;
					textValues2.length = 0;
					if (textComparisonResult.value === false) {
						done = true;
						return textComparisonResult;
					}

					// We compare the textNodes so far, we should continue as normal.
					continue;
				}

				if (item1.done || item2.done) {
					done = true;
					return ready(item1.done === item2.done);
				}

				if (!comparisonGenerator) {
					comparisonGenerator = itemDeepEqual(
						dynamicContext,
						executionParameters,
						staticContext,
						item1.value,
						item2.value
					);
				}
				const comparisonResult = comparisonGenerator.next(IterationHint.NONE);
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
		},
	};
}

function mapTypeDeepEqual(
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	staticContext: StaticContext,
	item1: MapValue,
	item2: MapValue
): IAsyncIterator<boolean> {
	if (item1.keyValuePairs.length !== item2.keyValuePairs.length) {
		return createSingleValueIterator(false);
	}

	return asyncGenerateEvery(item1.keyValuePairs, (mapEntry1) => {
		const mapEntry2 = item2.keyValuePairs.find((entry) =>
			anyAtomicTypeDeepEqual(
				dynamicContext,
				executionParameters,
				staticContext,
				entry.key,
				mapEntry1.key
			)
		);

		if (!mapEntry2) {
			return createSingleValueIterator(false);
		}

		return sequenceDeepEqual(
			dynamicContext,
			executionParameters,
			staticContext,
			mapEntry1.value(),
			mapEntry2.value()
		);
	});
}

function arrayTypeDeepEqual(
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	staticContext: StaticContext,
	item1: ArrayValue,
	item2: ArrayValue
): IAsyncIterator<boolean> {
	if (item1.members.length !== item2.members.length) {
		return createSingleValueIterator(false);
	}

	return asyncGenerateEvery<() => ISequence>(item1.members, (arrayEntry1, index) => {
		const arrayEntry2 = item2.members[index];
		return sequenceDeepEqual(
			dynamicContext,
			executionParameters,
			staticContext,
			arrayEntry1(),
			arrayEntry2()
		);
	});
}

function nodeDeepEqual(
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	staticContext: StaticContext,
	item1: Value,
	item2: Value
): IAsyncIterator<boolean> {
	let item1Nodes = executionParameters.domFacade.getChildNodePointers(item1.value);
	let item2Nodes = executionParameters.domFacade.getChildNodePointers(item2.value);

	item1Nodes = item1Nodes.filter((item1Node) =>
		filterElementAndTextNodes(item1Node, executionParameters.domFacade)
	);
	item2Nodes = item2Nodes.filter((item2Node) =>
		filterElementAndTextNodes(item2Node, executionParameters.domFacade)
	);

	const item1NodesSeq = sequenceFactory.create(
		item1Nodes.map((node) => createPointerValue(node, executionParameters.domFacade))
	);
	const item2NodesSeq = sequenceFactory.create(
		item2Nodes.map((node) => createPointerValue(node, executionParameters.domFacade))
	);

	return sequenceDeepEqual(
		dynamicContext,
		executionParameters,
		staticContext,
		item1NodesSeq,
		item2NodesSeq
	);
}

function elementNodeDeepEqual(
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	staticContext: StaticContext,
	item1: Value,
	item2: Value
): IAsyncIterator<boolean> {
	const namesAreEqualResultGenerator = sequenceDeepEqual(
		dynamicContext,
		executionParameters,
		staticContext,
		nodeName(
			dynamicContext,
			executionParameters,
			staticContext,
			sequenceFactory.singleton(item1)
		),
		nodeName(
			dynamicContext,
			executionParameters,
			staticContext,
			sequenceFactory.singleton(item2)
		)
	);
	const nodeDeepEqualGenerator = nodeDeepEqual(
		dynamicContext,
		executionParameters,
		staticContext,
		item1,
		item2
	);
	const domFacade = executionParameters.domFacade;
	const attributes1 = domFacade
		.getAllAttributePointers(item1.value)
		.filter((attr) => domFacade.getNamespaceURI(attr) !== 'http://www.w3.org/2000/xmlns/')
		.sort((attrA, attrB) =>
			domFacade.getNodeName(attrA) > domFacade.getNodeName(attrB) ? 1 : -1
		)
		.map((attr) => createPointerValue(attr, executionParameters.domFacade));

	const attributes2 = executionParameters.domFacade
		.getAllAttributePointers(item2.value)
		.filter((attr) => domFacade.getNamespaceURI(attr) !== 'http://www.w3.org/2000/xmlns/')
		.sort((attrA, attrB) =>
			domFacade.getNodeName(attrA) > domFacade.getNodeName(attrB) ? 1 : -1
		)
		.map((attr) => createPointerValue(attr, executionParameters.domFacade));

	const attributesDeepEqualGenerator = sequenceDeepEqual(
		dynamicContext,
		executionParameters,
		staticContext,
		sequenceFactory.create(attributes1),
		sequenceFactory.create(attributes2)
	);
	let done = false;
	return {
		next: (_hint: IterationHint) => {
			if (done) {
				return DONE_TOKEN;
			}
			const namesAreEqualResult = namesAreEqualResultGenerator.next(IterationHint.NONE);
			if (!namesAreEqualResult.ready) {
				return namesAreEqualResult;
			}
			if (!namesAreEqualResult.done && namesAreEqualResult.value === false) {
				done = true;
				return namesAreEqualResult;
			}

			const attributesEqualResult = attributesDeepEqualGenerator.next(IterationHint.NONE);
			if (!attributesEqualResult.ready) {
				return attributesEqualResult;
			}
			if (!attributesEqualResult.done && attributesEqualResult.value === false) {
				done = true;
				return attributesEqualResult;
			}

			const contentsEqualResult = nodeDeepEqualGenerator.next(IterationHint.NONE);
			if (!contentsEqualResult.ready) {
				return contentsEqualResult;
			}
			done = true;
			return contentsEqualResult;
		},
	};
}

function atomicTypeNodeDeepEqual(
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	staticContext: StaticContext,
	item1: Value,
	item2: Value
): IAsyncIterator<boolean> {
	const namesAreEqualResultGenerator = sequenceDeepEqual(
		dynamicContext,
		executionParameters,
		staticContext,
		nodeName(
			dynamicContext,
			executionParameters,
			staticContext,
			sequenceFactory.singleton(item1)
		),
		nodeName(
			dynamicContext,
			executionParameters,
			staticContext,
			sequenceFactory.singleton(item2)
		)
	);
	let done = false;
	return {
		next: (_hint: IterationHint) => {
			if (done) {
				return DONE_TOKEN;
			}
			const namesAreEqualResult = namesAreEqualResultGenerator.next(IterationHint.NONE);
			if (!namesAreEqualResult.ready) {
				return namesAreEqualResult;
			}
			if (!namesAreEqualResult.done) {
				if (namesAreEqualResult.value === false) {
					done = true;
					return namesAreEqualResult;
				}
			}
			// Assume here that a node always atomizes to a singlevalue. This will not work
			// anymore when schema support will be imlemented.

			return ready(
				anyAtomicTypeDeepEqual(
					dynamicContext,
					executionParameters,
					staticContext,
					atomizeSingleValue(item1, executionParameters).first(),
					atomizeSingleValue(item2, executionParameters).first()
				)
			);
		},
	};
}

export function itemDeepEqual(
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	staticContext: StaticContext,
	item1: Value,
	item2: Value
): IAsyncIterator<boolean> {
	// All atomic types
	if (
		isSubtypeOf(item1.type, 'xs:anyAtomicType') &&
		isSubtypeOf(item2.type, 'xs:anyAtomicType')
	) {
		return createSingleValueIterator(
			anyAtomicTypeDeepEqual(dynamicContext, executionParameters, staticContext, item1, item2)
		);
	}

	// Maps
	if (isSubtypeOf(item1.type, 'map(*)') && isSubtypeOf(item2.type, 'map(*)')) {
		return mapTypeDeepEqual(
			dynamicContext,
			executionParameters,
			staticContext,
			item1 as MapValue,
			item2 as MapValue
		);
	}

	// Arrays
	if (isSubtypeOf(item1.type, 'array(*)') && isSubtypeOf(item2.type, 'array(*)')) {
		return arrayTypeDeepEqual(
			dynamicContext,
			executionParameters,
			staticContext,
			item1 as ArrayValue,
			item2 as ArrayValue
		);
	}

	// Nodes
	if (isSubtypeOf(item1.type, 'node()') && isSubtypeOf(item2.type, 'node()')) {
		// Document nodes
		if (isSubtypeOf(item1.type, 'document()') && isSubtypeOf(item2.type, 'document()')) {
			return nodeDeepEqual(dynamicContext, executionParameters, staticContext, item1, item2);
		}

		// Element nodes, cannot be compared due to missing schema information
		if (isSubtypeOf(item1.type, 'element()') && isSubtypeOf(item2.type, 'element()')) {
			return elementNodeDeepEqual(
				dynamicContext,
				executionParameters,
				staticContext,
				item1,
				item2
			);
		}

		// Attribute nodes
		if (isSubtypeOf(item1.type, 'attribute()') && isSubtypeOf(item2.type, 'attribute()')) {
			return atomicTypeNodeDeepEqual(
				dynamicContext,
				executionParameters,
				staticContext,
				item1,
				item2
			);
		}

		// Processing instruction node
		if (
			isSubtypeOf(item1.type, 'processing-instruction()') &&
			isSubtypeOf(item2.type, 'processing-instruction()')
		) {
			return atomicTypeNodeDeepEqual(
				dynamicContext,
				executionParameters,
				staticContext,
				item1,
				item2
			);
		}

		// Comment nodes
		if (isSubtypeOf(item1.type, 'comment()') && isSubtypeOf(item2.type, 'comment()')) {
			return atomicTypeNodeDeepEqual(
				dynamicContext,
				executionParameters,
				staticContext,
				item1,
				item2
			);
		}

		// TextNodes
	}

	return createSingleValueIterator(false);
}

export default sequenceDeepEqual;

import { NodePointer, TextNodePointer } from '../../domClone/Pointer';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import DomFacade from '../../domFacade/DomFacade';
import ArrayValue from '../dataTypes/ArrayValue';
import { atomizeSingleValue } from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import createPointerValue from '../dataTypes/createPointerValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value, { ValueType } from '../dataTypes/Value';
import { equal } from '../dataTypes/valueTypes/DateTime';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import StaticContext from '../StaticContext';
import createSingleValueIterator from '../util/createSingleValueIterator';
import { DONE_TOKEN, IIterator, IterationHint, IterationResult, ready } from '../util/iterators';
import builtInFunctionsNode from './builtInFunctions_node';

const nodeName = builtInFunctionsNode.functions.nodeName;

function asyncGenerateEvery<T>(
	items: T[],
	callback: (item: T, index: number, all: T[]) => IIterator<boolean>
): IIterator<boolean> {
	let i = 0;
	const l = items.length;
	let done = false;
	let filterGenerator: IIterator<boolean> = null;
	return {
		next: () => {
			if (!done) {
				while (i < l) {
					if (!filterGenerator) {
						filterGenerator = callback(items[i], i, items);
					}
					const filterResult = filterGenerator.next(IterationHint.NONE);
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

function filterElementAndTextNodes(node: NodePointer, domFacade: DomFacade) {
	const nodeType = domFacade.getNodeType(node);
	return nodeType === NODE_TYPES.ELEMENT_NODE || nodeType === NODE_TYPES.TEXT_NODE;
}

export function anyAtomicTypeDeepEqual(
	_dynamicContext: DynamicContext,
	_executionParameters: ExecutionParameters,
	_staticContext: StaticContext,
	item1: Value,
	item2: Value
): boolean {
	if (
		(isSubtypeOf(item1.type, ValueType.XSDECIMAL) ||
			isSubtypeOf(item1.type, ValueType.XSFLOAT)) &&
		(isSubtypeOf(item2.type, ValueType.XSDECIMAL) || isSubtypeOf(item2.type, ValueType.XSFLOAT))
	) {
		const temp1 = castToType(item1, ValueType.XSFLOAT);
		const temp2 = castToType(item2, ValueType.XSFLOAT);
		return temp1.value === temp2.value || (isNaN(item1.value) && isNaN(item2.value));
	}
	if (
		(isSubtypeOf(item1.type, ValueType.XSDECIMAL) ||
			isSubtypeOf(item1.type, ValueType.XSFLOAT) ||
			isSubtypeOf(item1.type, ValueType.XSDOUBLE)) &&
		(isSubtypeOf(item2.type, ValueType.XSDECIMAL) ||
			isSubtypeOf(item2.type, ValueType.XSFLOAT) ||
			isSubtypeOf(item2.type, ValueType.XSDOUBLE))
	) {
		const temp1 = castToType(item1, ValueType.XSDOUBLE);
		const temp2 = castToType(item2, ValueType.XSDOUBLE);
		return temp1.value === temp2.value || (isNaN(item1.value) && isNaN(item2.value));
	}

	if (isSubtypeOf(item1.type, ValueType.XSQNAME) && isSubtypeOf(item2.type, ValueType.XSQNAME)) {
		return (
			item1.value.namespaceURI === item2.value.namespaceURI &&
			item1.value.localName === item2.value.localName
		);
	}

	if (
		(isSubtypeOf(item1.type, ValueType.XSDATETIME) ||
			isSubtypeOf(item1.type, ValueType.XSDATE) ||
			isSubtypeOf(item1.type, ValueType.XSTIME) ||
			isSubtypeOf(item1.type, ValueType.XSGYEARMONTH) ||
			isSubtypeOf(item1.type, ValueType.XSGYEAR) ||
			isSubtypeOf(item1.type, ValueType.XSGMONTHDAY) ||
			isSubtypeOf(item1.type, ValueType.XSGMONTH) ||
			isSubtypeOf(item1.type, ValueType.XSGDAY)) &&
		(isSubtypeOf(item2.type, ValueType.XSDATETIME) ||
			isSubtypeOf(item2.type, ValueType.XSDATE) ||
			isSubtypeOf(item2.type, ValueType.XSTIME) ||
			isSubtypeOf(item2.type, ValueType.XSGYEARMONTH) ||
			isSubtypeOf(item2.type, ValueType.XSGYEAR) ||
			isSubtypeOf(item2.type, ValueType.XSGMONTHDAY) ||
			isSubtypeOf(item2.type, ValueType.XSGMONTH) ||
			isSubtypeOf(item2.type, ValueType.XSGDAY))
	) {
		return equal(item1.value, item2.value);
	}

	if (
		(isSubtypeOf(item1.type, ValueType.XSYEARMONTHDURATION) ||
			isSubtypeOf(item1.type, ValueType.XSDAYTIMEDURATION) ||
			isSubtypeOf(item1.type, ValueType.XSDURATION)) &&
		(isSubtypeOf(item2.type, ValueType.XSYEARMONTHDURATION) ||
			isSubtypeOf(item2.type, ValueType.XSDAYTIMEDURATION) ||
			isSubtypeOf(item2.type, ValueType.XSDAYTIMEDURATION))
	) {
		return item1.value.equals(item2.value);
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
	const [atomicValue1, atomicValue2]: Value[] = [textValues1, textValues2].map((textValues) => {
		const value = textValues.reduce((wholeValue, textValue) => {
			wholeValue =
				wholeValue + atomizeSingleValue(textValue, executionParameters).first().value;

			return wholeValue;
		}, '');

		return {
			type: ValueType.XSSTRING,
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
	iterator: IIterator<Value>,
	domFacade: DomFacade
): IterationResult<Value> {
	while (item.value && isSubtypeOf(item.value.type, ValueType.TEXT)) {
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
): IIterator<boolean> {
	const domFacade = executionParameters.domFacade;
	const it1 = sequence1.value;
	const it2 = sequence2.value;
	let item1: IterationResult<Value> = null;
	let item2: IterationResult<Value> = null;
	let comparisonGenerator: IIterator<boolean> = null;
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
): IIterator<boolean> {
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
): IIterator<boolean> {
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
): IIterator<boolean> {
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
): IIterator<boolean> {
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
		.filter(
			(attr) =>
				domFacade.getNamespaceURI(attr) !== BUILT_IN_NAMESPACE_URIS.XMLNS_NAMESPACE_URI
		)
		.sort((attrA, attrB) =>
			domFacade.getNodeName(attrA) > domFacade.getNodeName(attrB) ? 1 : -1
		)
		.map((attr) => createPointerValue(attr, executionParameters.domFacade));

	const attributes2 = executionParameters.domFacade
		.getAllAttributePointers(item2.value)
		.filter(
			(attr) =>
				domFacade.getNamespaceURI(attr) !== BUILT_IN_NAMESPACE_URIS.XMLNS_NAMESPACE_URI
		)
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
			if (!namesAreEqualResult.done && namesAreEqualResult.value === false) {
				done = true;
				return namesAreEqualResult;
			}

			const attributesEqualResult = attributesDeepEqualGenerator.next(IterationHint.NONE);
			if (!attributesEqualResult.done && attributesEqualResult.value === false) {
				done = true;
				return attributesEqualResult;
			}

			const contentsEqualResult = nodeDeepEqualGenerator.next(IterationHint.NONE);
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
): IIterator<boolean> {
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
): IIterator<boolean> {
	// All atomic types
	if (
		isSubtypeOf(item1.type, ValueType.XSANYATOMICTYPE) &&
		isSubtypeOf(item2.type, ValueType.XSANYATOMICTYPE)
	) {
		return createSingleValueIterator(
			anyAtomicTypeDeepEqual(dynamicContext, executionParameters, staticContext, item1, item2)
		);
	}

	// Maps
	if (isSubtypeOf(item1.type, ValueType.MAP) && isSubtypeOf(item2.type, ValueType.MAP)) {
		return mapTypeDeepEqual(
			dynamicContext,
			executionParameters,
			staticContext,
			item1 as MapValue,
			item2 as MapValue
		);
	}

	// Arrays
	if (isSubtypeOf(item1.type, ValueType.ARRAY) && isSubtypeOf(item2.type, ValueType.ARRAY)) {
		return arrayTypeDeepEqual(
			dynamicContext,
			executionParameters,
			staticContext,
			item1 as ArrayValue,
			item2 as ArrayValue
		);
	}

	// Nodes
	if (isSubtypeOf(item1.type, ValueType.NODE) && isSubtypeOf(item2.type, ValueType.NODE)) {
		// Document nodes
		if (
			isSubtypeOf(item1.type, ValueType.DOCUMENTNODE) &&
			isSubtypeOf(item2.type, ValueType.DOCUMENTNODE)
		) {
			return nodeDeepEqual(dynamicContext, executionParameters, staticContext, item1, item2);
		}

		// Element nodes, cannot be compared due to missing schema information
		if (
			isSubtypeOf(item1.type, ValueType.ELEMENT) &&
			isSubtypeOf(item2.type, ValueType.ELEMENT)
		) {
			return elementNodeDeepEqual(
				dynamicContext,
				executionParameters,
				staticContext,
				item1,
				item2
			);
		}

		// Attribute nodes
		if (
			isSubtypeOf(item1.type, ValueType.ATTRIBUTE) &&
			isSubtypeOf(item2.type, ValueType.ATTRIBUTE)
		) {
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
			isSubtypeOf(item1.type, ValueType.PROCESSINGINSTRUCTION) &&
			isSubtypeOf(item2.type, ValueType.PROCESSINGINSTRUCTION)
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
		if (
			isSubtypeOf(item1.type, ValueType.COMMENT) &&
			isSubtypeOf(item2.type, ValueType.COMMENT)
		) {
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

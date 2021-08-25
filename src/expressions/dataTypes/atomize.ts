import { TinyCharacterDataNode, TinyNode, TinyParentNode } from '../../domClone/Pointer';
import {
	ConcreteCharacterDataNode,
	ConcreteNode,
	ConcreteParentNode,
	NODE_TYPES,
} from '../../domFacade/ConcreteNode';
import ExecutionParameters from '../ExecutionParameters';
import concatSequences from '../util/concatSequences';
import { DONE_TOKEN, IIterator, IterationHint } from '../util/iterators';
import { errFOTY0013 } from '../XPathErrors';
import ArrayValue from './ArrayValue';
import createAtomicValue from './createAtomicValue';
import ISequence from './ISequence';
import isSubtypeOf from './isSubtypeOf';
import sequenceFactory from './sequenceFactory';
import Value, { ValueType } from './Value';

export function atomizeSingleValue(
	value: Value,
	executionParameters: ExecutionParameters
): ISequence {
	if (
		isSubtypeOf(value.type, ValueType.XSANYATOMICTYPE) ||
		isSubtypeOf(value.type, ValueType.XSUNTYPEDATOMIC) ||
		isSubtypeOf(value.type, ValueType.XSBOOLEAN) ||
		isSubtypeOf(value.type, ValueType.XSDECIMAL) ||
		isSubtypeOf(value.type, ValueType.XSDOUBLE) ||
		isSubtypeOf(value.type, ValueType.XSFLOAT) ||
		isSubtypeOf(value.type, ValueType.XSINTEGER) ||
		isSubtypeOf(value.type, ValueType.XSNUMERIC) ||
		isSubtypeOf(value.type, ValueType.XSQNAME) ||
		isSubtypeOf(value.type, ValueType.XSSTRING)
	) {
		return sequenceFactory.create(value);
	}

	const domFacade = executionParameters.domFacade;

	if (isSubtypeOf(value.type, ValueType.NODE)) {
		const pointer = value.value;

		// TODO: Mix in types, by default get string value.
		// Attributes should return their value.
		// Text nodes and documents should return their text, as untyped atomic
		if (
			pointer.node.nodeType === NODE_TYPES.ATTRIBUTE_NODE ||
			pointer.node.nodeType === NODE_TYPES.TEXT_NODE
		) {
			return sequenceFactory.create(
				createAtomicValue(domFacade.getDataFromPointer(pointer), ValueType.XSUNTYPEDATOMIC)
			);
		}

		// comments and PIs are string
		if (
			pointer.node.nodeType === NODE_TYPES.COMMENT_NODE ||
			pointer.node.nodeType === NODE_TYPES.PROCESSING_INSTRUCTION_NODE
		) {
			return sequenceFactory.create(
				createAtomicValue(domFacade.getDataFromPointer(pointer), ValueType.XSSTRING)
			);
		}
		// This is an element or a document node. Because we do not know the specific type of this element.
		// Documents should always be an untypedAtomic, of elements, we do not know the type, so they are untypedAtomic too
		const allTexts = [];
		(function getTextNodes(aNode: ConcreteNode | TinyNode) {
			if (
				pointer.node.nodeType === NODE_TYPES.COMMENT_NODE ||
				pointer.node.nodeType === NODE_TYPES.PROCESSING_INSTRUCTION_NODE
			) {
				return;
			}
			const aNodeType = aNode['nodeType'];

			if (aNodeType === NODE_TYPES.TEXT_NODE || aNodeType === NODE_TYPES.CDATA_SECTION_NODE) {
				allTexts.push(
					domFacade.getData(aNode as ConcreteCharacterDataNode | TinyCharacterDataNode)
				);
				return;
			}
			if (aNodeType === NODE_TYPES.ELEMENT_NODE || aNodeType === NODE_TYPES.DOCUMENT_NODE) {
				const children = domFacade.getChildNodes(
					aNode as ConcreteParentNode | TinyParentNode
				);
				children.forEach((child) => {
					getTextNodes(child as ConcreteParentNode | TinyParentNode);
				});
			}
		})(pointer.node);

		return sequenceFactory.create(
			createAtomicValue(allTexts.join(''), ValueType.XSUNTYPEDATOMIC)
		);
	}
	// (function || map) && !array
	if (isSubtypeOf(value.type, ValueType.FUNCTION) && !isSubtypeOf(value.type, ValueType.ARRAY)) {
		throw errFOTY0013(value.type);
	}
	if (isSubtypeOf(value.type, ValueType.ARRAY)) {
		const arrayValue = value as ArrayValue;
		return concatSequences(
			arrayValue.members.map((getMemberSequence) =>
				atomize(getMemberSequence(), executionParameters)
			)
		);
	}
	throw new Error(`Atomizing ${value.type} is not implemented.`);
}
export default function atomize(
	sequence: ISequence,
	executionParameters: ExecutionParameters
): ISequence {
	// Generate the atomized items one by one to prevent getting all items
	let done = false;
	const it = sequence.value;
	let currentOutput: IIterator<Value> = null;
	return sequenceFactory.create({
		next: () => {
			while (!done) {
				if (!currentOutput) {
					const inputItem = it.next(IterationHint.NONE);
					if (inputItem.done) {
						done = true;
						break;
					}
					const outputSequence = atomizeSingleValue(inputItem.value, executionParameters);
					currentOutput = outputSequence.value;
				}
				const itemToOutput = currentOutput.next(IterationHint.NONE);
				if (itemToOutput.done) {
					currentOutput = null;
					continue;
				}
				return itemToOutput;
			}
			return DONE_TOKEN;
		},
	});
}

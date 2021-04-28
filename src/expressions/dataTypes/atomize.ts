import {
	TinyCharacterDataNode,
	TinyChildNode,
	TinyNode,
	TinyParentNode,
} from '../../domClone/Pointer';
import {
	ConcreteCharacterDataNode,
	ConcreteChildNode,
	ConcreteNode,
	ConcreteParentNode,
	NODE_TYPES,
} from '../../domFacade/ConcreteNode';
import ExecutionParameters from '../ExecutionParameters';
import concatSequences from '../util/concatSequences';
import { DONE_TOKEN, IIterator, IterationHint } from '../util/iterators';
import ArrayValue from './ArrayValue';
import createAtomicValue from './createAtomicValue';
import ISequence from './ISequence';
import isSubtypeOf from './isSubtypeOf';
import sequenceFactory from './sequenceFactory';
import Value, { BaseType } from './Value';
export function atomizeSingleValue(
	value: Value,
	executionParameters: ExecutionParameters
): ISequence {
	if (
		isSubtypeOf(value.type, { kind: BaseType.XSANYATOMICTYPE }) ||
		isSubtypeOf(value.type, { kind: BaseType.XSUNTYPEDATOMIC }) ||
		isSubtypeOf(value.type, { kind: BaseType.XSBOOLEAN }) ||
		isSubtypeOf(value.type, { kind: BaseType.XSDECIMAL }) ||
		isSubtypeOf(value.type, { kind: BaseType.XSDOUBLE }) ||
		isSubtypeOf(value.type, { kind: BaseType.XSFLOAT }) ||
		isSubtypeOf(value.type, { kind: BaseType.XSINTEGER }) ||
		isSubtypeOf(value.type, { kind: BaseType.XSNUMERIC }) ||
		isSubtypeOf(value.type, { kind: BaseType.XSQNAME }) ||
		isSubtypeOf(value.type, { kind: BaseType.XSSTRING })
	) {
		return sequenceFactory.create(value);
	}

	const domFacade = executionParameters.domFacade;

	if (isSubtypeOf(value.type, { kind: BaseType.NODE })) {
		const pointer = value.value;

		// TODO: Mix in types, by default get string value.
		// Attributes should return their value.
		// Text nodes and documents should return their text, as untyped atomic
		if (
			pointer.node.nodeType === NODE_TYPES.ATTRIBUTE_NODE ||
			pointer.node.nodeType === NODE_TYPES.TEXT_NODE
		) {
			return sequenceFactory.create(
				createAtomicValue(domFacade.getDataFromPointer(pointer), {
					kind: BaseType.XSUNTYPEDATOMIC,
				})
			);
		}

		// comments and PIs are string
		if (
			pointer.node.nodeType === NODE_TYPES.COMMENT_NODE ||
			pointer.node.nodeType === NODE_TYPES.PROCESSING_INSTRUCTION_NODE
		) {
			return sequenceFactory.create(
				createAtomicValue(domFacade.getDataFromPointer(pointer), {
					kind: BaseType.XSSTRING,
				})
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
				const children: (ConcreteChildNode | TinyChildNode)[] = domFacade.getChildNodes(
					aNode as ConcreteParentNode | TinyParentNode
				);
				children.forEach((child) => {
					getTextNodes(child);
				});
			}
		})(pointer.node);

		return sequenceFactory.create(
			createAtomicValue(allTexts.join(''), { kind: BaseType.XSUNTYPEDATOMIC })
		);
	}
	// (function || map) && !array
	if (
		isSubtypeOf(value.type, { kind: BaseType.FUNCTION, returnType: undefined, param: [] }) &&
		!isSubtypeOf(value.type, { kind: BaseType.ARRAY, items: [] })
	) {
		throw new Error(`FOTY0013: Atomization is not supported for ${value.type}.`);
	}
	if (isSubtypeOf(value.type, { kind: BaseType.ARRAY, items: [] })) {
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

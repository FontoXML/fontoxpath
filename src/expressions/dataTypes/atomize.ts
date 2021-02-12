import {
	TinyCharacterDataNode,
	TinyChildNode,
	TinyNode,
	TinyParentNode,
	NodePointer,
	isTinyNode,
	TextNodePointer,
	AttributeNodePointer,
	CommentNodePointer,
	ProcessingInstructionNodePointer,
	ParentNodePointer,
} from '../../domClone/Pointer';
import {
	ConcreteCharacterDataNode,
	ConcreteChildNode,
	ConcreteNode,
	ConcreteParentNode,
	NODE_TYPES,
	ConcreteTextNode,
	ConcreteAttributeNode,
} from '../../domFacade/ConcreteNode';
import ExecutionParameters from '../ExecutionParameters';
import concatSequences from '../util/concatSequences';
import { DONE_TOKEN, IAsyncIterator, IterationHint, notReady } from '../util/iterators';
import ArrayValue from './ArrayValue';
import createAtomicValue from './createAtomicValue';
import ISequence from './ISequence';
import isSubtypeOf from './isSubtypeOf';
import sequenceFactory from './sequenceFactory';
import Value, { ValueType } from './Value';
import { XMLSCHEMA_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import castToType from './castToType';

function determineActualType(
	node: NodePointer,
	executionParameters: ExecutionParameters
): ValueType {
	if (isTinyNode(node.node)) {
		return 'xs:untypedAtomic';
	}

	const actualType = executionParameters.resolveType(node.node);

	if (actualType.namespaceURI !== XMLSCHEMA_NAMESPACE_URI) {
		throw new Error('External types are not supported yet');
	}

	return `xs:${actualType.localName}` as ValueType;
}

function determineStringValue(
	pointer: NodePointer,
	executionParameters: ExecutionParameters
): string {
	const domFacade = executionParameters.domFacade;

	if (
		pointer.node.nodeType === NODE_TYPES.ATTRIBUTE_NODE ||
		pointer.node.nodeType === NODE_TYPES.TEXT_NODE ||
		pointer.node.nodeType === NODE_TYPES.COMMENT_NODE ||
		pointer.node.nodeType === NODE_TYPES.PROCESSING_INSTRUCTION_NODE
	) {
		return domFacade.getDataFromPointer(
			pointer as
				| AttributeNodePointer
				| TextNodePointer
				| CommentNodePointer
				| ProcessingInstructionNodePointer
		);
	}

	pointer = pointer as ParentNodePointer;

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

	return allTexts.join('');
}

export function atomizeSingleValue(
	value: Value,
	executionParameters: ExecutionParameters
): ISequence {
	if (
		isSubtypeOf(value.type, 'xs:anyAtomicType') ||
		isSubtypeOf(value.type, 'xs:untypedAtomic') ||
		isSubtypeOf(value.type, 'xs:boolean') ||
		isSubtypeOf(value.type, 'xs:decimal') ||
		isSubtypeOf(value.type, 'xs:double') ||
		isSubtypeOf(value.type, 'xs:float') ||
		isSubtypeOf(value.type, 'xs:integer') ||
		isSubtypeOf(value.type, 'xs:numeric') ||
		isSubtypeOf(value.type, 'xs:QName') ||
		isSubtypeOf(value.type, 'xs:string')
	) {
		return sequenceFactory.create(value);
	}

	if (isSubtypeOf(value.type, 'node()')) {
		const nodeValue = value.value as NodePointer;

		const typeName = determineActualType(nodeValue, executionParameters);
		const stringValue = determineStringValue(nodeValue, executionParameters);
		if (typeName === 'xs:anyAtomicType') {
			return sequenceFactory.create(createAtomicValue(stringValue, 'xs:untypedAtomic'));
		}

		return sequenceFactory.create(
			castToType(createAtomicValue(stringValue, 'xs:untypedAtomic'), typeName)
		);
	}
	// (function || map) && !array
	if (isSubtypeOf(value.type, 'function(*)') && !isSubtypeOf(value.type, 'array(*)')) {
		throw new Error(`FOTY0013: Atomization is not supported for ${value.type}.`);
	}
	if (isSubtypeOf(value.type, 'array(*)')) {
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
	let currentOutput: IAsyncIterator<Value> = null;
	return sequenceFactory.create({
		next: () => {
			while (!done) {
				if (!currentOutput) {
					const inputItem = it.next(IterationHint.NONE);
					if (!inputItem.ready) {
						return notReady(inputItem.promise);
					}
					if (inputItem.done) {
						done = true;
						break;
					}
					const outputSequence = atomizeSingleValue(inputItem.value, executionParameters);
					currentOutput = outputSequence.value;
				}
				const itemToOutput = currentOutput.next(IterationHint.NONE);
				if (!itemToOutput.ready) {
					return notReady(itemToOutput.promise);
				}
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

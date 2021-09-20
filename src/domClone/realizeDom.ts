import { NODE_TYPES } from '../domFacade/ConcreteNode';
import DomFacade from '../domFacade/DomFacade';
import ExecutionParameters from '../expressions/ExecutionParameters';
import arePointersEqual from '../expressions/operators/compares/arePointersEqual';
import { Node } from '../types/Types';
import deepCloneNode from './deepCloneNode';
import {
	AttributeNodePointer,
	ChildNodePointer,
	CommentNodePointer,
	ElementNodePointer,
	isTinyNode,
	NodePointer,
	ParentNodePointer,
	ProcessingInstructionNodePointer,
	TextNodePointer,
} from './Pointer';

function createNewNode(pointer: NodePointer, executionParameters: ExecutionParameters) {
	const documentWriter = executionParameters.documentWriter;
	const nodesFactory = executionParameters.nodesFactory;
	const domFacade: DomFacade = executionParameters.domFacade;
	const node = pointer.node;

	if (isTinyNode(node)) {
		switch (domFacade.getNodeType(pointer)) {
			case NODE_TYPES.ATTRIBUTE_NODE:
				const newAttributePointer = pointer as AttributeNodePointer;
				const newAttributeNode = nodesFactory.createAttributeNS(
					domFacade.getNamespaceURI(newAttributePointer),
					domFacade.getNodeName(newAttributePointer)
				);
				newAttributeNode.value = domFacade.getDataFromPointer(newAttributePointer);
				return newAttributeNode;
			case NODE_TYPES.COMMENT_NODE:
				return nodesFactory.createComment(
					domFacade.getDataFromPointer(pointer as CommentNodePointer)
				);
			case NODE_TYPES.ELEMENT_NODE:
				const elementNodePointer = pointer as ElementNodePointer;
				const namespaceURI = domFacade.getNamespaceURI(elementNodePointer);
				const prefix = domFacade.getPrefix(elementNodePointer);
				const localName = domFacade.getLocalName(elementNodePointer);
				const element = nodesFactory.createElementNS(
					namespaceURI,
					prefix ? prefix + ':' + localName : localName
				);
				domFacade.getChildNodePointers(elementNodePointer).forEach((childPointer) => {
					const newChildNode = createNewNode(childPointer, executionParameters);
					documentWriter.insertBefore(element, newChildNode, null);
				});
				domFacade
					.getAllAttributePointers(elementNodePointer)
					.forEach((attributePointer: AttributeNodePointer) => {
						documentWriter.setAttributeNS(
							element,
							domFacade.getNamespaceURI(attributePointer),
							domFacade.getNodeName(attributePointer),
							domFacade.getDataFromPointer(attributePointer)
						);
					});
				(element as any).normalize();
				return element;
			case NODE_TYPES.PROCESSING_INSTRUCTION_NODE:
				const pIPointer = pointer as ProcessingInstructionNodePointer;
				return nodesFactory.createProcessingInstruction(
					domFacade.getTarget(pIPointer),
					domFacade.getDataFromPointer(pIPointer)
				);
			case NODE_TYPES.TEXT_NODE:
				return nodesFactory.createTextNode(
					domFacade.getDataFromPointer(pointer as TextNodePointer)
				);
		}
	} else {
		// This is always a grafted actual node pointer, so it must be cloned.
		return deepCloneNode(pointer, executionParameters).node;
	}
}

function getRootPointer(
	pointer: NodePointer,
	pathToNodeFromRoot: (number | string)[],
	domFacade: DomFacade
): NodePointer {
	let rootPointer = pointer;
	let parentPointer = domFacade.getParentNodePointer(
		rootPointer as ChildNodePointer | AttributeNodePointer
	);
	while (parentPointer !== null) {
		if (domFacade.getNodeType(rootPointer) === NODE_TYPES.ATTRIBUTE_NODE) {
			// To track the attribute node
			pathToNodeFromRoot.push(domFacade.getNodeName(rootPointer as AttributeNodePointer));
		} else {
			const children = domFacade.getChildNodePointers(parentPointer);
			pathToNodeFromRoot.push(
				children.findIndex((child) => arePointersEqual(child, rootPointer))
			);
		}
		rootPointer = parentPointer;
		parentPointer = domFacade.getParentNodePointer(
			rootPointer as ChildNodePointer | AttributeNodePointer
		);
	}
	return rootPointer;
}

function getNodeFromRoot(
	rootPointer: NodePointer,
	pathToNodeFromRoot: (number | string)[],
	domFacade: DomFacade
): Node {
	let child = rootPointer;
	while (pathToNodeFromRoot.length > 0) {
		const childIndex = pathToNodeFromRoot.pop();
		if (typeof childIndex === 'string') {
			const attributes = domFacade.getAllAttributePointers(child as ElementNodePointer);
			child = attributes.find((attr) => domFacade.getNodeName(attr) === childIndex);
		} else {
			const children = domFacade.getChildNodePointers(child as ParentNodePointer);
			child = children[childIndex] as ParentNodePointer | ElementNodePointer;
		}
	}

	return child.node;
}

export default function realizeDom(
	pointer: NodePointer,
	executionParameters: ExecutionParameters,
	forceCreateClone: boolean
): Node {
	const node = pointer.node;
	if (!(isTinyNode(node) || forceCreateClone || pointer.graftAncestor)) {
		// the pointer is an actual node pointer and not grafted.
		// forceCreateClone is used to create a pendingUpdateList in which the content always
		// needs to be cloned.
		// So the node should not be cloned.
		return node;
	}

	const rootPointerByRootNode = executionParameters.rootPointerByRootNodeMap;
	const pathToNodeFromRoot: string[] = [];

	if (forceCreateClone) {
		// We are creating a forced clone for a PUL: never use the created nodes cache here!
		return createNewNode(pointer, executionParameters);
	}
	const rootPointer = getRootPointer(pointer, pathToNodeFromRoot, executionParameters.domFacade);
	let newRootPointer = rootPointerByRootNode.get(rootPointer.node);
	if (!newRootPointer) {
		newRootPointer = {
			node: createNewNode(rootPointer, executionParameters),
			graftAncestor: null,
		};
		rootPointerByRootNode.set(rootPointer.node, newRootPointer);
	}
	return getNodeFromRoot(newRootPointer, pathToNodeFromRoot, executionParameters.domFacade);
}

import { NODE_TYPES } from '../domFacade/ConcreteNode';
import DomFacade from '../domFacade/DomFacade';
import ExecutionParameters from '../expressions/ExecutionParameters';
import arePointersEqual from '../expressions/operators/compares/arePointersEqual';
import {
	AttributeNodePointer,
	CommentNodePointer,
	ElementNodePointer,
	isTinyNode,
	NodePointer,
	Pointer,
	ProcessingInstructionNodePointer,
	TextNodePointer,
	ParentNodePointer,
	ChildNodePointer,
} from './Pointer';
import deepCloneNode from './deepCloneNode';
import { Node } from '../types/Types';

function createNewNode(
	pointer: NodePointer,
	executionParameters: ExecutionParameters,
	forceCreateClone: boolean
) {
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
					const newChildNode = createNewNode(
						childPointer,
						executionParameters,
						forceCreateClone
					);
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
		// we need to set a rule to create clone or use same node.
		const graftAncestor = pointer.graftAncestor;
		if (forceCreateClone || graftAncestor) {
			return deepCloneNode(pointer, executionParameters).node;
		} else {
			return node;
		}
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
	if (!isTinyNode(node)) {
		// we need to set a rule to create clone or use same node.
		const graftAncestor = pointer.graftAncestor;
		if (forceCreateClone || graftAncestor) {
			// forceCreateClone is used to create a pendingUpdateList in which the content always
			// needs to be cloned
			return deepCloneNode(pointer, executionParameters).node;
		} else {
			return node;
		}
	}
	const newRootPointerByRootPointer = executionParameters.rootPointerByDescendantPointerMap;
	const pathToNodeFromRoot = [];
	const rootPointer = getRootPointer(pointer, pathToNodeFromRoot, executionParameters.domFacade);
	let newRootPointer = newRootPointerByRootPointer.get(rootPointer);
	if (!newRootPointer) {
		newRootPointer = {
			node: createNewNode(rootPointer, executionParameters, forceCreateClone),
			graftAncestor: null,
		};
		newRootPointerByRootPointer.set(rootPointer, newRootPointer);
	}
	return getNodeFromRoot(newRootPointer, pathToNodeFromRoot, executionParameters.domFacade);
}

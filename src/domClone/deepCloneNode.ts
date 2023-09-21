import IDocumentWriter from '../documentWriter/IDocumentWriter';
import {
	AttributeNodePointer,
	CDATASectionNodePointer,
	CharacterDataNodePointer,
	CommentNodePointer,
	DocumentNodePointer,
	ElementNodePointer,
	NodePointer,
	ParentNodePointer,
	ProcessingInstructionNodePointer,
	TextNodePointer,
	TinyElementNode,
} from '../domClone/Pointer';
import { ConcreteDocumentNode, ConcreteElementNode, NODE_TYPES } from '../domFacade/ConcreteNode';
import DomFacade from '../domFacade/DomFacade';
import ExecutionParameters from '../expressions/ExecutionParameters';
import INodesFactory from '../nodesFactory/INodesFactory';

export default function deepCloneNode(
	pointer: NodePointer,
	executionParameters: ExecutionParameters,
): NodePointer {
	// Each copied node receives a new node identity. The parent, children, and attributes properties of the copied nodes are set so as to preserve their inter-node relationships. The parent property of the copy of $node is set to empty. Other properties of the copied nodes are determined as follows:

	// For a copied document node, the document-uri property is set to empty.
	// For a copied element node, the type-name property is set to xs:untyped, and the nilled, is-id, and is-idrefs properties are set to false.
	// For a copied attribute node, the type-name property is set to xs:untypedAtomic and the is-idrefs property is set to false. The is-id property is set to true if the qualified name of the attribute node is xml:id; otherwise it is set to false.
	// The string-value of each copied element and attribute node remains unchanged, and its typed value becomes equal to its string value as an instance of xs:untypedAtomic.
	// 	Note:Implementations that store only the typed value of a node are required at this point to convert the typed value to a string form.
	// If copy-namespaces mode in the static context specifies preserve, all in-scope-namespaces of the original element are retained in the new copy. If copy-namespaces mode specifies no-preserve, the new copy retains only those in-scope namespaces of the original element that are used in the names of the element and its attributes.
	// All other properties of the copied nodes are preserved.

	const domFacade: DomFacade = executionParameters.domFacade;
	const nodesFactory: INodesFactory = executionParameters.nodesFactory;
	const documentWriter: IDocumentWriter = executionParameters.documentWriter;

	switch (domFacade.getNodeType(pointer)) {
		case NODE_TYPES.ELEMENT_NODE:
			const cloneElem = nodesFactory.createElementNS(
				domFacade.getNamespaceURI(pointer as ElementNodePointer),
				domFacade.getNodeName(pointer as ElementNodePointer),
			);
			domFacade
				.getAllAttributes(pointer.node as ConcreteElementNode | TinyElementNode)
				.forEach((attr) =>
					documentWriter.setAttributeNS(
						cloneElem,
						attr.namespaceURI,
						attr.nodeName,
						attr.value,
					),
				);
			for (const child of domFacade.getChildNodePointers(pointer as ElementNodePointer)) {
				const descendant = deepCloneNode(child, executionParameters);
				documentWriter.insertBefore(
					cloneElem as ConcreteElementNode,
					descendant.node,
					null,
				);
			}
			const elementNodePointer: ElementNodePointer = { node: cloneElem, graftAncestor: null };
			return elementNodePointer;
		case NODE_TYPES.ATTRIBUTE_NODE:
			const cloneAttr = nodesFactory.createAttributeNS(
				domFacade.getNamespaceURI(pointer as AttributeNodePointer),
				domFacade.getNodeName(pointer as AttributeNodePointer),
			);
			cloneAttr.value = domFacade.getDataFromPointer(pointer as AttributeNodePointer);
			const attributeNodePointer: AttributeNodePointer = {
				node: cloneAttr,
				graftAncestor: null,
			};
			return attributeNodePointer;
		case NODE_TYPES.CDATA_SECTION_NODE:
			const characterDataNodePointer: CharacterDataNodePointer = {
				node: nodesFactory.createCDATASection(
					domFacade.getDataFromPointer(pointer as CDATASectionNodePointer),
				),
				graftAncestor: null,
			};
			return characterDataNodePointer;
		case NODE_TYPES.COMMENT_NODE:
			const commentNodePointer: CommentNodePointer = {
				node: nodesFactory.createComment(
					domFacade.getDataFromPointer(pointer as AttributeNodePointer),
				),
				graftAncestor: null,
			};
			return commentNodePointer;
		case NODE_TYPES.DOCUMENT_NODE:
			const cloneDoc = nodesFactory.createDocument();
			for (const child of domFacade.getChildNodePointers(pointer as ParentNodePointer)) {
				const descendant = deepCloneNode(child, executionParameters);
				documentWriter.insertBefore(
					cloneDoc as ConcreteDocumentNode,
					descendant.node,
					null,
				);
			}
			const documentNodePointer: DocumentNodePointer = {
				node: cloneDoc,
				graftAncestor: null,
			};
			return documentNodePointer;
		case NODE_TYPES.PROCESSING_INSTRUCTION_NODE:
			const processingInstructionNodePointer: ProcessingInstructionNodePointer = {
				node: nodesFactory.createProcessingInstruction(
					domFacade.getTarget(pointer as ProcessingInstructionNodePointer),
					domFacade.getDataFromPointer(pointer as ProcessingInstructionNodePointer),
				),
				graftAncestor: null,
			};
			return processingInstructionNodePointer;
		case NODE_TYPES.TEXT_NODE:
			const textNodePointer: TextNodePointer = {
				node: nodesFactory.createTextNode(
					domFacade.getDataFromPointer(pointer as TextNodePointer),
				),
				graftAncestor: null,
			};
			return textNodePointer;
	}
}

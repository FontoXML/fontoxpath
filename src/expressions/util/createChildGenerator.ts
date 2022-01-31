import { ChildNodePointer, NodePointer, ParentNodePointer } from '../../domClone/Pointer';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import DomFacade from '../../domFacade/DomFacade';
import { Bucket } from './Bucket';
import { DONE_TOKEN, IIterator, ready } from './iterators';

export default function createChildGenerator(
	domFacade: DomFacade,
	pointer: NodePointer,
	bucket: Bucket | null
): IIterator<ChildNodePointer> {
	const nodeType = domFacade.getNodeType(pointer);
	if (nodeType !== NODE_TYPES.ELEMENT_NODE && nodeType !== NODE_TYPES.DOCUMENT_NODE) {
		return {
			next: () => {
				return DONE_TOKEN;
			},
		};
	}

	let childNode = domFacade.getFirstChildPointer(pointer as ParentNodePointer, bucket);
	return {
		next() {
			if (!childNode) {
				return DONE_TOKEN;
			}
			const current = childNode;
			childNode = domFacade.getNextSiblingPointer(childNode, bucket);
			return ready(current);
		},
	};
}

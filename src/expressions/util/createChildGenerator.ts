import { ConcreteChildNode, ConcreteNode, NODE_TYPES } from '../../domFacade/ConcreteNode';
import IDomFacade from '../../domFacade/IDomFacade';
import { DONE_TOKEN, IAsyncIterator, ready } from './iterators';

export default function createChildGenerator(
	domFacade: IDomFacade,
	node: ConcreteNode
): IAsyncIterator<ConcreteChildNode> {
	if (node.nodeType !== NODE_TYPES.ELEMENT_NODE && node.nodeType !== NODE_TYPES.DOCUMENT_NODE) {
		return {
			next: () => {
				return DONE_TOKEN;
			}
		};
	}

	let childNode = domFacade.getFirstChild(node);
	return {
		next() {
			if (!childNode) {
				return DONE_TOKEN;
			}
			const current = childNode;
			childNode = domFacade.getNextSibling(childNode);
			return ready(current);
		}
	};
}

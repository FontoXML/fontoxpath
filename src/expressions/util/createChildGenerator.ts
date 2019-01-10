import { DONE_TOKEN, ready } from './iterators';
import IDomFacade from '../../domFacade/IDomFacade';
import ConcreteNode, {
	ConcreteChildNode,
	NODE_TYPES,
	ConcreteParentNode
} from '../../domFacade/ConcreteNode';

export default function createChildGenerator(
	domFacade: IDomFacade,
	node: ConcreteNode
): Iterator<ConcreteChildNode> {
	if (node.nodeType !== NODE_TYPES.ELEMENT_NODE && node.nodeType !== NODE_TYPES.DOCUMENT_NODE) {
		return {
			next: () => {
				return DONE_TOKEN;
			}
		};
	}
	const childNodes = domFacade.getChildNodes(node as ConcreteParentNode);
	let i = 0;
	const l = childNodes.length;
	return {
		next() {
			if (i >= l) {
				return DONE_TOKEN;
			}
			return ready(childNodes[i++]);
		}
	};
}

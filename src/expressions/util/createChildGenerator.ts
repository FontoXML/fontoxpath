import { DONE_TOKEN, ready } from './iterators';
import DomFacade from 'src/domFacade/DomFacade';

export default function createChildGenerator (domFacade: DomFacade, node: Node): Iterator<Node> {
	const childNodes = domFacade.getChildNodes(node);
	let i = 0;
	const l = childNodes.length;
	return /** @type {!Iterator<!Node>} */ ({
		next () {
			if (i >= l) {
				return DONE_TOKEN;
			}
			return ready(childNodes[i++]);
		}
	});
}

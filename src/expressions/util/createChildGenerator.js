import { DONE_TOKEN, ready } from './iterators';

/**
 * @param   {!IDomFacade}       domFacade
 * @param   {!Node}             node
 * @return  {!Iterator<!Node>}
 */
export default function createChildGenerator (domFacade, node, returnInReverse = false) {
	let childNodes = domFacade.getChildNodes(node);
	if (returnInReverse) {
		childNodes = Array.from(childNodes).reverse();
	}
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

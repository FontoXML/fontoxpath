import DomFacade from '../../DomFacade';

import { DONE_TOKEN, ready } from './iterators';

/**
 * @param   {!DomFacade}       domFacade
 * @param   {!Node}             node
 * @return  {!Iterator<!Node>}
 */
export default function createChildGenerator (domFacade, node) {
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

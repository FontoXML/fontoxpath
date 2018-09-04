import createChildGenerator from './createChildGenerator';
import { DONE_TOKEN, ready } from './iterators';
import createNodeValue from '../dataTypes/createNodeValue';

export default function createDescendantGenerator (domFacade, node, returnInReverse = false) {
	/**
	 * @type {!Array<!Iterator<!Node>>}
	 */
	const descendantIteratorStack = [createChildGenerator(domFacade, node, returnInReverse)];
	return {
		next: () => {
			if (!descendantIteratorStack.length) {
				return DONE_TOKEN;
			}
			let value = descendantIteratorStack[0].next();
			while (value.done) {
				descendantIteratorStack.shift();
				if (!descendantIteratorStack.length) {
					return DONE_TOKEN;
				}
				value = descendantIteratorStack[0].next();
			}
			// Iterator over these children next
			descendantIteratorStack.unshift(createChildGenerator(domFacade, value.value, returnInReverse));
			return ready(createNodeValue(value.value));
		}
	};
}

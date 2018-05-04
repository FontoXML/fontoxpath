import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';
import { DONE_TOKEN, ready } from '../util/iterators';

import createDescendantGenerator from '../util/createDescendantGenerator';

function createPrecedingGenerator (domFacade, node) {
	const nodeStack = [];

	for (
		let parentNode = domFacade.getParentNode(node);
		node && parentNode;
		node = parentNode, parentNode = domFacade.getParentNode(node)) {
		const firstSibling = domFacade.getFirstChild(parentNode);

		if (firstSibling === node) {
			continue;
		}
		nodeStack.unshift({
			firstSibling,
			endNode: node
		});
	}

	let nephewGenerator = null;
	return {
		next: () => {
			while (nephewGenerator || nodeStack.length) {
				if (!nephewGenerator) {
					nephewGenerator = createDescendantGenerator(domFacade, nodeStack[0].firstSibling);

					// Set the focus to the concurrent sibling of this node
					const nextNode = domFacade.getNextSibling(nodeStack[0].firstSibling);
					const toReturn = ready(createNodeValue(nodeStack[0].firstSibling));
					if (nextNode === nodeStack[0].endNode) {
						// This is the last sibling, we can continue with a child of the current
						// node (an uncle of the original node) in the next iteration
						nodeStack.shift();
					}
					else {
						nodeStack[0].firstSibling = nextNode;
					}

					return toReturn;
				}

				const nephew = nephewGenerator.next();

				if (nephew.done) {
					// We are done with the descendants of the node currently on the stack
					nephewGenerator = null;
					continue;
				}

				return nephew;
			}

			return DONE_TOKEN;
		}
	};
}


/**
 * @extends {Selector}
 */
class PrecedingAxis extends Selector {
	/**
	 * @param  {Selector}  testSelector
	 */
	constructor (testSelector) {
		super(
			testSelector.specificity,
			[testSelector],
			{
				resultOrder: Selector.RESULT_ORDERINGS.SORTED,
				peer: true,
				subtree: false,
				canBeStaticallyEvaluated: false
			});

		this._testSelector = testSelector;
	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		const contextItem = dynamicContext.contextItem;
		if (contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

        const domFacade = dynamicContext.domFacade;

		return new Sequence(createPrecedingGenerator(domFacade, contextItem.value)).filter(item => {
			return this._testSelector.evaluateToBoolean(dynamicContext, item);
		});
	}
}

export default PrecedingAxis;

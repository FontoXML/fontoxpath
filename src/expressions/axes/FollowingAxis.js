import Expression from '../Expression';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';
import { DONE_TOKEN, ready } from '../util/iterators';
import TestAbstractExpression from '../tests/TestAbstractExpression';

import createDescendantGenerator from '../util/createDescendantGenerator';

function createFollowingGenerator (domFacade, node) {
	const nodeStack = [];

	for (; node; node = domFacade.getParentNode(node)) {
		const previousSibling = domFacade.getNextSibling(node);
		if (previousSibling) {
			nodeStack.push(previousSibling);
		}
	}

	let nephewGenerator = null;
	return {
		next: () => {
			while (nephewGenerator || nodeStack.length) {
				if (!nephewGenerator) {
					nephewGenerator = createDescendantGenerator(domFacade, nodeStack[0]);

					const toReturn = ready(createNodeValue(nodeStack[0]));
					// Set the focus to the concurrent sibling of this node
					const nextNode = domFacade.getNextSibling(nodeStack[0]);
					if (!nextNode) {
						// This is the last sibling, we can continue with a child of the current
						// node (an uncle of the original node) in the next iteration
						nodeStack.shift();
					}
					else {
						nodeStack[0] = nextNode;
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


class FollowingAxis extends Expression {
	/**
	 * @param  {TestAbstractExpression}  testExpression
	 */
	constructor (testExpression) {
		super(
			testExpression.specificity,
			[testExpression],
			{
				resultOrder: Expression.RESULT_ORDERINGS.SORTED,
				peer: true,
				subtree: false,
				canBeStaticallyEvaluated: false
			});

		this._testExpression = testExpression;
	}

	evaluate (dynamicContext, executionParameters) {
		const contextItem = dynamicContext.contextItem;
		if (contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

        const domFacade = executionParameters.domFacade;

		return new Sequence(createFollowingGenerator(domFacade, contextItem.value)).filter(item => {
			return this._testExpression.evaluateToBoolean(dynamicContext, item);
		});
	}
}

export default FollowingAxis;

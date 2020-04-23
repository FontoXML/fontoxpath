import createPointerValue from '../dataTypes/createPointerValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import TestAbstractExpression from '../tests/TestAbstractExpression';
import { DONE_TOKEN, IterationHint, ready } from '../util/iterators';

import { ChildNodePointer, ParentNodePointer } from '../../domClone/Pointer';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import DomFacade from '../../domFacade/DomFacade';
import createDescendantGenerator from '../util/createDescendantGenerator';

function createFollowingGenerator(
	domFacade: DomFacade,
	node: ChildNodePointer,
	bucket: string | null
) {
	const nodeStack = [];

	for (
		let ancestorNode = node as ParentNodePointer;
		ancestorNode && domFacade.getNodeType(ancestorNode) !== NODE_TYPES.DOCUMENT_NODE;
		ancestorNode = domFacade.getParentNodePointer(ancestorNode as ChildNodePointer, bucket)
	) {
		const previousSibling = domFacade.getNextSiblingPointer(
			ancestorNode as ChildNodePointer,
			bucket
		);
		if (previousSibling) {
			nodeStack.push(previousSibling);
		}
	}

	let nephewGenerator = null;
	return {
		next: () => {
			while (nephewGenerator || nodeStack.length) {
				if (!nephewGenerator) {
					nephewGenerator = createDescendantGenerator(
						domFacade,
						nodeStack[0],
						null,
						bucket
					);

					const toReturn = ready(createPointerValue(nodeStack[0], domFacade));
					// Set the focus to the concurrent sibling of this node
					const nextNode = domFacade.getNextSiblingPointer(nodeStack[0], bucket);
					if (!nextNode) {
						// This is the last sibling, we can continue with a child of the current
						// node (an uncle of the original node) in the next iteration
						nodeStack.shift();
					} else {
						nodeStack[0] = nextNode;
					}
					return toReturn;
				}

				const nephew = nephewGenerator.next(IterationHint.NONE);

				if (nephew.done) {
					// We are done with the descendants of the node currently on the stack
					nephewGenerator = null;

					continue;
				}

				return nephew;
			}

			return DONE_TOKEN;
		},
	};
}

class FollowingAxis extends Expression {
	private _testExpression: TestAbstractExpression;
	constructor(testExpression: TestAbstractExpression) {
		super(testExpression.specificity, [testExpression], {
			resultOrder: RESULT_ORDERINGS.SORTED,
			peer: true,
			subtree: false,
			canBeStaticallyEvaluated: false,
		});

		this._testExpression = testExpression;
	}

	public evaluate(dynamicContext, executionParameters) {
		const contextItem = dynamicContext.contextItem;
		if (contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const domFacade = executionParameters.domFacade;

		return sequenceFactory
			.create(
				createFollowingGenerator(
					domFacade,
					contextItem.value,
					this._testExpression.getBucket()
				)
			)
			.filter((item) => {
				return this._testExpression.evaluateToBoolean(
					dynamicContext,
					item,
					executionParameters
				);
			});
	}
}

export default FollowingAxis;

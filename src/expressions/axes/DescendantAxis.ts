import Expression, { RESULT_ORDERINGS } from '../Expression';

import SequenceFactory from '../dataTypes/SequenceFactory';
import createNodeValue from '../dataTypes/createNodeValue';
import createSingleValueIterator from '../util/createSingleValueIterator';
import { DONE_TOKEN, ready } from '../util/iterators';
import createChildGenerator from '../util/createChildGenerator';
import TestAbstractExpression from '../tests/TestAbstractExpression';
import IDomFacade from '../../domFacade/IDomFacade';
import ConcreteNode, { ConcreteChildNode } from '../../domFacade/ConcreteNode';

function createInclusiveDescendantGenerator(domFacade: IDomFacade, node: ConcreteNode) {
	const descendantIteratorStack: Array<Iterator<ConcreteChildNode>> = [
		createSingleValueIterator(node)
	];
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
			descendantIteratorStack.unshift(createChildGenerator(domFacade, value.value));
			return ready(createNodeValue(value.value));
		}
	};
}

class DescendantAxis extends Expression {
	_descendantExpression: TestAbstractExpression;
	_isInclusive: boolean;
	constructor(
		descendantExpression: TestAbstractExpression,
		options: { inclusive: boolean } | undefined
	) {
		options = options || { inclusive: false };
		super(descendantExpression.specificity, [descendantExpression], {
			resultOrder: RESULT_ORDERINGS.SORTED,
			subtree: true,
			peer: false,
			canBeStaticallyEvaluated: false
		});

		this._descendantExpression = descendantExpression;
		this._isInclusive = !!options.inclusive;
	}

	evaluate(dynamicContext, executionParameters) {
		if (dynamicContext.contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const inclusive = this._isInclusive;
		const iterator = createInclusiveDescendantGenerator(
			executionParameters.domFacade,
			dynamicContext.contextItem.value
		);
		if (!inclusive) {
			iterator.next();
		}
		const descendantSequence = SequenceFactory.create(iterator);
		return descendantSequence.filter(item => {
			return this._descendantExpression.evaluateToBoolean(dynamicContext, item);
		});
	}
}
export default DescendantAxis;

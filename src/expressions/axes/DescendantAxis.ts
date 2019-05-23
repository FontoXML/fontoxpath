import { ConcreteChildNode } from '../../domFacade/ConcreteNode';
import IDomFacade from '../../domFacade/IDomFacade';
import createNodeValue from '../dataTypes/createNodeValue';
import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import TestAbstractExpression from '../tests/TestAbstractExpression';
import createChildGenerator from '../util/createChildGenerator';
import createSingleValueIterator from '../util/createSingleValueIterator';
import { DONE_TOKEN, IAsyncIterator, IterationHint, ready } from '../util/iterators';

function createInclusiveDescendantGenerator(
	domFacade: IDomFacade,
	node: ConcreteChildNode,
	bucket: string|null
): IAsyncIterator<Value> {
	const descendantIteratorStack: IAsyncIterator<ConcreteChildNode>[] = [
		createSingleValueIterator(node)
	];
	return {
		next: (hint: IterationHint) => {
			if (
				descendantIteratorStack.length > 0 &&
				(hint & IterationHint.SKIP_DESCENDANTS) !== 0
			) {
				// The next iterator on the stack will iterate over the last value's children, skip
				// it to skip the entire subtree
				descendantIteratorStack.shift();
			}
			if (!descendantIteratorStack.length) {
				return DONE_TOKEN;
			}
			let value = descendantIteratorStack[0].next(IterationHint.NONE);
			while (value.done) {
				descendantIteratorStack.shift();
				if (!descendantIteratorStack.length) {
					return DONE_TOKEN;
				}
				value = descendantIteratorStack[0].next(IterationHint.NONE);
			}
			// Iterator over these children next
			descendantIteratorStack.unshift(createChildGenerator(domFacade, value.value, bucket));
			return ready(createNodeValue(value.value));
		}
	};
}

class DescendantAxis extends Expression {
	private _descendantExpression: TestAbstractExpression;
	private _isInclusive: boolean;
	constructor(
		descendantExpression: TestAbstractExpression,
		options: { inclusive: boolean } | undefined
	) {
		options = options || { inclusive: false };
		super(descendantExpression.specificity, [descendantExpression], {
			canBeStaticallyEvaluated: false,
			peer: false,
			resultOrder: RESULT_ORDERINGS.SORTED,
			subtree: true
		});

		this._descendantExpression = descendantExpression;
		this._isInclusive = !!options.inclusive;
	}

	public evaluate(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): ISequence {
		if (dynamicContext.contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const inclusive = this._isInclusive;
		const iterator = createInclusiveDescendantGenerator(
			executionParameters.domFacade,
			dynamicContext.contextItem.value,
			this._descendantExpression.getBucket()
		);
		if (!inclusive) {
			iterator.next(IterationHint.NONE);
		}
		const descendantSequence = sequenceFactory.create(iterator);
		return descendantSequence.filter(item => {
			return this._descendantExpression.evaluateToBoolean(dynamicContext, item);
		});
	}
}
export default DescendantAxis;

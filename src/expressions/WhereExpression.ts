import ISequence from './dataTypes/ISequence';
import sequenceFactory from './dataTypes/sequenceFactory';
import Value from './dataTypes/Value';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from './Expression';
import PossiblyUpdatingExpression from './PossiblyUpdatingExpression';
import Specificity from './Specificity';
import { IAsyncIterator, IterationHint, notReady } from './util/iterators';

class WhereExpression extends PossiblyUpdatingExpression {
	constructor(testExpression: Expression, returnExpression: Expression) {
		const specificity = new Specificity({});
		super(specificity, [testExpression, returnExpression], {
			canBeStaticallyEvaluated: false,
			peer: false,
			resultOrder: RESULT_ORDERINGS.UNSORTED,
			subtree: false
		});
	}

	public performFunctionalEvaluation(
		dynamicContext: DynamicContext,
		_executionParameters: ExecutionParameters,
		sequenceCallbacks: ((dynamicContext: DynamicContext) => ISequence)[]
	) {
		let resultIterator: IAsyncIterator<Value> | null = null;
		const whereExpressioResultSequence = sequenceCallbacks[0](dynamicContext);

		return sequenceFactory.create({
			next: (hint: IterationHint) => {
				if (!resultIterator) {
					const whereExpressionResult = whereExpressioResultSequence.tryGetEffectiveBooleanValue();

					if (!whereExpressionResult.ready) {
						return notReady(whereExpressionResult.promise);
					}

					const resultSequence = whereExpressionResult.value
						? sequenceCallbacks[1](dynamicContext)
						: sequenceFactory.empty();
					resultIterator = resultSequence.value;
				}
				return resultIterator.next(hint);
			}
		});
	}
}

export default WhereExpression;

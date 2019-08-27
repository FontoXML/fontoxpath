import ISequence from './dataTypes/ISequence';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from './Expression';
import PossiblyUpdatingExpression, { SequenceCallbacks } from './PossiblyUpdatingExpression';
import Specificity from './Specificity';

class WhereExpression extends PossiblyUpdatingExpression {
	constructor(testExpression: Expression) {
		const specificity = new Specificity({});
		super(specificity, [testExpression], {
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
		// TODO
		// const ifExpressionResultSequence = sequenceCallbacks[0](dynamicContext);
		// return ifExpressionResultSequence.tryGetEffectiveBooleanValue();
		return null;
	}
}

export default WhereExpression;

import PossiblyUpdatingExpression from '../PossiblyUpdatingExpression';
import Specificity from '../Specificity';
import SequenceFactory from '../dataTypes/SequenceFactory';
import concatSequences from '../util/concatSequences';
import Expression from '../Expression';

/**
 * The Sequence selector evaluates its operands and returns them as a single sequence
 *
 * @extends {PossiblyUpdatingExpression}
 */
class SequenceOperator extends PossiblyUpdatingExpression {
	/**
	 * @param  {!Array<!Expression>}  expressions
	 */
	constructor(expressions: Array<Expression>) {
		super(
			expressions.reduce(function (specificity, selector) {
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			expressions,
			{
				resultOrder: PossiblyUpdatingExpression.RESULT_ORDERINGS.UNSORTED,
				canBeStaticallyEvaluated: expressions.every(selector => selector.canBeStaticallyEvaluated)
			});
	}

	performFunctionalEvaluation (dynamicContext, _executionParameters, sequenceCallbacks) {
		if (!sequenceCallbacks.length) {
			return SequenceFactory.empty();
		}
		return concatSequences(sequenceCallbacks.map(cb => cb(dynamicContext)));
	}
}

export default SequenceOperator;

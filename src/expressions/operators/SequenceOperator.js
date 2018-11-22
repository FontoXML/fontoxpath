import PossiblyUpdatingExpression from '../PossiblyUpdatingExpression';
import Expression from '../Expression';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import concatSequences from '../util/concatSequences';
/**
 * The Sequence selector evaluates its operands and returns them as a single sequence
 *
 * @extends {PossiblyUpdatingExpression}
 */
class SequenceOperator extends PossiblyUpdatingExpression {
	/**
	 * @param  {!Array<!Expression>}  expressions
	 */
	constructor (expressions) {
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
			return Sequence.empty();
		}
		return concatSequences(sequenceCallbacks.map(cb => cb(dynamicContext)));
	}
}

export default SequenceOperator;

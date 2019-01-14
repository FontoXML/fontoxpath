import SequenceFactory from '../dataTypes/SequenceFactory';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import PossiblyUpdatingExpression from '../PossiblyUpdatingExpression';
import Specificity from '../Specificity';
import concatSequences from '../util/concatSequences';

/**
 * The Sequence selector evaluates its operands and returns them as a single sequence
 */
class SequenceOperator extends PossiblyUpdatingExpression {
	constructor(expressions: Expression[]) {
		super(
			expressions.reduce(function(specificity, selector) {
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			expressions,
			{
				resultOrder: RESULT_ORDERINGS.UNSORTED,
				canBeStaticallyEvaluated: expressions.every(
					selector => selector.canBeStaticallyEvaluated
				)
			}
		);
	}

	public performFunctionalEvaluation(dynamicContext, _executionParameters, sequenceCallbacks) {
		if (!sequenceCallbacks.length) {
			return SequenceFactory.empty();
		}
		return concatSequences(sequenceCallbacks.map(cb => cb(dynamicContext)));
	}
}

export default SequenceOperator;

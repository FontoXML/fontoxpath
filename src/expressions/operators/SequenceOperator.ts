import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
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
			expressions.reduce((specificity, selector) => {
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			expressions,
			{
				resultOrder: RESULT_ORDERINGS.UNSORTED,
				canBeStaticallyEvaluated: expressions.every(
					(selector) => selector.canBeStaticallyEvaluated
				),
			}
		);
	}

	public performFunctionalEvaluation(
		dynamicContext: DynamicContext,
		_executionParameters: ExecutionParameters,
		sequenceCallbacks: ((innerDynamicContext: DynamicContext) => ISequence)[]
	) {
		if (!sequenceCallbacks.length) {
			return sequenceFactory.empty();
		}
		return concatSequences(sequenceCallbacks.map((cb) => cb(dynamicContext)));
	}
}

export default SequenceOperator;

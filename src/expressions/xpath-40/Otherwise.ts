import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceType, ValueType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import PossiblyUpdatingExpression, { SequenceCallbacks } from '../PossiblyUpdatingExpression';
import Specificity from '../Specificity';

/**
 * The 'otherwise' expression: returns the first operand that's not empty
 */
class Otherwise extends PossiblyUpdatingExpression {
	constructor(expressions: Expression[], type: SequenceType) {
		const maxSpecificity = expressions.reduce((maxSpecificitySoFar, expression) => {
			if (maxSpecificitySoFar.compareTo(expression.specificity) > 0) {
				return maxSpecificitySoFar;
			}
			return expression.specificity;
		}, new Specificity({}));
		super(
			maxSpecificity,
			expressions,
			{
				canBeStaticallyEvaluated: expressions.every(
					(expression) => expression.canBeStaticallyEvaluated,
				),
			},
			type,
		);
	}

	public override performFunctionalEvaluation(
		dynamicContext: DynamicContext,
		_executionParameters: ExecutionParameters,
		sequenceCallbacks: SequenceCallbacks,
	): ISequence {
		for (const cb of sequenceCallbacks) {
			const sequence = cb(dynamicContext);
			if (!sequence.isEmpty()) {
				return sequence;
			}
		}
		return sequenceFactory.empty();
	}
}
export default Otherwise;

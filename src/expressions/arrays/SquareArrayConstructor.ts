import Expression, { RESULT_ORDERINGS } from '../Expression';

import Specificity from '../Specificity';
import ArrayValue from '../dataTypes/ArrayValue';
import SequenceFactory from '../dataTypes/SequenceFactory';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';

class SquareArrayConstructor extends Expression {
	_members: Expression[];
	constructor(members: Array<Expression>) {
		super(
			new Specificity({
				[Specificity.EXTERNAL_KIND]: 1
			}),
			members,
			{
				canBeStaticallyEvaluated: members.every(member => member.canBeStaticallyEvaluated)
			}
		);

		this._members = members;
	}

	evaluate(dynamicContext, executionParameters) {
		return SequenceFactory.singleton(
			new ArrayValue(
				this._members.map(entry =>
					createDoublyIterableSequence(
						entry.evaluateMaybeStatically(dynamicContext, executionParameters)
					)
				)
			)
		);
	}
}
export default SquareArrayConstructor;

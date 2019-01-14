import Expression from '../Expression';

import ArrayValue from '../dataTypes/ArrayValue';
import SequenceFactory from '../dataTypes/SequenceFactory';
import Specificity from '../Specificity';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';

class SquareArrayConstructor extends Expression {
	private _members: Expression[];
	constructor(members: Expression[]) {
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

	public evaluate(dynamicContext, executionParameters) {
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

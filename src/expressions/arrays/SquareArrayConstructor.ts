import Expression from '../Expression';

import ArrayValue from '../dataTypes/ArrayValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
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
				canBeStaticallyEvaluated: true
			}
		);

		this._members = members;
	}

	public evaluate(dynamicContext, executionParameters) {
		return sequenceFactory.singleton(
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

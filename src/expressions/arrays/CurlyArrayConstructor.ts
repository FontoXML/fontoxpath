import Expression from '../Expression';

import ArrayValue from '../dataTypes/ArrayValue';
import SequenceFactory from '../dataTypes/sequenceFactory';
import Specificity from '../Specificity';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';

class CurlyArrayConstructor extends Expression {
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
		if (this._members.length === 0) {
			return SequenceFactory.singleton(new ArrayValue([]));
		}
		return this._members[0]
			.evaluateMaybeStatically(dynamicContext, executionParameters)
			.mapAll(allValues =>
				SequenceFactory.singleton(
					new ArrayValue(
						allValues.map(item =>
							createDoublyIterableSequence(SequenceFactory.singleton(item))
						)
					)
				)
			);
	}
}
export default CurlyArrayConstructor;

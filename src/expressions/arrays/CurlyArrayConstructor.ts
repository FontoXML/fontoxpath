import Expression from '../Expression';

import ArrayValue from '../dataTypes/ArrayValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Specificity from '../Specificity';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';

class CurlyArrayConstructor extends Expression {
	private _members: Expression[];
	constructor(members: Expression[]) {
		super(
			new Specificity({
				[Specificity.EXTERNAL_KIND]: 1,
			}),
			members,
			{
				canBeStaticallyEvaluated: members.every(
					(member) => member.canBeStaticallyEvaluated
				),
			}
		);

		this._members = members;
	}

	public evaluate(dynamicContext, executionParameters) {
		if (this._members.length === 0) {
			return sequenceFactory.singleton(new ArrayValue([]));
		}
		return this._members[0]
			.evaluateMaybeStatically(dynamicContext, executionParameters)
			.mapAll((allValues) =>
				sequenceFactory.singleton(
					new ArrayValue(
						allValues.map((item) =>
							createDoublyIterableSequence(sequenceFactory.singleton(item))
						)
					)
				)
			);
	}
}
export default CurlyArrayConstructor;

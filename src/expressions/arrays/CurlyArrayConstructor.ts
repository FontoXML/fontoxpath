import ArrayValue, { ABSENT_JSON_ARRAY } from '../dataTypes/ArrayValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression from '../Expression';
import Specificity from '../Specificity';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';

class CurlyArrayConstructor extends Expression {
	private _members: Expression[];
	constructor(members: Expression[], type: SequenceType) {
		super(
			new Specificity({
				[Specificity.EXTERNAL_KIND]: 1,
			}),
			members,
			{
				canBeStaticallyEvaluated: members.every(
					(member) => member.canBeStaticallyEvaluated
				),
			},
			false,
			type
		);

		this._members = members;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		if (this._members.length === 0) {
			return sequenceFactory.singleton(new ArrayValue([], ABSENT_JSON_ARRAY));
		}
		return this._members[0]
			.evaluateMaybeStatically(dynamicContext, executionParameters)
			.mapAll((allValues) =>
				sequenceFactory.singleton(
					new ArrayValue(
						allValues.map((item) =>
							createDoublyIterableSequence(sequenceFactory.singleton(item))
						),
						ABSENT_JSON_ARRAY
					)
				)
			);
	}
}
export default CurlyArrayConstructor;

import ArrayValue from '../dataTypes/ArrayValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression from '../Expression';
import Specificity from '../Specificity';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';

class SquareArrayConstructor extends Expression {
	private _members: Expression[];
	constructor(members: Expression[], type: SequenceType) {
		super(
			new Specificity({
				[Specificity.EXTERNAL_KIND]: 1,
			}),
			members,
			{
				canBeStaticallyEvaluated: members.every(
					(member) => member.canBeStaticallyEvaluated,
				),
			},
			false,
			type,
		);

		this._members = members;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		return sequenceFactory.singleton(
			new ArrayValue(
				this._members.map((entry) =>
					createDoublyIterableSequence(
						entry.evaluateMaybeStatically(dynamicContext, executionParameters),
					),
				),
			),
		);
	}
}
export default SquareArrayConstructor;

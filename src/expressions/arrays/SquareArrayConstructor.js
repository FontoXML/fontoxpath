import Expression from '../Expression';
import Specificity from '../Specificity';
import ArrayValue from '../dataTypes/ArrayValue';
import Sequence from '../dataTypes/Sequence';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';

/**
 * @extends {Expression}
 */
class SquareArrayConstructor extends Expression {
	/**
	 * @param   {!Array<!Expression>}  members    The expressions for the values
	 */
	constructor (members) {
		super(
			new Specificity({
			[Specificity.EXTERNAL_KIND]: 1
			}),
			members,
			{
				canBeStaticallyEvaluated: members.every(member => member.canBeStaticallyEvaluated)
			});

		this._members = members;
	}

	evaluate (dynamicContext, executionParameters) {
		return Sequence.singleton(
			new ArrayValue(
				this._members.map(entry => createDoublyIterableSequence(entry.evaluateMaybeStatically(dynamicContext, executionParameters)))));
	}
}
export default SquareArrayConstructor;

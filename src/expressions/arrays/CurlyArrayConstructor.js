import Expression from '../Expression';
import Specificity from '../Specificity';
import ArrayValue from '../dataTypes/ArrayValue';
import SequenceFactory from '../dataTypes/SequenceFactory';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';

/**
 * @extends {Expression}
 */
class CurlyArrayConstructor extends Expression {
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
		if (this._members.length === 0) {
			return SequenceFactory.singleton(new ArrayValue([]));
		}
		return this._members[0].evaluateMaybeStatically(dynamicContext, executionParameters)
			.mapAll(allValues => SequenceFactory.singleton(
				new ArrayValue(allValues.map(item => createDoublyIterableSequence(SequenceFactory.singleton(item))))));
	}
}
export default CurlyArrayConstructor;

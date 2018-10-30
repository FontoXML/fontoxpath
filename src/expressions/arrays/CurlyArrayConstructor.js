import Expression from '../Expression';
import Specificity from '../Specificity';
import ArrayValue from '../dataTypes/ArrayValue';
import Sequence from '../dataTypes/Sequence';

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
			return Sequence.singleton(new ArrayValue([]));
		}
		return this._members[0].evaluateMaybeStatically(dynamicContext, executionParameters)
			.mapAll(allValues => Sequence.singleton(new ArrayValue(allValues.map(Sequence.singleton))));
	}
}
export default CurlyArrayConstructor;

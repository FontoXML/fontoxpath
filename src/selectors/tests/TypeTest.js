import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import BooleanValue from '../dataTypes/BooleanValue';
import Specificity from '../Specificity';

/**
 * @extends {Selector}
 */
class TypeTest extends Selector {
	/**
	 * @param  {string}  type
	 */
	constructor (type) {
		super(new Specificity({}), Selector.RESULT_ORDERINGS.SORTED);

		this._type = type;
	}

	equals (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof TypeTest &&
			this._type === otherSelector._type;
	}

	evaluate (dynamicContext) {
		var booleanValue = dynamicContext.contextItem.value[0].instanceOfType(this._type) ? BooleanValue.TRUE : BooleanValue.FALSE;
		return Sequence.singleton(booleanValue);
	}
}
export default TypeTest;

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

	toString () {
		if (!this._stringifiedValue) {
			this._stringifiedValue = `(type-test ${this._type})`;
		}

		return this._stringifiedValue;
	}

	evaluate (dynamicContext) {
		var booleanValue = dynamicContext.contextItem.instanceOfType(this._type) ? BooleanValue.TRUE : BooleanValue.FALSE;
		return Sequence.singleton(booleanValue);
	}
}
export default TypeTest;

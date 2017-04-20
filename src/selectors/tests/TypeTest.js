import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import Specificity from '../Specificity';
import createAtomicValue from '../dataTypes/createAtomicValue';
import isInstanceOfType from '../dataTypes/isInstanceOfType';

/**
 * @extends {Selector}
 */
class TypeTest extends Selector {
	/**
	 * @param  {string}  type
	 */
	constructor (type) {
		super(new Specificity({}));

		this._type = type;
	}

	evaluate (dynamicContext) {
		var booleanValue = createAtomicValue(
			isInstanceOfType(dynamicContext.contextItem, this._type), 'xs:boolean');
		return Sequence.singleton(booleanValue);
	}
}
export default TypeTest;

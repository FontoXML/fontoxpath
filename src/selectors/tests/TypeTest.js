import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import Specificity from '../Specificity';
import createAtomicValue from '../dataTypes/createAtomicValue';
import isSubtypeOf from '../dataTypes/isSubtypeOf';

/**
 * @extends {Selector}
 */
class TypeTest extends Selector {
	/**
	 * @param  {string}  type
	 */
	constructor (type) {
		super(new Specificity({}), { canBeStaticallyEvaluated: false });

		this._type = type;
	}

	evaluate (dynamicContext) {
		var booleanValue = createAtomicValue(
			isSubtypeOf(dynamicContext.contextItem.type, this._type), 'xs:boolean');
		return Sequence.singleton(booleanValue);
	}
}
export default TypeTest;

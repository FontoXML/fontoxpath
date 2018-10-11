import TestAbstractExpression from './TestAbstractExpression';
import Specificity from '../Specificity';
import isSubtypeOf from '../dataTypes/isSubtypeOf';

class TypeTest extends TestAbstractExpression {
	/**
	 * @param  {QName}
	 */
	constructor (type) {
		super(new Specificity({}));
		this._type = type;
	}

	evaluateToBoolean (_dynamicContext, item) {
		return isSubtypeOf(item.type, this._type.prefix ? this._type.prefix + ':' + this._type.localName : this._type.localName);
	}
}
export default TypeTest;

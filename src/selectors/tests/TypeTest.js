import TestAbstractExpression from './TestAbstractExpression';
import Specificity from '../Specificity';
import isSubtypeOf from '../dataTypes/isSubtypeOf';

/**
 * @extends {./TestAbstractExpression}
 */
class TypeTest extends TestAbstractExpression {
	/**
	 * @param  {string}  prefix         The prefix of the given type
	 * @param  {string}  namespaceURI   The namespace uri of the given type. At the moment, this is not used.
	 * @param  {string}  typeName       The actual name of the type
	 */
	constructor (prefix, namespaceURI, typeName) {
		super(new Specificity({}));
		if (namespaceURI) {
			throw new Error('Not implemented: typetests with a namespace URI.');
		}

		this._typeName = prefix ? prefix + ':' + typeName : typeName;
	}

	evaluateToBoolean (_dynamicContext, item) {
		return isSubtypeOf(item.type, this._typeName);
	}
}
export default TypeTest;

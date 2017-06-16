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
	 * @param  {string}  prefix         The prefix of the given type
	 * @param  {string}  namespaceURI   The namespace uri of the given type. At the moment, this is not used.
	 * @param  {string}  typeName       The actual name of the type
	 */
	constructor (prefix, namespaceURI, typeName) {
		super(new Specificity({}), { canBeStaticallyEvaluated: false });
		if (namespaceURI) {
			throw new Error('Not implemented: typetests with a namespace URI.');
		}

		this._typeName = prefix ? prefix + ':' + typeName : typeName;
	}


	/**
	 * @param   {!../DynamicContext}      dynamicContext
	 * @return  {!../dataTypes/Sequence}
	 */
	evaluate (dynamicContext) {
		var booleanValue = createAtomicValue(
			isSubtypeOf(dynamicContext.contextItem.type, this._typeName), 'xs:boolean');
		return Sequence.singleton(booleanValue);
	}
}
export default TypeTest;

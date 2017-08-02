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

	evaluate (dynamicContext) {
		return this.evaluateToBoolean(dynamicContext, dynamicContext.contextItem) ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
	}

	/**
	 * @param   {!../DynamicContext}      dynamicContext
	 * @return  {!../dataTypes/Sequence}
	 */
	evaluateToBoolean (_dynamicContext, item) {
		return isSubtypeOf(item.type, this._typeName);
	}
}
export default TypeTest;

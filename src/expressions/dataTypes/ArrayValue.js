import FunctionValue from './FunctionValue';
import Sequence from './Sequence';
import arrayGet from '../functions/builtInFunctions.arrays.get';
import { ARRAY_NAMESPACE_URI } from '../staticallyKnownNamespaces';

class ArrayValue extends FunctionValue {
	/**
	 * @param  {!Array<!Sequence>}  members
	 */
	constructor (members) {
		super(
			{
				value: (dynamicContext, executionParameters, staticContext, key) => arrayGet(dynamicContext, executionParameters, staticContext, Sequence.singleton(this), key),
				localName: 'get',
				namespaceURI: ARRAY_NAMESPACE_URI,
				argumentTypes: ['xs:integer'],
				arity: 1,
				returnType: 'item()*'
			});
		this.type = 'array(*)';
		this.members = members;
	}
}

export default ArrayValue;

import FunctionValue from './FunctionValue';
import Sequence from './Sequence';
import arrayGet from '../functions/builtInFunctions.arrays.get';
import { ARRAY_NAMESPACE_URI } from '../staticallyKnownNamespaces';

class ArrayValue extends FunctionValue {
	members: (() => Sequence)[];
	constructor(members: Array<(() => Sequence)>) {
		super(
			{
				value: (dynamicContext, executionParameters, staticContext, key) => arrayGet(dynamicContext, executionParameters, staticContext, Sequence.singleton(this), key),
				localName: 'get',
				namespaceURI: ARRAY_NAMESPACE_URI,
				argumentTypes: [{ type: 'xs:integer', isRestArgument: false }],
				arity: 1,
				returnType: { type: 'item()', occurrence: '*' }
			});
		this.type = 'array(*)';
		this.members = members;
	}
}

export default ArrayValue;

import FunctionValue from './FunctionValue';
import ISequence from './ISequence';
import SequenceFactory from './SequenceFactory';
import arrayGet from '../functions/builtInFunctions.arrays.get';
import { ARRAY_NAMESPACE_URI } from '../staticallyKnownNamespaces';

class ArrayValue extends FunctionValue {
	members: (() => ISequence)[];
	constructor(members: Array<(() => ISequence)>) {
		super(
			{
				value: (dynamicContext, executionParameters, staticContext, key) => arrayGet(dynamicContext, executionParameters, staticContext, SequenceFactory.singleton(this), key),
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

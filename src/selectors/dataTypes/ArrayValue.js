import FunctionValue from './FunctionValue';
import Sequence from './Sequence';
import arrayGet from '../functions/builtInFunctions.arrays.get';

/**
 * @extends {./FunctionValue}
 */
class ArrayValue extends FunctionValue {
	/**
	 * @param  {Array<./Value>}  members
	 */
	constructor (members) {
		super({
			value: (dynamicContext, key) => arrayGet(dynamicContext, Sequence.singleton(this), key),
			name: 'array:get',
			argumentTypes: ['xs:integer'],
			arity: 1,
			returnType: 'item()*'
		});
		this.type = 'array(*)';
		this.members = members;
	}
}

export default ArrayValue;

import FunctionValue from './FunctionValue';
import Sequence from './Sequence';
import mapGet from '../functions/builtInFunctions.maps.get';

/**
 * @extends {./FunctionValue}
 */
class MapValue extends FunctionValue {
	/**
	 * @param  {Array<{key: !./Value, value: ./Sequence}>}  keyValuePairs
	 */
	constructor (keyValuePairs) {
		super({
			value: (dynamicContext, key) => mapGet(dynamicContext, Sequence.singleton(this), key),
			name: 'map:get',
			argumentTypes: ['item()'],
			arity: 1,
			returnType: 'item()*'
		});
		this.type = 'map(*)';
		this.keyValuePairs = keyValuePairs;
	}
}

export default MapValue;

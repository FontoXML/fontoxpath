import FunctionValue from './FunctionValue';
import Sequence from './Sequence';
import Value from './Value';
import mapGet from '../functions/builtInFunctions.maps.get';
import { MAP_NAMESPACE_URI } from '../staticallyKnownNamespaces';

class MapValue extends FunctionValue {
	/**
	 * @param  {Array<{key: !Value, value: !Sequence}>}  keyValuePairs
	 */
	constructor (keyValuePairs) {
		super({
			value: (dynamicContext, executionParameters, staticContext, key) => mapGet(dynamicContext, executionParameters, staticContext, Sequence.singleton(this), key),
			localName: 'get',
			namespaceURI: MAP_NAMESPACE_URI,
			argumentTypes: ['item()'],
			arity: 1,
			returnType: 'item()*'
		});
		this.type = 'map(*)';
		this.keyValuePairs = keyValuePairs;
	}
}

export default MapValue;

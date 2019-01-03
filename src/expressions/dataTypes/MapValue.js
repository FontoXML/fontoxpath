import FunctionValue from './FunctionValue';
import SequenceFactory from './SequenceFactory';
import Value from './Value';
import mapGet from '../functions/builtInFunctions.maps.get';
import { MAP_NAMESPACE_URI } from '../staticallyKnownNamespaces';

class MapValue extends FunctionValue {
	/**
	 * @param  {Array<{key: !Value, value: !function():!ISequence}>}  keyValuePairs
	 */
	constructor (keyValuePairs) {
		super({
			value: (dynamicContext, executionParameters, staticContext, key) => mapGet(dynamicContext, executionParameters, staticContext, SequenceFactory.singleton(this), key),
			localName: 'get',
			namespaceURI: MAP_NAMESPACE_URI,
			argumentTypes: [{ type: 'item()' }],
			arity: 1,
			returnType: { type: 'item()', occurrence: '*' }
		});
		this.type = 'map(*)';
		this.keyValuePairs = keyValuePairs;
	}
}

export default MapValue;

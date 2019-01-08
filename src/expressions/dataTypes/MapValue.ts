import FunctionValue from "./FunctionValue";
import { MAP_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import mapGet from '../functions/builtInFunctions.maps.get';
import SequenceFactory from "./SequenceFactory";
import ISequence from "./ISequence";
import Value from "./Value";

class MapValue extends FunctionValue {
	keyValuePairs: { value: () => ISequence, key: Value }[];
	constructor(keyValuePairs) {
		super({
			value: (dynamicContext, executionParameters, staticContext, key) => mapGet(dynamicContext, executionParameters, staticContext, SequenceFactory.singleton(this), key),
			localName: 'get',
			namespaceURI: MAP_NAMESPACE_URI,
			argumentTypes: [{ type: 'item()', isRestArgument: false }],
			arity: 1,
			returnType: { type: 'item()', occurrence: '*' }
		});
		this.type = 'map(*)';
		this.keyValuePairs = keyValuePairs;
	}
}
export default MapValue;

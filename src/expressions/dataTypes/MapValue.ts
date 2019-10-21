import mapGet from '../functions/builtInFunctions.maps.get';
import { MAP_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import FunctionValue from './FunctionValue';
import ISequence from './ISequence';
import sequenceFactory from './sequenceFactory';
import Value from './Value';

class MapValue extends FunctionValue<ISequence> {
	public keyValuePairs: { key: Value; value: () => ISequence }[];
	constructor(keyValuePairs: { key: Value; value: () => ISequence }[]) {
		super({
			argumentTypes: [{ type: 'item()', isRestArgument: false }],
			arity: 1,
			localName: 'get',
			namespaceURI: MAP_NAMESPACE_URI,
			value: (dynamicContext, executionParameters, staticContext, key) =>
				mapGet(
					dynamicContext,
					executionParameters,
					staticContext,
					sequenceFactory.singleton(this),
					key
				),
			returnType: { type: 'item()', occurrence: '*' }
		});
		this.type = 'map(*)';
		this.keyValuePairs = keyValuePairs;
	}
}
export default MapValue;

import mapGet from '../functions/builtInFunctions_maps_get';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import FunctionValue from './FunctionValue';
import ISequence from './ISequence';
import sequenceFactory from './sequenceFactory';
import Value, { SequenceMultiplicity, ValueType } from './Value';

class MapValue extends FunctionValue<ISequence> {
	public keyValuePairs: { key: Value; value: () => ISequence }[];
	constructor(keyValuePairs: { key: Value; value: () => ISequence }[]) {
		super({
			// argumentTypes: [{ type: 'item()', isRestArgument: false }],
			argumentTypes: [{ type: ValueType.ITEM, mult: SequenceMultiplicity.EXACTLY_ONE }],
			arity: 1,
			localName: 'get',
			namespaceURI: BUILT_IN_NAMESPACE_URIS.MAP_NAMESPACE_URI,
			value: (dynamicContext, executionParameters, staticContext, key) =>
				mapGet(
					dynamicContext,
					executionParameters,
					staticContext,
					sequenceFactory.singleton(this),
					key,
				),
			returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
		});
		this.type = ValueType.MAP;
		this.keyValuePairs = keyValuePairs;
	}
}
export default MapValue;

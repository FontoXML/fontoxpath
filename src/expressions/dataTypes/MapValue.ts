import mapGet from '../functions/builtInFunctions_maps_get';
import { MAP_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import { BaseType } from './BaseType';
import FunctionValue from './FunctionValue';
import ISequence from './ISequence';
import sequenceFactory from './sequenceFactory';
import Value, { SequenceMultiplicity } from './Value';

class MapValue extends FunctionValue<ISequence> {
	public keyValuePairs: { key: Value; value: () => ISequence }[];
	constructor(keyValuePairs: { key: Value; value: () => ISequence }[]) {
		super({
			// argumentTypes: [{ type: 'item()', isRestArgument: false }],
			argumentTypes: [{ kind: BaseType.ITEM, seqType: SequenceMultiplicity.EXACTLY_ONE }],
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
			returnType: { kind: BaseType.ITEM, seqType: SequenceMultiplicity.ZERO_OR_MORE },
		});
		this.type = { kind: BaseType.MAP, items: [], seqType: SequenceMultiplicity.EXACTLY_ONE };
		this.keyValuePairs = keyValuePairs;
	}
}
export default MapValue;

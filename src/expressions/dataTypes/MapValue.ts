import mapGet from '../functions/builtInFunctions_maps_get';
import { MAP_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import FunctionValue from './FunctionValue';
import ISequence from './ISequence';
import sequenceFactory from './sequenceFactory';
import Value, { BaseType, SequenceType } from './Value';

class MapValue extends FunctionValue<ISequence> {
	public keyValuePairs: { key: Value; value: () => ISequence }[];
	constructor(keyValuePairs: { key: Value; value: () => ISequence }[]) {
		super({
			// argumentTypes: [{ type: 'item()', isRestArgument: false }],
			argumentTypes: [{ kind: BaseType.ITEM, seqType: SequenceType.EXACTLY_ONE }],
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
			returnType: { kind: BaseType.ITEM, occurrence: SequenceType.ZERO_OR_MORE },
		});
		this.type = { kind: BaseType.MAP, items: [], seqType: SequenceType.EXACTLY_ONE };
		this.keyValuePairs = keyValuePairs;
	}
}
export default MapValue;

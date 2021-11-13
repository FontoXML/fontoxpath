import arrayGet from '../functions/builtInFunctions_arrays_get';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import FunctionValue from './FunctionValue';
import ISequence from './ISequence';
import { JsonArray } from './MapValue';
import sequenceFactory from './sequenceFactory';
import { SequenceMultiplicity, ValueType } from './Value';

export const ABSENT_JSON_ARRAY = Symbol('ABSENT_JSON_ARRAY');

class ArrayValue extends FunctionValue {
	public members: (() => ISequence)[];
	public jsonArray: JsonArray | typeof ABSENT_JSON_ARRAY;
	constructor(members: (() => ISequence)[], jsonArray: JsonArray | typeof ABSENT_JSON_ARRAY) {
		super({
			value: (dynamicContext, executionParameters, staticContext, key) =>
				arrayGet(
					dynamicContext,
					executionParameters,
					staticContext,
					sequenceFactory.singleton(this),
					key
				),
			localName: 'get',
			namespaceURI: BUILT_IN_NAMESPACE_URIS.ARRAY_NAMESPACE_URI,
			// argumentTypes: [{ type: { kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE }, isResArgument: false }],
			argumentTypes: [{ type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE }],
			arity: 1,
			returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
		});
		this.type = ValueType.ARRAY;
		this.members = members;
		this.jsonArray = jsonArray;
	}
}

export default ArrayValue;

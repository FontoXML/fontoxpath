import arrayGet from '../functions/builtInFunctions_arrays_get';
import { ARRAY_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import FunctionValue from './FunctionValue';
import ISequence from './ISequence';
import sequenceFactory from './sequenceFactory';
import { SequenceMultiplicity, ValueType } from './Value';

class ArrayValue extends FunctionValue {
	public members: (() => ISequence)[];
	constructor(members: (() => ISequence)[]) {
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
			namespaceURI: ARRAY_NAMESPACE_URI,
			// argumentTypes: [{ type: { kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE }, isRestArgument: false }],
			argumentTypes: [
				{ type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE }
			],
			arity: 1,
			returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.EXACTLY_ONE }
		});
		this.type = ValueType.ARRAY;
		this.members = members;
	}
}

export default ArrayValue;

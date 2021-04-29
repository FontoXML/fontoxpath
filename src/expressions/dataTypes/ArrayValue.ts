import arrayGet from '../functions/builtInFunctions_arrays_get';
import { ARRAY_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import FunctionValue from './FunctionValue';
import ISequence from './ISequence';
import sequenceFactory from './sequenceFactory';
import { BaseType } from './Value';

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
			// argumentTypes: [{ type: { kind: BaseType.XSINTEGER }, isRestArgument: false }],
			argumentTypes: [{ kind: BaseType.XSINTEGER }],
			arity: 1,
			returnType: { kind: BaseType.ANY, item: { kind: BaseType.ITEM } },
		});
		this.type = { kind: BaseType.ARRAY, items: [] };
		this.members = members;
	}
}

export default ArrayValue;

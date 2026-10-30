import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import { Decimal } from '../dataTypes/valueTypes/Decimal';
import { ready } from '../util/iterators';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

const opTo: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	fromSequence,
	toSequence,
) => {
	// shortcut the non-trivial case of both values being known
	// RangeExpr is inclusive: 1 to 3 will make (1,2,3)
	const from = fromSequence.first();
	const to = toSequence.first();
	if (from === null || to === null) {
		return sequenceFactory.empty();
	}

	let fromValue = Decimal.coerce(from.value);
	const toValue = Decimal.coerce(to.value);

	if (fromValue.compareTo(toValue) > 0) {
		return sequenceFactory.empty();
	}
	// By providing a length, we do not have to hold an end condition into account
	const length = Number(toValue.subtract(fromValue).add(1).toFloat());
	return sequenceFactory.create(
		{
			next: () => {
				const current = fromValue;
				fromValue = fromValue.add(1);
				return ready(createAtomicValue(current, ValueType.XSINTEGER));
			},
		},
		length,
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: 'http://fontoxpath/operators',
		localName: 'to',
		argumentTypes: [
			{ type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_MORE },
		callFunction: opTo,
	},
];

export default {
	declarations,
	functions: {
		to: opTo,
	},
};

import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { BaseType, OccurrenceIndicator } from '../dataTypes/Value';
import { ready } from '../util/iterators';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

const opTo: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	fromSequence,
	toSequence
) => {
	// shortcut the non-trivial case of both values being known
	// RangeExpr is inclusive: 1 to 3 will make (1,2,3)
	const from = fromSequence.first();
	const to = toSequence.first();
	if (from === null || to === null) {
		return sequenceFactory.empty();
	}
	let fromValue = from.value as number;
	const toValue = to.value as number;
	if (fromValue > toValue) {
		return sequenceFactory.empty();
	}
	// By providing a length, we do not have to hold an end condition into account
	return sequenceFactory.create(
		{
			next: () => ready(createAtomicValue(fromValue++, { kind: BaseType.XSINTEGER })),
		},
		toValue - fromValue + 1
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: 'http://fontoxpath/operators',
		localName: 'to',
		argumentTypes: [
			{ kind: BaseType.XSINTEGER, occurrence: OccurrenceIndicator.NULLABLE },
			{ kind: BaseType.XSINTEGER, occurrence: OccurrenceIndicator.NULLABLE },
		],
		returnType: { kind: BaseType.ANY, item: { kind: BaseType.XSINTEGER } },
		callFunction: opTo,
	},
];

export default {
	declarations,
	functions: {
		to: opTo,
	},
};

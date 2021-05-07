import { BaseType } from '../dataTypes/BaseType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceType } from '../dataTypes/Value';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import { DONE_TOKEN, ready } from '../util/iterators';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnLast: FunctionDefinitionType = (dynamicContext) => {
	if (dynamicContext.contextItem === null) {
		throw new Error(
			'XPDY0002: The fn:last() function depends on dynamic context, which is absent.'
		);
	}

	let done = false;
	return sequenceFactory.create(
		{
			next: () => {
				if (done) {
					return DONE_TOKEN;
				}
				const length = dynamicContext.contextSequence.getLength();
				done = true;
				return ready(
					createAtomicValue(length, {
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					})
				);
			},
		},
		1
	);
};

const fnPosition: FunctionDefinitionType = (dynamicContext) => {
	if (dynamicContext.contextItem === null) {
		throw new Error(
			'XPDY0002: The fn:position() function depends on dynamic context, which is absent.'
		);
	}
	// Note: +1 because XPath is one-based
	return sequenceFactory.singleton(
		createAtomicValue(dynamicContext.contextItemIndex + 1, {
			kind: BaseType.XSINTEGER,
			seqType: SequenceType.EXACTLY_ONE,
		})
	);
};

const fnCurrentDateTime: FunctionDefinitionType = (dynamicContext) => {
	return sequenceFactory.singleton(
		createAtomicValue(dynamicContext.getCurrentDateTime(), {
			kind: BaseType.XSDATETIMESTAMP,
			seqType: SequenceType.EXACTLY_ONE,
		})
	);
};

const fnCurrentDate: FunctionDefinitionType = (dynamicContext) => {
	return sequenceFactory.singleton(
		createAtomicValue(
			dynamicContext
				.getCurrentDateTime()
				.convertToType({ kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE }),
			{
				kind: BaseType.XSDATE,
				seqType: SequenceType.EXACTLY_ONE,
			}
		)
	);
};

const fnCurrentTime: FunctionDefinitionType = (dynamicContext) => {
	return sequenceFactory.singleton(
		createAtomicValue(
			dynamicContext
				.getCurrentDateTime()
				.convertToType({ kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE }),
			{ kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE }
		)
	);
};

const fnImplicitTimezone: FunctionDefinitionType = (dynamicContext) => {
	return sequenceFactory.singleton(
		createAtomicValue(dynamicContext.getImplicitTimezone(), {
			kind: BaseType.XSDAYTIMEDURATION,
			seqType: SequenceType.EXACTLY_ONE,
		})
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'last',
		argumentTypes: [],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnLast,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'position',
		argumentTypes: [],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnPosition,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'current-dateTime',
		argumentTypes: [],
		returnType: { kind: BaseType.XSDATETIMESTAMP, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnCurrentDateTime,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'current-date',
		argumentTypes: [],
		returnType: { kind: BaseType.XSDATE, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnCurrentDate,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'current-time',
		argumentTypes: [],
		returnType: { kind: BaseType.XSTIME, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnCurrentTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'implicit-timezone',
		argumentTypes: [],
		returnType: { kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnImplicitTimezone,
	},
];
export default {
	declarations,
	functions: {
		last: fnLast,
		position: fnPosition,
	},
};

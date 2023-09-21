import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import { DONE_TOKEN, ready } from '../util/iterators';
import { errXPDY0002 } from '../XPathErrors';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnLast: FunctionDefinitionType = (dynamicContext) => {
	if (dynamicContext.contextItem === null) {
		throw errXPDY0002('The fn:last() function depends on dynamic context, which is absent.');
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
				return ready(createAtomicValue(length, ValueType.XSINTEGER));
			},
		},
		1,
	);
};

const fnPosition: FunctionDefinitionType = (dynamicContext) => {
	if (dynamicContext.contextItem === null) {
		throw errXPDY0002(
			'The fn:position() function depends on dynamic context, which is absent.',
		);
	}
	// Note: +1 because XPath is one-based
	return sequenceFactory.singleton(
		createAtomicValue(dynamicContext.contextItemIndex + 1, ValueType.XSINTEGER),
	);
};

const fnCurrentDateTime: FunctionDefinitionType = (dynamicContext) => {
	return sequenceFactory.singleton(
		createAtomicValue(dynamicContext.getCurrentDateTime(), ValueType.XSDATETIMESTAMP),
	);
};

const fnCurrentDate: FunctionDefinitionType = (dynamicContext) => {
	return sequenceFactory.singleton(
		createAtomicValue(
			dynamicContext.getCurrentDateTime().convertToType(ValueType.XSDATE),
			ValueType.XSDATE,
		),
	);
};

const fnCurrentTime: FunctionDefinitionType = (dynamicContext) => {
	return sequenceFactory.singleton(
		createAtomicValue(
			dynamicContext.getCurrentDateTime().convertToType(ValueType.XSTIME),
			ValueType.XSTIME,
		),
	);
};

const fnImplicitTimezone: FunctionDefinitionType = (dynamicContext) => {
	return sequenceFactory.singleton(
		createAtomicValue(dynamicContext.getImplicitTimezone(), ValueType.XSDAYTIMEDURATION),
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'last',
		argumentTypes: [],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnLast,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'position',
		argumentTypes: [],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnPosition,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'current-dateTime',
		argumentTypes: [],
		returnType: { type: ValueType.XSDATETIMESTAMP, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnCurrentDateTime,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'current-date',
		argumentTypes: [],
		returnType: { type: ValueType.XSDATE, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnCurrentDate,
	},

	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'current-time',
		argumentTypes: [],
		returnType: { type: ValueType.XSTIME, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnCurrentTime,
	},
	{
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		localName: 'implicit-timezone',
		argumentTypes: [],
		returnType: {
			type: ValueType.XSDAYTIMEDURATION,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		},
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

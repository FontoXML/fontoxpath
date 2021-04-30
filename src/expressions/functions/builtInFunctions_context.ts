import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { DONE_TOKEN, ready } from '../util/iterators';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import FunctionDefinitionType from './FunctionDefinitionType';
import { BaseType } from '../dataTypes/Value';
import { BuiltinDeclarationType } from './builtInFunctions';

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
				return ready(createAtomicValue(length, { kind: BaseType.XSINTEGER }));
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
		createAtomicValue(dynamicContext.contextItemIndex + 1, { kind: BaseType.XSINTEGER })
	);
};

const fnCurrentDateTime: FunctionDefinitionType = (dynamicContext) => {
	return sequenceFactory.singleton(
		createAtomicValue(dynamicContext.getCurrentDateTime(), { kind: BaseType.XSDATETIMESTAMP })
	);
};

const fnCurrentDate: FunctionDefinitionType = (dynamicContext) => {
	return sequenceFactory.singleton(
		createAtomicValue(
			dynamicContext.getCurrentDateTime().convertToType({ kind: BaseType.XSDATE }),
			{
				kind: BaseType.XSDATE,
			}
		)
	);
};

const fnCurrentTime: FunctionDefinitionType = (dynamicContext) => {
	return sequenceFactory.singleton(
		createAtomicValue(
			dynamicContext.getCurrentDateTime().convertToType({ kind: BaseType.XSTIME }),
			{ kind: BaseType.XSTIME }
		)
	);
};

const fnImplicitTimezone: FunctionDefinitionType = (dynamicContext) => {
	return sequenceFactory.singleton(
		createAtomicValue(dynamicContext.getImplicitTimezone(), {
			kind: BaseType.XSDAYTIMEDURATION,
		})
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'last',
		argumentTypes: [],
		returnType: { kind: BaseType.XSINTEGER },
		callFunction: fnLast,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'position',
		argumentTypes: [],
		returnType: { kind: BaseType.XSINTEGER },
		callFunction: fnPosition,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'current-dateTime',
		argumentTypes: [],
		returnType: { kind: BaseType.XSDATETIMESTAMP },
		callFunction: fnCurrentDateTime,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'current-date',
		argumentTypes: [],
		returnType: { kind: BaseType.XSDATE },
		callFunction: fnCurrentDate,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'current-time',
		argumentTypes: [],
		returnType: { kind: BaseType.XSTIME },
		callFunction: fnCurrentTime,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'implicit-timezone',
		argumentTypes: [],
		returnType: { kind: BaseType.XSDAYTIMEDURATION },
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

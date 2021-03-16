import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { DONE_TOKEN, ready } from '../util/iterators';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
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
				const length = dynamicContext.contextSequence.tryGetLength(false);
				done = true;
				return ready(createAtomicValue(length.value, 'xs:integer'));
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
		createAtomicValue(dynamicContext.contextItemIndex + 1, 'xs:integer')
	);
};

const fnCurrentDateTime: FunctionDefinitionType = (dynamicContext) => {
	return sequenceFactory.singleton(
		createAtomicValue(dynamicContext.getCurrentDateTime(), 'xs:dateTimeStamp')
	);
};

const fnCurrentDate: FunctionDefinitionType = (dynamicContext) => {
	return sequenceFactory.singleton(
		createAtomicValue(dynamicContext.getCurrentDateTime().convertToType('xs:date'), 'xs:date')
	);
};

const fnCurrentTime: FunctionDefinitionType = (dynamicContext) => {
	return sequenceFactory.singleton(
		createAtomicValue(dynamicContext.getCurrentDateTime().convertToType('xs:time'), 'xs:time')
	);
};

const fnImplicitTimezone: FunctionDefinitionType = (dynamicContext) => {
	return sequenceFactory.singleton(
		createAtomicValue(dynamicContext.getImplicitTimezone(), 'xs:dayTimeDuration')
	);
};

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'last',
			argumentTypes: [],
			returnType: 'xs:integer',
			callFunction: fnLast,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'position',
			argumentTypes: [],
			returnType: 'xs:integer',
			callFunction: fnPosition,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'current-dateTime',
			argumentTypes: [],
			returnType: 'xs:dateTimeStamp',
			callFunction: fnCurrentDateTime,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'current-date',
			argumentTypes: [],
			returnType: 'xs:date',
			callFunction: fnCurrentDate,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'current-time',
			argumentTypes: [],
			returnType: 'xs:time',
			callFunction: fnCurrentTime,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'implicit-timezone',
			argumentTypes: [],
			returnType: 'xs:dayTimeDuration',
			callFunction: fnImplicitTimezone,
		},
	],
	functions: {
		last: fnLast,
		position: fnPosition,
	},
};

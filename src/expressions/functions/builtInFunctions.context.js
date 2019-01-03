import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';
import { DONE_TOKEN, notReady, ready } from '../util/iterators';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import FunctionDefinitionType from './FunctionDefinitionType';

/**
 * @type {!FunctionDefinitionType}
 */
function fnLast (dynamicContext) {
	if (dynamicContext.contextItem === null) {
		throw new Error('XPDY0002: The fn:last() function depends on dynamic context, which is absent.');
	}

	let done = false;
	return Sequence.create({
		next: () => {
			if (done) {
				return DONE_TOKEN;
			}
			const length = dynamicContext.contextSequence.tryGetLength(false);
			if (length.ready) {
				done = true;
				return ready(createAtomicValue(length.value, 'xs:integer'));
			}
			return notReady(length.promise);
		}
	}, 1);
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnPosition (dynamicContext) {
	if (dynamicContext.contextItem === null) {
		throw new Error('XPDY0002: The fn:position() function depends on dynamic context, which is absent.');
	}
	// Note: +1 because XPath is one-based
	return Sequence.singleton(createAtomicValue(dynamicContext.contextItemIndex + 1, 'xs:integer'));
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnCurrentDateTime (dynamicContext) {
	return Sequence.singleton(createAtomicValue(dynamicContext.getCurrentDateTime(), 'xs:dateTimeStamp'));
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnCurrentDate (dynamicContext) {
	return Sequence.singleton(createAtomicValue(dynamicContext.getCurrentDateTime().convertToType('xs:date'), 'xs:date'));
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnCurrentTime (dynamicContext) {
	return Sequence.singleton(createAtomicValue(dynamicContext.getCurrentDateTime().convertToType('xs:time'), 'xs:time'));
}

/**
 * @type {!FunctionDefinitionType}
 */
function fnImplicitTimezone (dynamicContext) {
	return Sequence.singleton(createAtomicValue(dynamicContext.getImplicitTimezone(), 'xs:dayTimeDuration'));
}

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'last',
			argumentTypes: [],
			returnType: 'xs:integer',
			callFunction: fnLast
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'position',
			argumentTypes: [],
			returnType: 'xs:integer',
			callFunction: fnPosition
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'current-dateTime',
			argumentTypes: [],
			returnType: 'xs:dateTimeStamp',
			callFunction: fnCurrentDateTime
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'current-date',
			argumentTypes: [],
			returnType: 'xs:date',
			callFunction: fnCurrentDate
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'current-time',
			argumentTypes: [],
			returnType: 'xs:time',
			callFunction: fnCurrentTime
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'implicit-timezone',
			argumentTypes: [],
			returnType: 'xs:dayTimeDuration',
			callFunction: fnImplicitTimezone
		}
	],
	functions: {
		last: fnLast,
		position: fnPosition
	}
};

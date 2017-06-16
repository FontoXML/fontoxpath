import Sequence from '../dataTypes/Sequence';
import createAtomicValue from '../dataTypes/createAtomicValue';
import { DONE_TOKEN, notReady, ready } from '../util/iterators';

function fnLast (dynamicContext) {
	if (dynamicContext.contextItem === null) {
		throw new Error('XPDY0002: The fn:last() function depends on dynamic context, which is absent.');
	}

	let done = false;
	return new Sequence({
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

function fnPosition (dynamicContext) {
	if (dynamicContext.contextItem === null) {
		throw new Error('XPDY0002: The fn:position() function depends on dynamic context, which is absent.');
	}
	// Note: +1 because XPath is one-based
	return Sequence.singleton(createAtomicValue(dynamicContext.contextItemIndex + 1, 'xs:integer'));
}

function fnCurrentDateTime (dynamicContext) {
	return Sequence.singleton(createAtomicValue(dynamicContext.currentDateTime, 'xs:dateTimeStamp'));
}

function fnCurrentDate (dynamicContext) {
	return Sequence.singleton(createAtomicValue(dynamicContext.currentDateTime.convertToType('xs:date'), 'xs:date'));
}

function fnCurrentTime (dynamicContext) {
	return Sequence.singleton(createAtomicValue(dynamicContext.currentDateTime.convertToType('xs:time'), 'xs:time'));
}

function fnImplicitTimezone (dynamicContext) {
	return Sequence.singleton(createAtomicValue(dynamicContext.implicitTimezone, 'xs:dayTimeDuration'), 'xs:dayTimeDuration');
}

export default {
	declarations: [
		{
			name: 'last',
			argumentTypes: [],
			returnType: 'xs:integer',
			callFunction: fnLast
		},

		{
			name: 'position',
			argumentTypes: [],
			returnType: 'xs:integer',
			callFunction: fnPosition
		},

		{
			name: 'current-dateTime',
			argumentTypes: [],
			returnType: 'xs:dateTimeStamp',
			callFunction: fnCurrentDateTime
		},

		{
			name: 'current-date',
			argumentTypes: [],
			returnType: 'xs:date',
			callFunction: fnCurrentDate
		},

		{
			name: 'current-time',
			argumentTypes: [],
			returnType: 'xs:time',
			callFunction: fnCurrentTime
		},

		{
			name: 'implicit-timezone',
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

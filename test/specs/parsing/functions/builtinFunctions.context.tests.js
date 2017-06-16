import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean,
	evaluateXPathToString
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('Context related functions', () => {
	describe('fn:current-dateTime', () => {
		it('returns the current dateTime',
			() => chai.assert.isOk(evaluateXPathToString('current-dateTime()', documentNode)));
		it('returns the same value during the execution of the query',
			() => chai.assert.isTrue(evaluateXPathToBoolean('current-dateTime() eq current-dateTime()')));
		it('returns different values for different queries',
			() => chai.assert.notEqual(evaluateXPathToString('current-dateTime()'), setTimeout(evaluateXPathToString('current-dateTime()'), 100)));
	});
	describe('fn:current-date', () => {
		it('returns the current date',
			() => chai.assert.isOk(evaluateXPathToString('current-date()', documentNode)));
	});
	describe('fn:current-time', () => {
		it('returns the current time',
			() => chai.assert.isOk(evaluateXPathToString('current-time()', documentNode)));
	});
	describe('fn:implicit-timezone', () => {
		it('returns the implicit timezone',
			() => chai.assert.isOk(evaluateXPathToString('implicit-timezone()', documentNode)));
	});
});

import * as slimdom from 'slimdom';

import {
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

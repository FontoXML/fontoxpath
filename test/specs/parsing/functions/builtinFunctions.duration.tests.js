import * as slimdom from 'slimdom';

import {
	evaluateXPathToNumber
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('Duration related functions', () => {
	describe('fn:years-from-duration', () => {
		it('returns 10 for "P10Y10M10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('years-from-duration(xs:duration("P10Y10M10DT10H10M10.1S"))', documentNode), 10));
		it('returns -10 for "-P10Y10M10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('years-from-duration(xs:duration("-P10Y10M10DT10H10M10.1S"))', documentNode), -10));
		it('returns 0 for "P10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('years-from-duration(xs:dayTimeDuration("P10DT10H10M10.1S"))', documentNode), 0));
		it('returns 0 for "-P10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('years-from-duration(xs:dayTimeDuration("-P10DT10H10M10.1S"))', documentNode), 0));
		it('returns 10 for "P10Y10M"',
			() => chai.assert.equal(evaluateXPathToNumber('years-from-duration(xs:yearMonthDuration("P10Y10M"))', documentNode), 10));
		it('returns -10 for "-P10Y10M"',
			() => chai.assert.equal(evaluateXPathToNumber('years-from-duration(xs:yearMonthDuration("-P10Y10M"))', documentNode), -10));
	});

	describe('fn:months-from-duration', () => {
		it('returns 10 for "P10Y10M10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('months-from-duration(xs:duration("P10Y10M10DT10H10M10.1S"))', documentNode), 10));
		it('returns -10 for "-P10Y10M10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('months-from-duration(xs:duration("-P10Y10M10DT10H10M10.1S"))', documentNode), -10));
		it('returns 0 for "P10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('months-from-duration(xs:dayTimeDuration("P10DT10H10M10.1S"))', documentNode), 0));
		it('returns 0 for "-P10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('months-from-duration(xs:dayTimeDuration("-P10DT10H10M10.1S"))', documentNode), 0));
		it('returns 10 for "P10Y10M"',
			() => chai.assert.equal(evaluateXPathToNumber('months-from-duration(xs:yearMonthDuration("P10Y10M"))', documentNode), 10));
		it('returns -10 for "-P10Y10M"',
			() => chai.assert.equal(evaluateXPathToNumber('months-from-duration(xs:yearMonthDuration("-P10Y10M"))', documentNode), -10));
	});

	describe('fn:days-from-duration', () => {
		it('returns 10 for "P10Y10M10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('days-from-duration(xs:duration("P10Y10M10DT10H10M10.1S"))', documentNode), 10));
		it('returns -10 for "-P10Y10M10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('days-from-duration(xs:duration("-P10Y10M10DT10H10M10.1S"))', documentNode), -10));
		it('returns 10 for "P10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('days-from-duration(xs:dayTimeDuration("P10DT10H10M10.1S"))', documentNode), 10));
		it('returns -10 for "-P10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('days-from-duration(xs:dayTimeDuration("-P10DT10H10M10.1S"))', documentNode), -10));
		it('returns 0 for "P10Y10M"',
			() => chai.assert.equal(evaluateXPathToNumber('days-from-duration(xs:yearMonthDuration("P10Y10M"))', documentNode), 0));
		it('returns 0 for "-P10Y10M"',
			() => chai.assert.equal(evaluateXPathToNumber('days-from-duration(xs:yearMonthDuration("-P10Y10M"))', documentNode), 0));
	});

	describe('fn:hours-from-duration', () => {
		it('returns 10 for "P10Y10M10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('hours-from-duration(xs:duration("P10Y10M10DT10H10M10.1S"))', documentNode), 10));
		it('returns -10 for "-P10Y10M10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('hours-from-duration(xs:duration("-P10Y10M10DT10H10M10.1S"))', documentNode), -10));
		it('returns 10 for "P10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('hours-from-duration(xs:dayTimeDuration("P10DT10H10M10.1S"))', documentNode), 10));
		it('returns -10 for "-P10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('hours-from-duration(xs:dayTimeDuration("-P10DT10H10M10.1S"))', documentNode), -10));
		it('returns 0 for "P10Y10M"',
			() => chai.assert.equal(evaluateXPathToNumber('hours-from-duration(xs:yearMonthDuration("P10Y10M"))', documentNode), 0));
		it('returns 0 for "-P10Y10M"',
			() => chai.assert.equal(evaluateXPathToNumber('hours-from-duration(xs:yearMonthDuration("-P10Y10M"))', documentNode), 0));
	});

	describe('fn:minutes-from-duration', () => {
		it('returns 10 for "P10Y10M10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('minutes-from-duration(xs:duration("P10Y10M10DT10H10M10.1S"))', documentNode), 10));
		it('returns -10 for "-P10Y10M10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('minutes-from-duration(xs:duration("-P10Y10M10DT10H10M10.1S"))', documentNode), -10));
		it('returns 10 for "P10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('minutes-from-duration(xs:dayTimeDuration("P10DT10H10M10.1S"))', documentNode), 10));
		it('returns -10 for "-P10DT10H10M10.1S"',
			() => chai.assert.equal(evaluateXPathToNumber('minutes-from-duration(xs:dayTimeDuration("-P10DT10H10M10.1S"))', documentNode), -10));
		it('returns 0 for "P10Y10M"',
			() => chai.assert.equal(evaluateXPathToNumber('minutes-from-duration(xs:yearMonthDuration("P10Y10M"))', documentNode), 0));
		it('returns 0 for "-P10Y10M"',
			() => chai.assert.equal(evaluateXPathToNumber('minutes-from-duration(xs:yearMonthDuration("-P10Y10M"))', documentNode), 0));
	});

	describe('fn:seconds-from-duration', () => {
		it('returns 10 for "P10Y10M10DT10H10M10S"',
			() => chai.assert.equal(evaluateXPathToNumber('seconds-from-duration(xs:duration("P10Y10M10DT10H10M10S"))', documentNode), 10));
		it('returns -10 for "-P10Y10M10DT10H10M10S"',
			() => chai.assert.equal(evaluateXPathToNumber('seconds-from-duration(xs:duration("-P10Y10M10DT10H10M10S"))', documentNode), -10));
		it('returns 10 for "P10DT10H10M10S"',
			() => chai.assert.equal(evaluateXPathToNumber('seconds-from-duration(xs:dayTimeDuration("P10DT10H10M10S"))', documentNode), 10));
		it('returns -10 for "-P10DT10H10M10S"',
			() => chai.assert.equal(evaluateXPathToNumber('seconds-from-duration(xs:dayTimeDuration("-P10DT10H10M10S"))', documentNode), -10));
		it('returns 0 for "P10Y10M"',
			() => chai.assert.equal(evaluateXPathToNumber('seconds-from-duration(xs:yearMonthDuration("P10Y10M"))', documentNode), 0));
		it('returns 0 for "-P10Y10M"',
			() => chai.assert.equal(evaluateXPathToNumber('seconds-from-duration(xs:yearMonthDuration("-P10Y10M"))', documentNode), 0));
	});
});

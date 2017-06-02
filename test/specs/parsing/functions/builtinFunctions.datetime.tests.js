import slimdom from 'slimdom';

import {
	evaluateXPathToNumber,
	evaluateXPathToString
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('Date and time related functions', () => {
	describe('fn:dateTime', () => {
		it('returns "1999-12-31T12:00:00" for xs:date("1999-12-31") and xs:time("12:00:00")',
			() => chai.assert.equal(evaluateXPathToString('fn:dateTime(xs:date("1999-12-31"), xs:time("12:00:00")) => string()', documentNode), '1999-12-31T12:00:00'));
		it('returns "1999-12-31T00:00:00" for xs:date("1999-12-31") and xs:time("24:00:00")',
			() => chai.assert.equal(evaluateXPathToString('fn:dateTime(xs:date("1999-12-31"), xs:time("24:00:00")) => string()', documentNode), '1999-12-31T00:00:00'));
	});

	describe('Given xs:dateTime("2000-10-11T12:13:10.1+05:00")', () => {
		it('year-from-dateTime returns 2000',
			() => chai.assert.equal(evaluateXPathToNumber('year-from-dateTime(xs:dateTime("2000-10-11T12:13:10.1+05:00"))', documentNode), 2000));
		it('month-from-dateTime returns 10',
			() => chai.assert.equal(evaluateXPathToNumber('month-from-dateTime(xs:dateTime("2000-10-11T12:13:10.1+05:00"))', documentNode), 10));
		it('day-from-dateTime returns 11',
			() => chai.assert.equal(evaluateXPathToNumber('day-from-dateTime(xs:dateTime("2000-10-11T12:13:10.1+05:00"))', documentNode), 11));
		it('hours-from-dateTime returns 12',
			() => chai.assert.equal(evaluateXPathToNumber('hours-from-dateTime(xs:dateTime("2000-10-11T12:13:10.1+05:00"))', documentNode), 12));
		it('minutes-from-dateTime returns 13',
			() => chai.assert.equal(evaluateXPathToNumber('minutes-from-dateTime(xs:dateTime("2000-10-11T12:13:10.1+05:00"))', documentNode), 13));
		it('seconds-from-dateTime returns 10.1',
			() => chai.assert.equal(evaluateXPathToNumber('seconds-from-dateTime(xs:dateTime("2000-10-11T12:13:10.1+05:00"))', documentNode), 10.1));
		it('timezone-from-dateTime returns PT5H',
			() => chai.assert.equal(evaluateXPathToString('timezone-from-dateTime(xs:dateTime("2000-10-11T12:13:10.1+05:00")) => string()', documentNode), 'PT5H'));
	});
	describe('Given xs:date("2000-10-11+05:00")', () => {
		it('year-from-date returns 2000',
			() => chai.assert.equal(evaluateXPathToNumber('year-from-date(xs:date("2000-10-11+05:00"))', documentNode), 2000));
		it('month-from-date returns 10',
			() => chai.assert.equal(evaluateXPathToNumber('month-from-date(xs:date("2000-10-11+05:00"))', documentNode), 10));
		it('day-from-date returns 11',
			() => chai.assert.equal(evaluateXPathToNumber('day-from-date(xs:date("2000-10-11+05:00"))', documentNode), 11));
		it('timezone-from-date returns PT5H',
			() => chai.assert.equal(evaluateXPathToString('timezone-from-date(xs:date("2000-10-11+05:00")) => string()', documentNode), 'PT5H'));
	});
	describe('Given xs:time("12:13:10.1+05:00")', () => {
		it('hours-from-time returns 12',
			() => chai.assert.equal(evaluateXPathToNumber('hours-from-time(xs:time("12:13:10.1+05:00"))', documentNode), 12));
		it('minutes-from-time returns 13',
			() => chai.assert.equal(evaluateXPathToNumber('minutes-from-time(xs:time("12:13:10.1+05:00"))', documentNode), 13));
		it('seconds-from-time returns 10.1',
			() => chai.assert.equal(evaluateXPathToNumber('seconds-from-time(xs:time("12:13:10.1+05:00"))', documentNode), 10.1));
		it('timezone-from-time returns PT5H',
			() => chai.assert.equal(evaluateXPathToString('timezone-from-time(xs:time("12:13:10.1+05:00")) => string()', documentNode), 'PT5H'));
	});
});

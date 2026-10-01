import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { evaluateXPathToBoolean, evaluateXPathToNumber, evaluateXPathToStrings } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('mathematical operators', () => {
	it('can evaluate 1 + 1 to 2', () =>
		chai.assert.equal(evaluateXPathToNumber('1 + 1', documentNode), 2));

	it('can evaluate 1 - 1 to 0', () =>
		chai.assert.equal(evaluateXPathToNumber('1 - 1', documentNode), 0));

	it('can evaluate 1 * 2 to 2', () =>
		chai.assert.equal(evaluateXPathToNumber('1 * 2', documentNode), 2));

	it('can evaluate 1 div 2 to 0.5', () =>
		chai.assert.equal(evaluateXPathToNumber('1 div 2', documentNode), 0.5));

	it('can evaluate 1 idiv 2 to 1', () =>
		chai.assert.equal(evaluateXPathToNumber('1 idiv 2', documentNode), 0));

	it('uses the correct ordering', () =>
		chai.assert.equal(
			evaluateXPathToNumber('2 idiv 2 * 2', documentNode),
			2,
			'This should be parsed as (2 idiv 2) * 2',
		));

	it('subtracts in the correct order', () =>
		chai.assert.equal(evaluateXPathToNumber('5 - 1 - 1', documentNode), 3));

	it('subtracts in the correct order when parentheses are used', () =>
		chai.assert.equal(evaluateXPathToNumber('5 - (1 - 1)', documentNode), 5));

	it('returns the empty sequence if one of the operands is the empty sequence', () =>
		chai.assert.deepEqual(evaluateXPathToStrings('() + 1', documentNode), []));

	it('can evaluate 5 mod 3 to 2', () =>
		chai.assert.equal(evaluateXPathToNumber('5 mod 3', documentNode), 2));

	it('throws when passed strings', () =>
		chai.assert.throws(
			() => evaluateXPathToNumber('"something" + 1', documentNode),
			'XPTY0004',
		));

	it('can parse untyped attributes', () => {
		jsonMlMapper.parse(['someElement', { a: '1' }], documentNode);
		chai.assert.equal(evaluateXPathToNumber('@a + 1', documentNode.documentElement), 2);
	});
});

describe('xs:decimal arithmetic', () => {
	it('adds exactly', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('1.1 + 2.2 eq 3.3'));
		chai.assert.isTrue(evaluateXPathToBoolean('336300.95 + 49243.65 eq 385544.6'));
		chai.assert.equal(evaluateXPathToNumber('0.1 + 0.2'), 0.3);
	});

	it('subtracts exactly', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('0.3 - 0.1 eq 0.2'));
		chai.assert.isTrue(evaluateXPathToBoolean('-0.1 - 0.2 eq -0.3'));
	});

	it('multiplies exactly', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('1.1 * 1.1 eq 1.21'));
		chai.assert.isTrue(evaluateXPathToBoolean('10.05 * 100 eq 1005'));
	});

	it('divides exactly', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('0.3 div 0.1 eq 3'));
		chai.assert.isTrue(evaluateXPathToBoolean('4338 div 100 eq 43.38'));
	});

	it('rounds a quotient that does not terminate to the nearest number', () => {
		chai.assert.equal(evaluateXPathToNumber('1.0 div 3'), 1 / 3);
		chai.assert.equal(evaluateXPathToNumber('-2.0 div 3'), -2 / 3);
	});

	it('leaves operands of more than 15 significant digits to number arithmetic', () =>
		chai.assert.equal(evaluateXPathToNumber('(1.0 div 3) * 3'), (1 / 3) * 3));

	it('computes idiv and mod exactly', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('0.3 idiv 0.1 eq 3'));
		chai.assert.isTrue(evaluateXPathToBoolean('4.5 mod 1.2 eq 0.9'));
		chai.assert.isTrue(evaluateXPathToBoolean('-4.5 mod 1.2 eq -0.9'));
	});

	it('computes exactly on values cast to xs:decimal', () =>
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'xs:decimal("10.05") + xs:decimal("33.33") eq xs:decimal("43.38")',
			),
		));

	it('computes exactly when an xs:decimal meets an xs:integer', () =>
		chai.assert.isTrue(evaluateXPathToBoolean('0.1 * 3 eq 0.3')));

	it('writes the exact result as a string', () =>
		chai.assert.deepEqual(evaluateXPathToStrings('string(10.05 + 33.33)'), ['43.38']));

	it('keeps the result an xs:decimal', () =>
		chai.assert.isTrue(evaluateXPathToBoolean('(0.1 + 0.2) instance of xs:decimal')));

	it('keeps xs:double arithmetic in floating point', () =>
		chai.assert.equal(evaluateXPathToNumber('0.1e0 + 0.2e0'), 0.1 + 0.2));

	it('keeps untyped operands in floating point, as they are cast to xs:double', () => {
		jsonMlMapper.parse(['someElement', { a: '0.1' }], documentNode);
		chai.assert.equal(
			evaluateXPathToNumber('@a + 0.2', documentNode.documentElement),
			0.1 + 0.2,
		);
	});
});

describe('Durations', () => {
	describe('xs:yearMonthDuration', () => {
		it('can evaluate "P10Y10M" + "P10Y10M"', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'xs:yearMonthDuration("P10Y10M") + xs:yearMonthDuration("P10Y10M") eq xs:yearMonthDuration("P21Y8M")',
					documentNode,
				),
			));
		it('can evaluate "P11Y10M" - "P10Y10M"', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'xs:yearMonthDuration("P11Y10M") - xs:yearMonthDuration("P10Y10M") eq xs:yearMonthDuration("P1Y")',
					documentNode,
				),
			));
		it('can evaluate "P11Y10M" * 2', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'xs:yearMonthDuration("P1Y10M") * xs:double("2") eq xs:yearMonthDuration("P44M")',
					documentNode,
				),
			));
		it('can evaluate "P11Y10M" div 2', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'xs:yearMonthDuration("P1Y10M") div xs:double("2") eq xs:yearMonthDuration("P11M")',
					documentNode,
				),
			));
		it('can evaluate "P3Y4M" div "-P1Y4M"', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'xs:yearMonthDuration("P3Y4M") div xs:yearMonthDuration("-P1Y4M") eq xs:decimal("-2.5")',
					documentNode,
				),
			));
		it('can evaluate "P3Y4M" div "P1M"', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'xs:yearMonthDuration("P3Y4M") div xs:yearMonthDuration("P1M") eq xs:decimal("40")',
					documentNode,
				),
			));
	});

	describe('xs:dayTimeDuration', () => {
		it('can evaluate "P4DT26H" + "P4DT26H"', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'xs:dayTimeDuration("P4DT26H") + xs:dayTimeDuration("P4DT26H") eq xs:dayTimeDuration("P10DT4H")',
					documentNode,
				),
			));
		it('can evaluate "P4DT28H" - "P4DT26H"', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'xs:dayTimeDuration("P4DT28H") - xs:dayTimeDuration("P4DT26H") eq xs:dayTimeDuration("PT2H")',
					documentNode,
				),
			));
		it('can evaluate "PT20H" * 2', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'xs:dayTimeDuration("PT20H") * xs:double("2") eq xs:dayTimeDuration("P1DT16H")',
					documentNode,
				),
			));
		it('can evaluate "PT11H" div 2', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'xs:dayTimeDuration("PT11H") div xs:double("2") eq xs:dayTimeDuration("PT5H30M")',
					documentNode,
				),
			));
		it('can evaluate "PT10S" div "PT5S"', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'xs:dayTimeDuration("PT10S") div xs:dayTimeDuration("PT5S") eq xs:decimal("2")',
					documentNode,
				),
			));
		it('can evaluate "P2DT53M11S" div "PT1S"', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'xs:dayTimeDuration("P2DT53M11S") div xs:dayTimeDuration("PT1S") eq xs:decimal("175991")',
					documentNode,
				),
			));
		it('can evaluate implicit timezone div 0', () =>
			chai.assert.throws(
				() =>
					evaluateXPathToBoolean(
						'fn:string(fn:implicit-timezone() div 0 )',
						documentNode,
					),
				'FODT0002',
			));
	});

	describe('xs:dateTime', () => {
		it('can subtract dateTimes', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean(
					'xs:dateTime("2000-10-30T06:12:00-05:00") - xs:dateTime("1999-11-28T09:00:00Z") eq xs:dayTimeDuration("P337DT2H12M")',
				),
			);
		});
	});
});

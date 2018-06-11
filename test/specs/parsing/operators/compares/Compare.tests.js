import * as slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToNodes, evaluateXPathToNumber, evaluateXPathToBoolean } from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';
import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('Value compares', () => {
	it('works over singleton sequences', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('true() eq true()'));
	});
	it('works with async parameters', async () => {
		chai.assert.isTrue(await evaluateXPathToAsyncSingleton('true() eq (true() => fontoxpath:sleep())'));
	});
	it('works over empty sequences', () => {
		chai.assert.deepEqual(evaluateXPathToNodes('() eq ()'), []);
	});

	it('works over one empty sequence and a filled one', () => {
		chai.assert.deepEqual(evaluateXPathToNodes('() eq (true())'), []);
	});

	it('does not work over non-singleton sequences: lhs', () => {
		chai.assert.throw(() => evaluateXPathToNodes('(1, 2) eq 1'), 'XPTY0004');
	});

	it('does not work over non-singleton sequences: rhs', () => {
		chai.assert.throw(() => evaluateXPathToNodes('1 eq (1, 2)'), 'XPTY0004');
	});

	it('does not work over non-singleton sequences: boths sides', () => {
		chai.assert.throw(() => evaluateXPathToNodes('(1, 2) eq (1, 2)'), 'XPTY0004');
	});

	it('Does work with typing: decimal to int', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('1 eq 1.0'));
	});

	it('Does work with typing: double to int', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('100 eq 1.0e2'));
	});

	it('atomizes attributes', () => {
		jsonMlMapper.parse([
			'someNode',
			{
				a: 'value',
				b: 'value'
			}
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('@a eq "value"', documentNode.documentElement));
	});

	it('works with typing: untyped attributes', () => {
		jsonMlMapper.parse([
			'someNode',
			{
				a: 'value'
			}
		], documentNode);
		chai.assert.throw(() => evaluateXPathToBoolean('@a eq 1', documentNode.documentElement), /FORG0001/);
	});

	it('works with typing: untyped attributes on both sides', () => {
		jsonMlMapper.parse([
			'someNode',
			{
				a: 'value',
				b: 'value'
			}
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('@a eq @b', documentNode.documentElement));
	});

	it('(does not) work with typing: int to string', () => {
		chai.assert.throw(() => evaluateXPathToBoolean('1 eq "1"'), 'XPTY0004');
	});

	it('(does not) work with typing: boolean to string', () => {
		chai.assert.throw(() => evaluateXPathToBoolean('true() eq "true"'), 'XPTY0004');
	});

	describe('eq', () => {
		it('returns true if the first operand is equal to the second', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('1 eq 1'));
		});

		it('+0 eq -0', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('+0 eq -0'));
		});

		it('does QNames', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('fn:QName("a", "a") eq fn:QName("a","a")'));
		});
		it('returns false for unequal qnames: on localPart', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('fn:QName("a", "a") eq fn:QName("a","b")'));
		});
		it('returns false for unequal qnames: on uri', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('fn:QName("a", "a") eq fn:QName("b","a")'));
		});
		it('returns true for absent prefix', () => chai.assert.isTrue(evaluateXPathToBoolean('QName((), "local") eq xs:QName("local")')));
		it('returns true for equal qnames: unequal on prefix', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('fn:QName("a", "a:a") eq fn:QName("a","b:a")'));
		});
		it('returns true for equal qnames: absent prefix', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('QName("", "local") eq xs:QName("local")'));
		});
		it('returns false if the first operand is not equal to the second', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('1 eq 2'));
		});
	});

	describe('ne', () => {
		it('returns true if the first operand is not equal to the second', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('1 ne 2'));
		});

		it('returns false if the first operand is equal to the second', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('1 ne 1'));
		});

		it('returns true for unequal qnames: on localPart', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('fn:QName("a", "a") ne fn:QName("a","b")'));
		});
		it('returns true for unequal qnames: on uri', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('fn:QName("a", "a") ne fn:QName("b","a")'));
		});

	});

	describe('gt', () => {
		it('returns true if the first operand is greater than the second', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('2 gt 1'));
		});

		it('returns false if the first operand is equal to the second', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('1 gt 1'));
		});

		it('returns false if the first operand is less than the second', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('1 gt 2'));
		});

		it('is not implemented for qnames', () => {
			chai.assert.throws(() => evaluateXPathToBoolean('fn:QName("a", "a") gt fn:QName("a","b")'), 'XPTY0004');
		});
	});

	describe('lt', () => {
		it('returns true if the first operand is less than the second', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('1 lt 2'));
		});

		it('returns false if the first operand is equal to the second', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('1 lt 1'));
		});

		it('returns false if the first operand is less than the second', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('2 lt 1'));
		});

		it('is not implemented for qnames', () => {
			chai.assert.throws(() => evaluateXPathToBoolean('fn:QName("a", "a") gt fn:QName("a","b")'), 'XPTY0004');
		});
	});
	describe('ge', () => {
		it('returns true if the first operand is greater than the second', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('2 ge 1'));
		});

		it('returns true if the first operand is equal to the second', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('1 ge 1'));
		});

		it('returns false if the first operand is less than the second', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('1 ge 2'));
		});

		it('is not implemented for qnames', () => {
			chai.assert.throws(() => evaluateXPathToBoolean('fn:QName("a", "a") gt fn:QName("a","b")'), 'XPTY0004');
		});
	});
	describe('le', () => {
		it('returns true if the first operand is less than the second', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('1 le 2'));
		});

		it('returns true if the first operand is equal to the second', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('1 le 1'));
		});

		it('returns false if the first operand is greater than the second', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('2 le 1'));
		});

		it('is not implemented for qnames', () => {
			chai.assert.throws(() => evaluateXPathToBoolean('fn:QName("a", "a") gt fn:QName("a","b")'), 'XPTY0004');
		});
	});
});

describe('General compares', () => {
	it('Compares over sets', () => chai.assert.isTrue(evaluateXPathToBoolean('(1, 2, 3) = 3')));
	it('Compares over sets by comparing each and every value', () => chai.assert.isTrue(evaluateXPathToBoolean('(1, 2, 3) = (5, 4, 3)')));
	it('works with async parameters', async () => {
		chai.assert.isTrue(await evaluateXPathToAsyncSingleton('true() = (true() => fontoxpath:sleep())'));
	});

});

describe('Node compares', () => {
	beforeEach(() => {
		const parentNode = documentNode.appendChild(documentNode.createElement('someElement'));
		parentNode.appendChild(documentNode.createElement('firstElement'));
		parentNode.appendChild(documentNode.createElement('secondElement'));
	});

	describe('is', () => {
		it('returns true for the same node', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('. is .', documentNode));
		});
		it('returns false for another node', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('. is child::*[1]', documentNode));
		});
		it('works with variables', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('let $x := . return . is $x', documentNode));
		});
		it('returns the empty sequence if either operand is the empty sequence', () => {
			chai.assert.equal(evaluateXPathToNumber('count(() is ())', documentNode), 0);
		});
		it('returns the empty sequence if the lhs operand is the empty sequence', () => {
			chai.assert.equal(evaluateXPathToNumber('count(() is .)', documentNode), 0);
		});
		it('returns the empty sequence if the rhs operand is the empty sequence', () => {
			chai.assert.equal(evaluateXPathToNumber('count(. is ())', documentNode), 0);
		});
		it('throws an error when passed a non-node', () => {
			chai.assert.throws(() => evaluateXPathToBoolean('1 is 1', documentNode), 'XPTY0004');
		});
		it('throws an error when passed a non-singleton sequence on the lhs', () => {
			chai.assert.throws(() => evaluateXPathToBoolean('. is (., .)', documentNode), 'XPTY0004');
		});
		it('throws an error when passed a non-singleton sequence on the rhs', () => {
			chai.assert.throws(() => evaluateXPathToBoolean('(., .) is .', documentNode), 'XPTY0004');
		});
		it('works with async parameters',async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('. is (. => fontoxpath:sleep())', documentNode));
		});
	});

	describe('<<', () => {
		it('returns true when the first element comes before the second element', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('//firstElement << //secondElement', documentNode));
		});
		it('return false when the second element comes before the first element', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('//secondElement << //firstElement', documentNode));
		});
		it('returns true when the first element is an ancestor of the second element', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('/someElement << //secondElement', documentNode));
		});
		it('returns false when the first element is a descendant of the second element', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('//secondElement << /someElement', documentNode));
		});
	});

	describe('>>', () => {
		it('returns false when the first element comes after the second element', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('//firstElement >> //secondElement', documentNode));
		});
		it('return true when the second element comes after the first element', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('//secondElement >> //firstElement', documentNode));
		});
		it('returns false when the first element is an ancestor of the second element', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('/someElement >> //secondElement', documentNode));
		});
		it('returns true when the first element is a descendant of the second element', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('//secondElement >> /someElement', documentNode));
		});
	});
});

describe('dateTime compares', () => {
	describe('eq', () => {
		describe('xs:dateTime', () => {
			it('returns true for "2000-10-10T12:00:00" and "2000-10-10T12:00:00"',
			   () => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:00:00") eq xs:dateTime("2000-10-10T12:00:00")', documentNode)));

			it('returns false for xs:dateTime("2004-08-12T23:01:04.12") eq xs:dateTime("2004-08-12T23:01:04.13")',
			   () => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2004-08-12T23:01:04.12") eq xs:dateTime("2004-08-12T23:01:04.13")', documentNode)));

			it('returns true for "2000-10-10T12:00:00+05:00" and "2000-10-10T12:00:00+05:00"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:00:00") eq xs:dateTime("2000-10-10T12:00:00")', documentNode)));
it('returns true for "2000-10-10T12:00:00+05:00" and "2000-10-10T12:00:00+05:00"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:00:00+05:00") eq xs:dateTime("2000-10-10T12:00:00+05:00")', documentNode)));
			it('returns true for "2000-10-10T11:00:00-01:00" and "2000-10-10T16:00:00+04:00"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2000-10-10T11:00:00-01:00") eq xs:dateTime("2000-10-10T16:00:00+04:00")', documentNode)));
			it('returns true for "1999-12-31T24:00:00" and "2000-01-01T00:00:00"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("1999-12-31T24:00:00") eq xs:dateTime("2000-01-01T00:00:00")', documentNode)));
			it('returns false for "2005-04-04T24:00:00" and "2005-04-04T00:00:00"',
			() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2005-04-04T24:00:00") eq xs:dateTime("2005-04-04T00:00:00")', documentNode)));
			it('returns false for "2002-04-02T23:00:00-04:00" and "2002-04-03T02:00:00-01:00"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2002-04-02T23:00:00-04:00") eq xs:dateTime("2002-04-03T02:00:00-01:00")', documentNode)));

			it('returns false for "2000-10-10T12:00:10" and "2000-10-10T12:00:00"',
			() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:00:10") eq xs:dateTime("2000-10-10T12:00:00")', documentNode)));
			it('returns false for "2000-10-10T12:10:00" and "2000-10-10T12:00:00"',
			() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:10:00") eq xs:dateTime("2000-10-10T12:00:00")', documentNode)));
			it('returns false for "2000-10-10T12:00:00" and "2000-10-10T10:00:00"',
			() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:00:00") eq xs:dateTime("2000-10-10T10:00:00")', documentNode)));
			it('returns false for "2000-10-11T12:00:00" and "2000-10-10T12:00:00"',
			() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2000-10-11T12:00:00") eq xs:dateTime("2000-10-10T12:00:00")', documentNode)));
			it('returns false for "2000-11-10T12:00:00" and "2000-10-10T12:00:00"',
			() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2000-11-10T12:00:00") eq xs:dateTime("2000-10-10T12:00:00")', documentNode)));
			it('returns false for "2001-10-10T12:00:00" and "2000-10-10T12:00:00"',
			() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2001-10-10T12:00:00") eq xs:dateTime("2000-10-10T12:00:00")', documentNode)));
		});

		describe('xs:date', () => {
			it('returns true for "2000-10-10" and "2000-10-10"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:date("2000-10-10") eq xs:date("2000-10-10")', documentNode)));
			it('returns true for "2000-10-10+05:30" and "2000-10-10+05:30"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:date("2000-10-10+05:30") eq xs:date("2000-10-10+05:30")', documentNode)));
			it('returns true for "2000-10-09-12:00" and "2000-10-10+12:00"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:date("2000-10-09-12:00") eq xs:date("2000-10-10+12:00")', documentNode)));

			it('returns false for "2000-10-11" and "2000-10-10"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:date("2000-10-11") eq xs:date("2000-10-10")', documentNode)));
			it('returns false for "2000-11-10" and "2000-10-10"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:date("2000-11-10") eq xs:date("2000-10-10")', documentNode)));
			it('returns false for "2001-10-10" and "2000-10-10"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:date("2001-10-10") eq xs:date("2000-10-10")', documentNode)));
		});

		describe('xs:time', () => {
			it('returns true for "10:10:10.1" and "10:10:10.1"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:time("10:10:10.1") eq xs:time("10:10:10.1")', documentNode)));
			it('returns true for "10:10:10.1-10:25" and "10:10:10.1-10:25"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:time("10:10:10.1-10:25") eq xs:time("10:10:10.1-10:25")', documentNode)));

			it('returns false for "10:10:10.2" and "10:10:10.1"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:time("10:10:10.2") eq xs:time("10:10:10.1")', documentNode)));
			it('returns false for "10:10:11.1" and "10:10:10.1"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:time("10:10:11.1") eq xs:time("10:10:10.1")', documentNode)));
			it('returns false for "10:11:10.1" and "10:10:10.1"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:time("10:11:10.1") eq xs:time("10:10:10.1")', documentNode)));
			it('returns false for "11:10:10.1" and "10:10:10.1"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:time("11:10:10.1") eq xs:time("10:10:10.1")', documentNode)));
		});

		describe('xs:gYearMonth', () => {
			it('returns true for "2000-10" and "2000-10"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gYearMonth("2000-10") eq xs:gYearMonth("2000-10")', documentNode)));
			it('returns true for "-2000-10" and "-2000-10"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gYearMonth("-2000-10") eq xs:gYearMonth("-2000-10")', documentNode)));
			it('returns true for "2000-10+08:00" and "2000-10+08:00"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gYearMonth("2000-10+08:00") eq xs:gYearMonth("2000-10+08:00")', documentNode)));

			it('returns false for "2000-11" and "2000-10"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:gYearMonth("2000-11") eq xs:gYearMonth("2000-10")', documentNode)));
			it('returns false for "-2000-10" and "2000-10"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:gYearMonth("-2000-10") eq xs:gYearMonth("2000-10")', documentNode)));
			it('returns false for "2001-10" and "2000-10"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:gYearMonth("2001-10") eq xs:gYearMonth("2000-10")', documentNode)));
		});

		describe('xs:gYear', () => {
			it('returns true for "2000" and "2000"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gYear("2000") eq xs:gYear("2000")', documentNode)));
			it('returns true for "-2000" and "-2000"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gYear("-2000") eq xs:gYear("-2000")', documentNode)));
			it('returns true for "2000+08:00" and "2000+08:00"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gYear("2000+08:00") eq xs:gYear("2000+08:00")', documentNode)));

			it('returns false for "2001" and "2000"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:gYear("2001") eq xs:gYear("2000")', documentNode)));
			it('returns false for "-2000" and "2000"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:gYear("-2000") eq xs:gYear("2000")', documentNode)));
		});

		describe('xs:gMonthDay', () => {
			it('returns true for "--10-10" and "--10-10"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gMonthDay("--10-10") eq xs:gMonthDay("--10-10")', documentNode)));
			it('returns true for "--10-10+08:00" and "--10-10+08:00"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gMonthDay("--10-10+08:00") eq xs:gMonthDay("--10-10+08:00")', documentNode)));

			it('returns false for "--10-11" and "--10-10"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:gMonthDay("--10-11") eq xs:gMonthDay("--10-10")', documentNode)));
			it('returns false for "--11-10" and "--10-10"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:gMonthDay("--11-10") eq xs:gMonthDay("--10-10")', documentNode)));
		});

		describe('xs:gMonth', () => {
			it('returns true for "--10" and "--10"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gMonth("--10") eq xs:gMonth("--10")', documentNode)));
			it('returns true for "--10+08:00" and "--10+08:00"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gMonth("--10+08:00") eq xs:gMonth("--10+08:00")', documentNode)));

			it('returns false for "--11" and "--10"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:gMonth("--11") eq xs:gMonth("--10")', documentNode)));
		});

		describe('xs:gDay', () => {
			it('returns true for "---10" and "---10"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gDay("---10") eq xs:gDay("---10")', documentNode)));
			it('returns true for "---10+08:00" and "---10+08:00"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:gDay("---10+08:00") eq xs:gDay("---10+08:00")', documentNode)));

			it('returns false for "---11" and "---10"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:gDay("---11") eq xs:gDay("---10")', documentNode)));
		});
	});

	describe('lt', () => {
		describe('xs:dateTime', () => {
			it('returns false for xs:dateTime("2000-10-10T12:00:00") and xs:dateTime("2000-10-10T12:00:00")',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:00:00") lt xs:dateTime("2000-10-10T12:00:00")', documentNode)));
			it('returns false for xs:dateTime("2004-08-12T23:01:04.12") lt xs:dateTime("2004-08-12T23:01:04.11")',
			   () => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2004-08-12T23:01:04.12") lt xs:dateTime("2004-08-12T23:01:04.11")', documentNode)));
			it('returns false for xs:dateTime("2000-10-10T12:00:00+05:00") and xs:dateTime("2000-10-10T12:00:00+05:00")',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:00:00+05:00") lt xs:dateTime("2000-10-10T12:00:00+05:00")', documentNode)));
			it('returns false for xs:dateTime("2000-10-10T11:00:00-01:00") and xs:dateTime("2000-10-10T16:00:00+04:00")',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2000-10-10T11:00:00-01:00") lt xs:dateTime("2000-10-10T16:00:00+04:00")', documentNode)));
			it('returns false for xs:dateTime("1999-12-31T24:00:00") and xs:dateTime("2000-01-01T00:00:00")',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("1999-12-31T24:00:00") lt xs:dateTime("2000-01-01T00:00:00")', documentNode)));
			it('returns true for xs:dateTime("2005-04-04T00:00:00") and xs:dateTime("2005-04-04T24:00:00")',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2005-04-04T00:00:00") lt xs:dateTime("2005-04-04T24:00:00")', documentNode)));
			it('returns false for xs:dateTime("2002-04-02T23:00:00-04:00") and xs:dateTime("2002-04-03T02:00:00-01:00")',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2002-04-02T23:00:00-04:00") lt xs:dateTime("2002-04-03T02:00:00-01:00")', documentNode)));

			it('returns true for xs:dateTime("2000-10-10T12:00:00") and xs:dateTime("2000-10-10T12:00:10")',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:00:00") lt xs:dateTime("2000-10-10T12:00:10")', documentNode)));
			it('returns true for xs:dateTime("2000-10-10T12:00:00") and xs:dateTime("2000-10-10T12:10:00")',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:00:00") lt xs:dateTime("2000-10-10T12:10:00")', documentNode)));
			it('returns true for xs:dateTime("2000-10-10T10:00:00") and xs:dateTime("2000-10-10T12:00:00")',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2000-10-10T10:00:00") lt xs:dateTime("2000-10-10T12:00:00")', documentNode)));
			it('returns true for xs:dateTime("2000-10-10T12:00:00") and xs:dateTime("2000-10-11T12:00:00")',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:00:00") lt xs:dateTime("2000-10-11T12:00:00")', documentNode)));
			it('returns true for xs:dateTime("2000-10-10T12:00:00") and xs:dateTime("2000-11-10T12:00:00")',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:00:00") lt xs:dateTime("2000-11-10T12:00:00")', documentNode)));
			it('returns true for xs:dateTime("2000-10-10T12:00:00") and xs:dateTime("2001-10-10T12:00:00")',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:00:00") lt xs:dateTime("2001-10-10T12:00:00")', documentNode)));
		});

		describe('xs:date', () => {
			it('returns false for "2000-10-10" and "2000-10-10"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:date("2000-10-10") lt xs:date("2000-10-10")', documentNode)));
			it('returns false for "2000-10-10+05:30" and "2000-10-10+05:30"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:date("2000-10-10+05:30") lt xs:date("2000-10-10+05:30")', documentNode)));
			it('returns false for "2000-10-09-12:00" and "2000-10-10+12:00"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:date("2000-10-09-12:00") lt xs:date("2000-10-10+12:00")', documentNode)));

			it('returns true for "2000-10-10" and "2000-10-11"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:date("2000-10-10") lt xs:date("2000-10-11")', documentNode)));
			it('returns true for "2000-10-10" and "2000-11-10"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:date("2000-10-10") lt xs:date("2000-11-10")', documentNode)));
			it('returns true for "2000-10-10" and "2001-10-10"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:date("2000-10-10") lt xs:date("2001-10-10")', documentNode)));
		});

		describe('xs:time', () => {
			it('returns false for "10:10:10.1" and "10:10:10.1"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:time("10:10:10.1") lt xs:time("10:10:10.1")', documentNode)));
			it('returns false for "10:10:10.1-10:25" and "10:10:10.1-10:25"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:time("10:10:10.1-10:25") lt xs:time("10:10:10.1-10:25")', documentNode)));

			it('returns true for "10:10:10.1" and "10:10:10.2"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:time("10:10:10.1") lt xs:time("10:10:10.2")', documentNode)));
			it('returns true for "10:10:10.1" and "10:10:11.1"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:time("10:10:10.1") lt xs:time("10:10:11.1")', documentNode)));
			it('returns true for "10:10:10.1" and "10:11:10.1"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:time("10:10:10.1") lt xs:time("10:11:10.1")', documentNode)));
			it('returns true for "10:10:10.1" and "11:10:10.1"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:time("10:10:10.1") lt xs:time("11:10:10.1")', documentNode)));
		});
	});

	describe('gt', () => {
		describe('xs:dateTime', () => {
			it('returns false for xs:dateTime("2000-10-10T12:00:00") and xs:dateTime("2000-10-10T12:00:00")',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:00:00") gt xs:dateTime("2000-10-10T12:00:00")', documentNode)));
			it('returns false for xs:dateTime("2004-08-12T23:01:04.10") gt xs:dateTime("2004-08-12T23:01:04.11")',
			   () => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2004-08-12T23:01:04.10") gt xs:dateTime("2004-08-12T23:01:04.11")', documentNode)));
			it('returns false for xs:dateTime("2000-10-10T12:00:00+05:00") and xs:dateTime("2000-10-10T12:00:00+05:00")',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:00:00+05:00") gt xs:dateTime("2000-10-10T12:00:00+05:00")', documentNode)));
			it('returns false for xs:dateTime("2000-10-10T11:00:00-01:00") and xs:dateTime("2000-10-10T16:00:00+04:00")',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2000-10-10T11:00:00-01:00") gt xs:dateTime("2000-10-10T16:00:00+04:00")', documentNode)));
			it('returns false for xs:dateTime("1999-12-31T24:00:00") and xs:dateTime("2000-01-01T00:00:00")',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("1999-12-31T24:00:00") gt xs:dateTime("2000-01-01T00:00:00")', documentNode)));
			it('returns true for xs:dateTime("2005-04-04T24:00:00") and xs:dateTime("2005-04-04T00:00:00")',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2005-04-04T24:00:00") gt xs:dateTime("2005-04-04T00:00:00")', documentNode)));
			it('returns false for xs:dateTime("2002-04-02T23:00:00-04:00") and xs:dateTime("2002-04-03T02:00:00-01:00")',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dateTime("2002-04-02T23:00:00-04:00") gt xs:dateTime("2002-04-03T02:00:00-01:00")', documentNode)));

			it('returns true for xs:dateTime("2000-10-10T12:00:10") and xs:dateTime("2000-10-10T12:00:00")',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:00:10") gt xs:dateTime("2000-10-10T12:00:00")', documentNode)));
			it('returns true for xs:dateTime("2000-10-10T12:10:00") and xs:dateTime("2000-10-10T12:00:00")',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:10:00") gt xs:dateTime("2000-10-10T12:00:00")', documentNode)));
			it('returns true for xs:dateTime("2000-10-10T12:00:00") and xs:dateTime("2000-10-10T10:00:00")',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2000-10-10T12:00:00") gt xs:dateTime("2000-10-10T10:00:00")', documentNode)));
			it('returns true for xs:dateTime("2000-10-11T12:00:00") and xs:dateTime("2000-10-10T12:00:00")',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2000-10-11T12:00:00") gt xs:dateTime("2000-10-10T12:00:00")', documentNode)));
			it('returns true for xs:dateTime("2000-11-10T12:00:00") and xs:dateTime("2000-10-10T12:00:00")',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2000-11-10T12:00:00") gt xs:dateTime("2000-10-10T12:00:00")', documentNode)));
			it('returns true for xs:dateTime("2001-10-10T12:00:00") and xs:dateTime("2000-10-10T12:00:00")',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dateTime("2001-10-10T12:00:00") gt xs:dateTime("2000-10-10T12:00:00")', documentNode)));
		});

		describe('xs:date', () => {
			it('returns false for "2000-10-10" and "2000-10-10"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:date("2000-10-10") gt xs:date("2000-10-10")', documentNode)));
			it('returns false for "2000-10-10+05:30" and "2000-10-10+05:30"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:date("2000-10-10+05:30") gt xs:date("2000-10-10+05:30")', documentNode)));
			it('returns false for "2000-10-09-12:00" and "2000-10-10+12:00"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:date("2000-10-09-12:00") gt xs:date("2000-10-10+12:00")', documentNode)));

			it('returns true for "2000-10-11" and "2000-10-10"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:date("2000-10-11") gt xs:date("2000-10-10")', documentNode)));
			it('returns true for "2000-11-10" and "2000-10-10"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:date("2000-11-10") gt xs:date("2000-10-10")', documentNode)));
			it('returns true for "2001-10-10" and "2000-10-10"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:date("2001-10-10") gt xs:date("2000-10-10")', documentNode)));
		});

		describe('xs:time', () => {
			it('returns false for "10:10:10.1" and "10:10:10.1"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:time("10:10:10.1") gt xs:time("10:10:10.1")', documentNode)));
			it('returns false for "10:10:10.1-10:25" and "10:10:10.1-10:25"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:time("10:10:10.1-10:25") gt xs:time("10:10:10.1-10:25")', documentNode)));

			it('returns true for "10:10:10.2" and "10:10:10.1"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:time("10:10:10.2") gt xs:time("10:10:10.1")', documentNode)));
			it('returns true for "10:10:11.1" and "10:10:10.1"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:time("10:10:11.1") gt xs:time("10:10:10.1")', documentNode)));
			it('returns true for "10:11:10.1" and "10:10:10.1"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:time("10:11:10.1") gt xs:time("10:10:10.1")', documentNode)));
			it('returns true for "11:10:10.1" and "10:10:10.1"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:time("11:10:10.1") gt xs:time("10:10:10.1")', documentNode)));
		});
	});
});

describe('Duration compares', () => {
	describe('eq', () => {
		describe('xs:duration', () => {
			it('returns true for "P10Y10M10DT10H10M10.1S" and "P10Y10M10DT10H10M10.1S"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:duration("P10Y10M10DT10H10M10.1S") eq xs:duration("P10Y10M10DT10H10M10.1S")', documentNode)));
			it('returns true for "-P10Y10M10DT10H10M10.1S" and "-P10Y10M10DT10H10M10.1S"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:duration("-P10Y10M10DT10H10M10.1S") eq xs:duration("-P10Y10M10DT10H10M10.1S")', documentNode)));
			it('returns true for "P1Y" and "P12M"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:duration("P1Y") eq xs:duration("P12M")', documentNode)));
			it('returns true for "PT24H" and "P1D"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:duration("PT24H") eq xs:duration("P1D")', documentNode)));
			it('returns false for "P1Y" and "P365D"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:duration("P1Y") eq xs:duration("P365D")', documentNode)));
			it('returns false for "P11Y10M10DT10H10M10.1S" and "P10Y10M10DT10H10M10.1S"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:duration("P11Y10M10DT10H10M10.1S") eq xs:duration("P10Y10M10DT10H10M10.1S")', documentNode)));
			it('returns false for "P10Y11M10DT10H10M10.1S" and "P10Y10M10DT10H10M10.1S"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:duration("P10Y11M10DT10H10M10.1S") eq xs:duration("P10Y10M10DT10H10M10.1S")', documentNode)));
			it('returns false for "P10Y10M11DT10H10M10.1S" and "P10Y10M10DT10H10M10.1S"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:duration("P10Y10M11DT10H10M10.1S") eq xs:duration("P10Y10M10DT10H10M10.1S")', documentNode)));
			it('returns false for "P10Y10M10DT11H10M10.1S" and "P10Y10M10DT10H10M10.1S"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:duration("P10Y10M10DT11H10M10.1S") eq xs:duration("P10Y10M10DT10H10M10.1S")', documentNode)));
			it('returns false for "P10Y10M10DT10H11M10.1S" and "P10Y10M10DT10H10M10.1S"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:duration("P10Y10M10DT10H11M10.1S") eq xs:duration("P10Y10M10DT10H10M10.1S")', documentNode)));
			it('returns false for "P10Y10M10DT10H10M11.1S" and "P10Y10M10DT10H10M10.1S"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:duration("P10Y10M10DT10H10M11.1S") eq xs:duration("P10Y10M10DT10H10M10.1S")', documentNode)));
			it('returns false for "P10Y10M10DT10H10M10.2S" and "P10Y10M10DT10H10M10.1S"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:duration("P10Y10M10DT10H10M10.2S") eq xs:duration("P10Y10M10DT10H10M10.1S")', documentNode)));
		});

		describe('xs:yearMonthDuration', () => {
			it('returns true for "P10Y10M" and "P10Y10M"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:yearMonthDuration("P10Y10M") eq xs:yearMonthDuration("P10Y10M")', documentNode)));
			it('returns false for "P11Y10M" and "P10Y10M"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:yearMonthDuration("P11Y10M") eq xs:yearMonthDuration("P10Y10M")', documentNode)));
			it('returns false for "P10Y11M" and "P10Y10M"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:yearMonthDuration("P10Y11M") eq xs:yearMonthDuration("P10Y10M")', documentNode)));
		});

		describe('xs:dayTimeDuration', () => {
			it('returns true for "P10DT10H10M10.1S" and "P10DT10H10M10.1S"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dayTimeDuration("P10DT10H10M10.1S") eq xs:dayTimeDuration("P10DT10H10M10.1S")', documentNode)));
			it('returns false for "P11DT10H10M10.1S" and "P10DT10H10M10.1S"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dayTimeDuration("P11DT10H10M10.1S") eq xs:dayTimeDuration("P10DT10H10M10.1S")', documentNode)));
			it('returns false for "P10DT11H10M10.1S" and "P10DT10H10M10.1S"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dayTimeDuration("P10DT11H10M10.1S") eq xs:dayTimeDuration("P10DT10H10M10.1S")', documentNode)));
			it('returns false for "P10DT10H11M10.1S" and "P10DT10H10M10.1S"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dayTimeDuration("P10DT10H11M10.1S") eq xs:dayTimeDuration("P10DT10H10M10.1S")', documentNode)));
			it('returns false for "P10DT10H10M11.1S" and "P10DT10H10M10.1S"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dayTimeDuration("P10DT10H10M11.1S") eq xs:dayTimeDuration("P10DT10H10M10.1S")', documentNode)));
			it('returns false for "P10DT10H10M10.2S" and "P10DT10H10M10.1S"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dayTimeDuration("P10DT10H10M10.2S") eq xs:dayTimeDuration("P10DT10H10M10.1S")', documentNode)));
		});
	});

	describe('lt', () => {
		describe('xs:yearMonthDuration', () => {
			it('returns true for "P1Y" and "P2Y"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:yearMonthDuration("P1Y") lt xs:yearMonthDuration("P2Y")', documentNode)));
			it('returns true for "P1Y" and "P13M"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:yearMonthDuration("P1Y") lt xs:yearMonthDuration("P13M")', documentNode)));
			it('returns true for "P10M" and "P11M"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:yearMonthDuration("P10M") lt xs:yearMonthDuration("P11M")', documentNode)));
			it('returns false for "P1Y" and "P1M"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:yearMonthDuration("P1Y") lt xs:yearMonthDuration("P1M")', documentNode)));
			it('returns false for "P23M" and "P1Y"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:yearMonthDuration("P23M") lt xs:yearMonthDuration("P1Y")', documentNode)));
		});

		describe('xs:dayTimeDuration', () => {
			it('returns true for "P10D" and "P11D"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dayTimeDuration("P10D") lt xs:dayTimeDuration("P11D")', documentNode)));
			it('returns true for "P1D" and "PT25H"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dayTimeDuration("P1D") lt xs:dayTimeDuration("PT25H")', documentNode)));
			it('returns true for "PT66M" and "PT2H"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dayTimeDuration("PT66M") lt xs:dayTimeDuration("PT2H")', documentNode)));
			it('returns false for "PT33H" and "P1D"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dayTimeDuration("PT33H") lt xs:dayTimeDuration("P1D")', documentNode)));
			it('returns false for "PT1500M" and "P1D"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dayTimeDuration("PT1500M") lt xs:dayTimeDuration("P1D")', documentNode)));
		});
	});

	describe('gt', () => {
		describe('xs:yearMonthDuration', () => {
			it('returns true for "P2Y" and "P1Y"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:yearMonthDuration("P2Y") gt xs:yearMonthDuration("P1Y")', documentNode)));
			it('returns true for "P13M" and "P1Y"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:yearMonthDuration("P13M") gt xs:yearMonthDuration("P1Y")', documentNode)));
			it('returns true for "P11M" and "P10M"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:yearMonthDuration("P11M") gt xs:yearMonthDuration("P10M")', documentNode)));
			it('returns false for "P1M" and "P1Y"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:yearMonthDuration("P1M") gt xs:yearMonthDuration("P1Y")', documentNode)));
			it('returns false for "P1Y" and "P23M"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:yearMonthDuration("P1Y") gt xs:yearMonthDuration("P23M")', documentNode)));
		});

		describe('xs:dayTimeDuration', () => {
			it('returns true for "P11D" and "P10D"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dayTimeDuration("P11D") gt xs:dayTimeDuration("P10D")', documentNode)));
			it('returns true for "PT25H" and "P1D"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dayTimeDuration("PT25H") gt xs:dayTimeDuration("P1D")', documentNode)));
			it('returns true for "PT2H" and "PT66M"',
				() => chai.assert.isTrue(evaluateXPathToBoolean('xs:dayTimeDuration("PT2H") gt xs:dayTimeDuration("PT66M")', documentNode)));
			it('returns false for "P1D" and "PT33H"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dayTimeDuration("P1D") gt xs:dayTimeDuration("PT33H")', documentNode)));
			it('returns false for "P1D" and "PT1500M"',
				() => chai.assert.isFalse(evaluateXPathToBoolean('xs:dayTimeDuration("P1D") gt xs:dayTimeDuration("PT1500M")', documentNode)));
		});
	});
});

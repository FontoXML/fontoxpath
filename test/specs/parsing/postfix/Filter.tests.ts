import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateXPathToNumber, evaluateXPathToNumbers, evaluateXPath } from 'fontoxpath';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

describe('Filter (predicate)', () => {
	it('parses', () => chai.assert.equal(evaluateXPathToNumber('(1,2,3)[. = 2]'), 2));
	it('allows spaces', () => chai.assert.equal(evaluateXPathToNumber('(1,2,3)   [. = 2]'), 2));
	it('returns empty sequence when inputted empty sequence', () =>
		chai.assert.isEmpty(evaluateXPathToNumbers('(1,2,3)[()]')));
	it.only('does not blow up when going over a large set multiple times', () =>
		// This tests a common cause of slowness for the XQuery parser
		chai.assert.equal(
			evaluateXPathToNumber(
				`declare variable $arr := (${new Array(10000)
					.fill(0)
					.map((_, i) => i + 1)
					.join(',')});
 $arr[$arr[$arr[$arr[10000]]]]`,
				null,
				null,
				null,
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			),
			9996
		));
	it('returns the sequence when filtering with a string', () =>
		chai.assert.deepEqual(evaluateXPathToNumbers('(1,2,3,4)["TAKE ME"]'), [1, 2, 3, 4]));
	it('returns the empty sequence when filtering with an empty string', () =>
		chai.assert.isEmpty(evaluateXPathToNumbers('(1,2,3,4)[""]')));
	it('returns the sequence when filtering asynchronously', async () => {
		chai.assert.equal(
			await evaluateXPathToAsyncSingleton(
				'(1,2,3,4)[fontoxpath:sleep(true(), 100)] => count()'
			),
			4
		);
	});
	it('returns the sequence when filtering asynchronously, forcing ebv to be determinded async', async () => {
		chai.assert.equal(
			await evaluateXPathToAsyncSingleton(
				'(1,2,3,4)[(true(), fontoxpath:sleep((), 100))] => count()'
			),
			4
		);
	});
});

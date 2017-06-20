import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('quantified expressions', () => {
	it('does not leak variables',
	   () => chai.assert.throws(() => evaluateXPathToBoolean('some $a in (1, 2), $b in (1, 2), $c in (1, 2) satisfies 1, $c', documentNode, null), 'XPST0008'));

	describe('every', () => {
		it('allows usage of global variables inside the satisfies clause',
			() => chai.assert(evaluateXPathToBoolean('every $x in true() satisfies $x = $y', documentNode, null, { y: true })));

		it('overwrites global variables inside the satisfies clause',
			() => chai.assert(evaluateXPathToBoolean('every $x in true() satisfies $x', documentNode, null, { x: false })));

		it('does not throw when a result has been found before errors',
			() => chai.assert(evaluateXPathToBoolean('(every $x in (1, 2, "cat") satisfies 2 * $x = 2) eq false()', documentNode)));

		describe('single variable binding', () => {
			it('returns true if one of the values is true',
				() => chai.assert(evaluateXPathToBoolean('every $x in true() satisfies $x', documentNode)));

			it('returns true if none of the values are true',
				() => chai.assert(evaluateXPathToBoolean('(every $x in false() satisfies $x) eq false()', documentNode)));

			it('returns false if passed an empty sequence',
				() => chai.assert(evaluateXPathToBoolean('(every $x in () satisfies true()) eq true()', documentNode)));

			// From the QT3_1_0 XPath 3.1 tests
			it('Simple quantified expression using "every" keyword and use of logical expression (or).',
				() => chai.assert(evaluateXPathToBoolean('every $x in (1, 2) satisfies $x = 1 or ($x +1) = 3', documentNode)));
		});

		describe('multiple variable binding', () => {
			it('returns true if one the satisfies options returns true',
				() => chai.assert(evaluateXPathToBoolean('every $x in true(), $y in true() satisfies $x = $y', documentNode)));

			it('returns false if none the satisfies options returns true',
				() => chai.assert(evaluateXPathToBoolean('(every $x in (false(), true()), $y in (false(), true()) satisfies $x = $y) eq false()', documentNode)));
		});
	});

	describe('some', () => {
		it('allows usage of global variables inside the satisfies clause',
			() => chai.assert(evaluateXPathToBoolean('some $x in true() satisfies $x = $y', documentNode, null, { y: true })));

		it('overwrites global variables inside the satisfies clause',
			() => chai.assert(evaluateXPathToBoolean('some $x in true() satisfies $x', documentNode, null, { x: false })));

		it('does not throw when a result has been found before errors',
			() => chai.assert(evaluateXPathToBoolean('(some $x in (1, 2, "cat") satisfies 2 * $x = 2) eq true()', documentNode)));

		describe('single variable binding', () => {
			it('returns true if one of the values is true',
				() => chai.assert(evaluateXPathToBoolean('some $x in true() satisfies $x', documentNode)));

			it('returns true if none of the values are true',
				() => chai.assert(evaluateXPathToBoolean('(some $x in false() satisfies $x) eq false()', documentNode)));

			it('returns false if passed an empty sequence',
				() => chai.assert(evaluateXPathToBoolean('(some $x in () satisfies true()) eq false()', documentNode)));

			// From the QT3_1_0 XPath 3.1 tests
			it('Simple quantified expression using "some" keyword and use of logical expression (and).',
				() => chai.assert(evaluateXPathToBoolean('some $x in (1, 2) satisfies $x = 1 and ($x +1) = 2', documentNode)));
		});

		describe('multiple variable binding', () => {
			it('returns true if one the satisfies options returns true',
				() => chai.assert(evaluateXPathToBoolean('some $x in true(), $y in true() satisfies $x = $y', documentNode)));

			it('returns false if none the satisfies options returns true',
				() => chai.assert(evaluateXPathToBoolean('(some $x in false(), $y in true() satisfies $x = $y) = false()', documentNode)));
		});
	});
});

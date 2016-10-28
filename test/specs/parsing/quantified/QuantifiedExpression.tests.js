import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('quantified expressions', () => {
	describe('every', () => {
		it('allows usage of global variables inside the satisfies clause', () => {
			chai.assert(evaluateXPath('every $x in true() satisfies $x = $y', documentNode, blueprint, {'y': true}));
		});

		it('overwrites global variables inside the satisfies clause', () => {
			chai.assert(evaluateXPath('every $x in true() satisfies $x', documentNode, blueprint, {'x': false}));
		});

		it('does not throw when a result has been found before errors', () => {
			chai.assert(evaluateXPath('(every $x in (1, 2, "cat") satisfies 2 * $x = 2) eq false()', documentNode, blueprint));
		});

		describe('single variable binding', () => {
			it('returns true if one of the values is true', () => {
				chai.assert(evaluateXPath('every $x in true() satisfies $x', documentNode, blueprint));
			});

			it('returns true if none of the values are true', () => {
				chai.assert(evaluateXPath('(every $x in false() satisfies $x) eq false()', documentNode, blueprint));
			});

			it('returns false if passed an empty sequence', () => {
				chai.assert(evaluateXPath('(every $x in () satisfies true()) eq true()', documentNode, blueprint));
			});

			// From the QT3_1_0 XPath 3.1 tests
			it('Simple quantified expression using "every" keyword and use of logical expression (or).', () => {
				chai.assert(evaluateXPath('every $x in (1, 2) satisfies $x = 1 or ($x +1) = 3', documentNode, blueprint));
			});
		});

		describe('multiple variable binding', () => {
			it('returns true if one the satisfies options returns true', () => {
				chai.assert(evaluateXPath('every $x in true(), $y in true() satisfies $x = $y', documentNode, blueprint));
			});

			it('returns false if none the satisfies options returns true', () => {
				chai.assert(evaluateXPath('(every $x in (false(), true()), $y in (false(), true()) satisfies $x = $y) eq false()', documentNode, blueprint));
			});
		});
	});

	describe('some', () => {
		it('allows usage of global variables inside the satisfies clause', () => {
			chai.assert(evaluateXPath('some $x in true() satisfies $x = $y', documentNode, blueprint, {'y': true}));
		});

		it('overwrites global variables inside the satisfies clause', () => {
			chai.assert(evaluateXPath('some $x in true() satisfies $x', documentNode, blueprint, {'x': false}));
		});

		it('does not throw when a result has been found before errors', () => {
			chai.assert(evaluateXPath('(some $x in (1, 2, "cat") satisfies 2 * $x = 2) eq true()', documentNode, blueprint));
		});

		describe('single variable binding', () => {
			it('returns true if one of the values is true', () => {
				chai.assert(evaluateXPath('some $x in true() satisfies $x', documentNode, blueprint));
			});

			it('returns true if none of the values are true', () => {
				chai.assert(evaluateXPath('(some $x in false() satisfies $x) eq false()', documentNode, blueprint));
			});

			it('returns false if passed an empty sequence', () => {
				chai.assert(evaluateXPath('(some $x in () satisfies true()) eq false()', documentNode, blueprint));
			});

			// From the QT3_1_0 XPath 3.1 tests
			it('Simple quantified expression using "some" keyword and use of logical expression (and).', () => {
				chai.assert(evaluateXPath('some $x in (1, 2) satisfies $x = 1 and ($x +1) = 2', documentNode, blueprint));
			});
		});

		describe('multiple variable binding', () => {
			it('returns true if one the satisfies options returns true', () => {
				chai.assert(evaluateXPath('some $x in true(), $y in true() satisfies $x = $y', documentNode, blueprint));
			});

			it('returns false if none the satisfies options returns true', () => {
				chai.assert(evaluateXPath('(some $x in false(), $y in true() satisfies $x = $y) = false()', documentNode, blueprint));
			});
		});
	});
});

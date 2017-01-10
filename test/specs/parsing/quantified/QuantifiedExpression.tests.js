import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToBoolean } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('quantified expressions', () => {
	describe('every', () => {
		it('allows usage of global variables inside the satisfies clause', () => {
			chai.assert(evaluateXPathToBoolean('every $x in true() satisfies $x = $y', documentNode, domFacade, {'y': true}));
		});

		it('overwrites global variables inside the satisfies clause', () => {
			chai.assert(evaluateXPathToBoolean('every $x in true() satisfies $x', documentNode, domFacade, {'x': false}));
		});

		it('does not throw when a result has been found before errors', () => {
			chai.assert(evaluateXPathToBoolean('(every $x in (1, 2, "cat") satisfies 2 * $x = 2) eq false()', documentNode, domFacade));
		});

		describe('single variable binding', () => {
			it('returns true if one of the values is true', () => {
				chai.assert(evaluateXPathToBoolean('every $x in true() satisfies $x', documentNode, domFacade));
			});

			it('returns true if none of the values are true', () => {
				chai.assert(evaluateXPathToBoolean('(every $x in false() satisfies $x) eq false()', documentNode, domFacade));
			});

			it('returns false if passed an empty sequence', () => {
				chai.assert(evaluateXPathToBoolean('(every $x in () satisfies true()) eq true()', documentNode, domFacade));
			});

			// From the QT3_1_0 XPath 3.1 tests
			it('Simple quantified expression using "every" keyword and use of logical expression (or).', () => {
				chai.assert(evaluateXPathToBoolean('every $x in (1, 2) satisfies $x = 1 or ($x +1) = 3', documentNode, domFacade));
			});
		});

		describe('multiple variable binding', () => {
			it('returns true if one the satisfies options returns true', () => {
				chai.assert(evaluateXPathToBoolean('every $x in true(), $y in true() satisfies $x = $y', documentNode, domFacade));
			});

			it('returns false if none the satisfies options returns true', () => {
				chai.assert(evaluateXPathToBoolean('(every $x in (false(), true()), $y in (false(), true()) satisfies $x = $y) eq false()', documentNode, domFacade));
			});
		});
	});

	describe('some', () => {
		it('allows usage of global variables inside the satisfies clause', () => {
			chai.assert(evaluateXPathToBoolean('some $x in true() satisfies $x = $y', documentNode, domFacade, {'y': true}));
		});

		it('overwrites global variables inside the satisfies clause', () => {
			chai.assert(evaluateXPathToBoolean('some $x in true() satisfies $x', documentNode, domFacade, {'x': false}));
		});

		it('does not throw when a result has been found before errors', () => {
			chai.assert(evaluateXPathToBoolean('(some $x in (1, 2, "cat") satisfies 2 * $x = 2) eq true()', documentNode, domFacade));
		});

		describe('single variable binding', () => {
			it('returns true if one of the values is true', () => {
				chai.assert(evaluateXPathToBoolean('some $x in true() satisfies $x', documentNode, domFacade));
			});

			it('returns true if none of the values are true', () => {
				chai.assert(evaluateXPathToBoolean('(some $x in false() satisfies $x) eq false()', documentNode, domFacade));
			});

			it('returns false if passed an empty sequence', () => {
				chai.assert(evaluateXPathToBoolean('(some $x in () satisfies true()) eq false()', documentNode, domFacade));
			});

			// From the QT3_1_0 XPath 3.1 tests
			it('Simple quantified expression using "some" keyword and use of logical expression (and).', () => {
				chai.assert(evaluateXPathToBoolean('some $x in (1, 2) satisfies $x = 1 and ($x +1) = 2', documentNode, domFacade));
			});
		});

		describe('multiple variable binding', () => {
			it('returns true if one the satisfies options returns true', () => {
				chai.assert(evaluateXPathToBoolean('some $x in true(), $y in true() satisfies $x = $y', documentNode, domFacade));
			});

			it('returns false if none the satisfies options returns true', () => {
				chai.assert(evaluateXPathToBoolean('(some $x in false(), $y in true() satisfies $x = $y) = false()', documentNode, domFacade));
			});
		});
	});
});

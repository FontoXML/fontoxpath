import * as slimdom from 'slimdom';

import {
	evaluateXPathToNumber,
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('Math functions', () => {
	describe('math:pi', () => {
		it('returns 3.141592653589793e0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:pi() = 3.141592653589793e0', documentNode)));
	});

	describe('math:exp', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp(()) => empty()', documentNode)));
		it('returns 1 for input 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp(0) = 1', documentNode)));
		it('returns 2.718281828459045e0 for input 1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp(1) = 2.718281828459045', documentNode)));
		it('returns 0.36787944117144233e0 for input -1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp(-1) = 0.36787944117144233e0', documentNode)));
	});

	describe('math:exp10', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp10(()) => empty()', documentNode)));
		it('returns 1 for input 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp10(0) = 1', documentNode)));
		it('returns 10 for input 1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp10(1) = 10', documentNode)));
		it('returns 100 for input 2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp10(2) = 100', documentNode)));
		it('returns 0.1 for input -1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp10(-1) = 0.1', documentNode)));
	});

	describe('math:log', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:log(()) => empty()', documentNode)));
		it('returns -INF for input 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:log(0) = xs:double("-INF")', documentNode)));
		it('returns 0 for input 1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:log(1) = 0', documentNode)));
		it('returns 0.6931471805599453e0 for input 2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:log(2) = 0.6931471805599453e0', documentNode)));
		it('returns NaN for input -1',
			() => chai.assert.isNaN(evaluateXPathToNumber('math:log(-1)', documentNode)));
	});

	describe('math:log10', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:log10(()) => empty()', documentNode)));
		it('returns -INF for input 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:log10(0) = xs:double("-INF")', documentNode)));
		it('returns 0 for input 1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:log10(1) = 0', documentNode)));
		it('returns 0.3010299956639812 for input 2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:log10(2) = 0.3010299956639812', documentNode)));
	});

	describe('math:pow', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:pow((), 12) => empty()', documentNode)));
		it('returns 1 for input 1, 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:pow(1, 0) = 1', documentNode)));
		it('returns 25 for input 5, 2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:pow(5, 2) = 25', documentNode)));
	});

	describe('math:sqrt', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:sqrt(()) => empty()', documentNode)));
		it('returns 5 for input 25',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:sqrt(25) = 5', documentNode)));
	});

	describe('math:sin', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:sin(()) => empty()', documentNode)));
		it('returns 0 for input 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:sin(0) = 0', documentNode)));
	});

	describe('math:cos', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:cos(()) => empty()', documentNode)));
		it('returns 0 for input 1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:cos(0) = 1', documentNode)));
	});

	describe('math:tan', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:tan(()) => empty()', documentNode)));
		it('returns 0 for input 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:tan(0) = 0', documentNode)));
	});

	describe('math:asin', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:asin(()) => empty()', documentNode)));
		it('returns 0 for input 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:asin(0) = 0', documentNode)));
	});

	describe('math:acos', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:acos(()) => empty()', documentNode)));
		it('returns 0 for input 1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:acos(1) = 0', documentNode)));
	});

	describe('math:atan', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:atan(()) => empty()', documentNode)));
		it('returns 0 for input 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:atan(0) = 0', documentNode)));
	});

	describe('math:atan2', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:atan2((), 1) => empty()', documentNode)));
		it('returns 0 for input 0, 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:atan2(0, 0) = 0', documentNode)));
	});
});

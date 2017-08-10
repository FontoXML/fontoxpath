import * as slimdom from 'slimdom';

import {
	evaluateXPathToNumber,
	evaluateXPathToBoolean
} from 'fontoxpath';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

describe('Math functions', () => {
	describe('math:pi', () => {
		it('returns 3.141592653589793e0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:pi() = 3.141592653589793e0')));
	});

	describe('math:exp', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp(()) => empty()')));
		it('returns 1 for input 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp(0) = 1')));
		it('allows async params', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('math:exp(0 => fontoxpath:sleep()) = 1'));
		});
		it('returns 2.718281828459045e0 for input 1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp(1) = 2.718281828459045')));
		it('returns 0.36787944117144233e0 for input -1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp(-1) = 0.36787944117144233e0')));
	});

	describe('math:exp10', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp10(()) => empty()')));
		it('returns 1 for input 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp10(0) = 1')));
		it('accepts async parameters', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('math:exp10(0 => fontoxpath:sleep()) = 1'));
		});
		it('returns 10 for input 1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp10(1) = 10')));
		it('returns 100 for input 2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp10(2) = 100')));
		it('returns 0.1 for input -1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:exp10(-1) = 0.1')));
	});

	describe('math:log', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:log(()) => empty()')));
		it('returns -INF for input 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:log(0) = xs:double("-INF")')));
		it('returns 0 for input 1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:log(1) = 0')));
		it('accepts async parameters', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('math:log(1 => fontoxpath:sleep()) = 0'));
		});
		it('returns 0.6931471805599453e0 for input 2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:log(2) = 0.6931471805599453e0')));
		it('returns NaN for input -1',
			() => chai.assert.isNaN(evaluateXPathToNumber('math:log(-1)')));
	});

	describe('math:log10', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:log10(()) => empty()')));
		it('returns -INF for input 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:log10(0) = xs:double("-INF")')));
		it('returns 0 for input 1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:log10(1) = 0')));
		it('accepts async parameters', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('math:log10(1 => fontoxpath:sleep()) = 0'));
		});
		it('returns 0.3010299956639812 for input 2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:log10(2) = 0.3010299956639812')));
	});

	describe('math:pow', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:pow((), 12) => empty()')));
		it('returns 1 for input 1, 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:pow(1, 0) = 1')));
		it('returns 25 for input 5, 2',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:pow(5, 2) = 25')));
		it('accepts async parameters', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('math:pow(1 => fontoxpath:sleep(), 0 => fontoxpath:sleep()) = 1'));
		});
	});

	describe('math:sqrt', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:sqrt(()) => empty()')));
		it('returns 5 for input 25',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:sqrt(25) = 5')));
		it('accepts async parameters', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('math:sqrt(25 => fontoxpath:sleep()) = 5'));
		});
	});

	describe('math:sin', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:sin(()) => empty()')));
		it('returns 0 for input 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:sin(0) = 0')));
		it('accepts async parameters', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('math:sin(0 => fontoxpath:sleep()) = 0'));
		});
	});

	describe('math:cos', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:cos(()) => empty()')));
		it('returns 0 for input 1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:cos(0) = 1')));
		it('accepts async parameters', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('math:cos(0 => fontoxpath:sleep()) = 1'));
		});
	});

	describe('math:tan', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:tan(()) => empty()')));
		it('returns 0 for input 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:tan(0) = 0')));
		it('accepts async parameters', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('math:tan(0 => fontoxpath:sleep()) = 0'));
		});
	});

	describe('math:asin', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:asin(()) => empty()')));
		it('returns 0 for input 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:asin(0) = 0')));
		it('accepts async parameters', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('math:asin(0 => fontoxpath:sleep()) = 0'));
		});
	});

	describe('math:acos', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:acos(()) => empty()')));
		it('returns 0 for input 1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:acos(1) = 0')));
		it('accepts async parameters', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('math:acos(1 => fontoxpath:sleep()) = 0'));
		});
	});

	describe('math:atan', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:atan(()) => empty()')));
		it('returns 0 for input 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:atan(0) = 0')));
		it('accepts async parameters', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('math:atan(0 => fontoxpath:sleep()) = 0'));
		});
	});

	describe('math:atan2', () => {
		it('returns empty sequence for empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:atan2((), 1) => empty()')));
		it('returns 0 for input 0, 0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('math:atan2(0, 0) = 0')));
		it('accepts async parameters', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('math:atan2(0 => fontoxpath:sleep(), 0 => fontoxpath:sleep()) = 0'));
		});
	});
});

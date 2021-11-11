import * as chai from 'chai';
import { evaluateXPathToBoolean } from 'fontoxpath';
import * as sinon from 'sinon';

describe('debugging functions', () => {
	describe('fn:trace', () => {
		let consoleSpy = null;
		beforeEach(() => {
			consoleSpy = sinon.spy(console, 'log');
		});
		afterEach(() => {
			if (consoleSpy) {
				consoleSpy.restore();
				consoleSpy = null;
			}
		});
		it('returns the input', () => chai.assert.isTrue(evaluateXPathToBoolean('trace(true())')));
		it('accepts two parameters', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('trace(true(), "message")')));
		it('outputs the trace', () => {
			evaluateXPathToBoolean('trace(true())');
			chai.assert.isTrue(consoleSpy.called);
		});
	});
});

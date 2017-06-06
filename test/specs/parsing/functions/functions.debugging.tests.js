import {
	evaluateXPathToBoolean
} from 'fontoxpath';

describe('debugging functions', () => {
	describe('fn:trace', () => {
		it('returns the input', () => chai.assert.isTrue(evaluateXPathToBoolean('trace(true())')));
		it('accepts two parameters', () => chai.assert.isTrue(evaluateXPathToBoolean('trace(true(), "message")')));
		it('outputs the trace', () => {
			sinon.spy(console, 'log');
			evaluateXPathToBoolean('trace(true())');
			chai.assert.isTrue(console.log.called);
			console.log.restore();
		});
	});
});

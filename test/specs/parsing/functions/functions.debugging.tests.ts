import * as chai from 'chai';
import { evaluateXPathToArray, evaluateXPathToBoolean } from 'fontoxpath';
import * as sinon from 'sinon';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

describe('debugging functions', () => {
	describe('fn:trace', () => {
		let consoleSpy = null;
		let documentNode: slimdom.Document;

		beforeEach(() => {
			documentNode = new slimdom.Document();
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

		it('accepts empty array as first argument', () =>
			chai.assert.isEmpty(evaluateXPathToArray('trace([], "message")')));

		it('outputs the trace', () => {
			evaluateXPathToBoolean('trace(true())');
			chai.assert.isTrue(consoleSpy.called);
		});

		it('serializes nodes', () => {
			jsonMlMapper.parse(['someElement', 'Some text.'], documentNode);
			evaluateXPathToBoolean(
				'trace((., 42, ./someElement/text()))',
				documentNode,
				undefined,
				undefined,
				{
					xmlSerializer: new slimdom.XMLSerializer(),
				},
			);
			chai.assert.isTrue(consoleSpy.called);
			chai.assert.equal(
				consoleSpy.args[0],
				'{type: document-node(), value: <someElement>Some text.</someElement>}\n{type: xs:integer, value: 42}\n{type: text(), value: Some text.}\n',
			);
		});
	});
});

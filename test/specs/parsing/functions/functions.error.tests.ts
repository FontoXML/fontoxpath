import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { domFacade, evaluateXPathToBoolean } from 'fontoxpath';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('error functions', () => {
	describe('fn:error', () => {
		it('supports the no-argument version', () => {
			chai.assert.throws(
				() => evaluateXPathToBoolean('fn:error()', documentNode, domFacade),
				'FOER0000'
			);
		});
		it('supports the one-argument version', () => {
			chai.assert.throws(
				() =>
					evaluateXPathToBoolean(
						"fn:error(fn:QName('http://www.example.com/HR', 'myerr:toohighsal'))",
						documentNode,
						domFacade
					),
				'toohighsal'
			);
		});
		it('supports the two-argument version', () => {
			chai.assert.throws(
				() =>
					evaluateXPathToBoolean(
						"fn:error(fn:QName('http://www.example.com/HR', 'myerr:toohighsal'), 'Does not apply because salary is too high')",
						documentNode,
						domFacade
					),
				'toohighsal: Does not apply because salary is too high'
			);
		});
		it('Rejects passing passing an error object', () => {
			chai.assert.throws(
				() =>
					evaluateXPathToBoolean(
						"fn:error(fn:QName('http://www.example.com/', 'myerr:mycode'), 'My description', map{})",
						documentNode,
						domFacade
					),
				'Not implemented: Using an error object in error is not supported'
			);
		});

		it('Throws the correct error when used in another operator', () => {
			chai.assert.throws(
				() => evaluateXPathToBoolean('fn:error() + 1', documentNode, domFacade),
				'FOER0000'
			);
		});

		it('Throws the correct error when used in another operator with annotation', () => {
			chai.assert.throws(
				() =>
					evaluateXPathToBoolean('fn:error() + 4', documentNode, domFacade, null, {
						annotateAst: true,
					}),
				'FOER0000'
			);
		});
	});
});

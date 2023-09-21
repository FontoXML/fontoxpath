import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { domFacade, evaluateXPathToBoolean } from 'fontoxpath';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('boolean functions', () => {
	describe('xs:boolean()', () => {
		it('accepts "true"', () => {
			chai.assert.equal(
				evaluateXPathToBoolean('xs:boolean("true")', documentNode, domFacade),
				true,
			);
		});
	});
	describe('fn:boolean()', () => {
		it('accepts "true"', () => {
			chai.assert.equal(
				evaluateXPathToBoolean('fn:boolean("true")', documentNode, domFacade),
				true,
			);
		});
	});
	describe('fn:not()', () => {
		it('accepts true', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('not(true())', documentNode, domFacade));
		});
	});
});

import * as slimdom from 'slimdom';

import {
	domFacade,
	evaluateXPathToBoolean
} from 'fontoxpath';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('boolean functions', () => {
	describe('xs:boolean()', () => {
		it('accepts "true"', () => {
			chai.assert.equal(evaluateXPathToBoolean('xs:boolean("true")', documentNode, domFacade), true);
		});
	});
	describe('fn:boolean()', ()=> {
		it('accepts "true"', () => {
			chai.assert.equal(evaluateXPathToBoolean('fn:boolean("true")', documentNode, domFacade), true);
		});
		it('accepts async params to true', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('fn:boolean(1 => fontoxpath:sleep())', documentNode, domFacade));
		});
		it('accepts async params to false', async () => {
			chai.assert.isFalse(await evaluateXPathToAsyncSingleton('fn:boolean(0 => fontoxpath:sleep())', documentNode, domFacade));
		});
	});
	describe('fn:not()', ()=> {
		it('accepts true', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('not(true())', documentNode, domFacade));
		});
		it('accepts async params to true', async () => {
			chai.assert.isFalse(await evaluateXPathToAsyncSingleton('not(true() => fontoxpath:sleep())', documentNode, domFacade));
		});
		it('accepts async params to false', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('not(false() => fontoxpath:sleep())', documentNode, domFacade));
		});
	});
});

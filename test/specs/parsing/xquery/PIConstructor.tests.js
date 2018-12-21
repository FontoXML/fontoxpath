import chai from 'chai';
import * as slimdom from 'slimdom';

import {
	evaluateXPathToFirstNode
} from 'fontoxpath';
import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('PIConstructor', () => {
	it('can create a PI', () => {
		chai.assert.equal(evaluateXPathToFirstNode('processing-instruction my-pi { "data" }', documentNode, undefined, {}, { language: 'XQuery3.1' }).nodeType, 7);
	});

	it('can create a PI with asynchronous', async () => {
		chai.assert.equal((await evaluateXPathToAsyncSingleton(`
		declare namespace fontoxpath="http://fontoxml.com/fontoxpath";
		processing-instruction {fontoxpath:sleep("my-pi",100)} {fontoxpath:sleep("data", 100)}`, documentNode, undefined, {}, { language: 'XQuery3.1' })).nodeType, 7);
	});
});

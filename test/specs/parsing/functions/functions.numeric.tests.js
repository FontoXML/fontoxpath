import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import {
	evaluateXPathToNumber
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('numeric functions', () => {
	describe('xs:float()', () => {
		it('accepts INF', () => {
			chai.assert.equal(evaluateXPathToNumber('xs:float("INF")', documentNode, domFacade), Infinity);
		});
		it('accepts the empty sequence', () => {
			chai.assert.equal(evaluateXPathToNumber('xs:float(()) => count()', documentNode, domFacade), 0);
		});

	});

	describe('xs:double()', () => {
		it('accepts INF', () => {
			chai.assert.equal(evaluateXPathToNumber('xs:double("INF")', documentNode, domFacade), Infinity);
		});
		it('accepts the empty sequence', () => {
			chai.assert.equal(evaluateXPathToNumber('xs:double(()) => count()', documentNode, domFacade), 0);
		});
	});

	describe('xs:integer()', () => {
		it('accepts 42', () => {
			chai.assert.equal(evaluateXPathToNumber('xs:integer("42")', documentNode, domFacade), 42);
		});
		it('accepts the empty sequence', () => {
			chai.assert.equal(evaluateXPathToNumber('xs:integer(()) => count()', documentNode, domFacade), 0);
		});
	});
});

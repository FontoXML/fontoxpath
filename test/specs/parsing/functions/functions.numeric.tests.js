import slimdom from 'slimdom';

import {
	evaluateXPathToNumber
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('numeric functions', () => {
	describe('number()', () => {
		it('accepts INF',
			() => chai.assert.equal(evaluateXPathToNumber('number("INF")', documentNode), Infinity));

		it('accepts the empty sequence',
			() => chai.assert.isNaN(evaluateXPathToNumber('number(())', documentNode)));

		it('accepts nodes', () => {
			documentNode.appendChild(documentNode.createElement('someElement'));
			chai.assert.isNaN(evaluateXPathToNumber('number(./text()[1])', documentNode));
		});
	});

	describe('xs:float()', () => {
		it('accepts INF',
			() => chai.assert.equal(evaluateXPathToNumber('xs:float("INF")', documentNode), Infinity));

		it('accepts the empty sequence',
			() => chai.assert.equal(evaluateXPathToNumber('xs:float(()) => count()', documentNode), 0));
	});

	describe('xs:double()', () => {
		it('accepts INF',
			() => chai.assert.equal(evaluateXPathToNumber('xs:double("INF")', documentNode), Infinity));

		it('accepts the empty sequence',
			() => chai.assert.equal(evaluateXPathToNumber('xs:double(()) => count()', documentNode), 0));
	});

	describe('xs:integer()', () => {
		it('accepts 42',
			() => chai.assert.equal(evaluateXPathToNumber('xs:integer("42")', documentNode), 42));

		it('accepts the empty sequence',
			() => chai.assert.equal(evaluateXPathToNumber('xs:integer(()) => count()', documentNode), 0));
	});
});

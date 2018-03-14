import * as slimdom from 'slimdom';

import {
	evaluateXPathToNumber,
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('unary operators', () => {
	it('accepts + when passed an integer',
		() => chai.assert.equal(evaluateXPathToNumber('+1', documentNode), 1));

	it('negates a - when passed an integer',
		() => chai.assert.equal(evaluateXPathToNumber('-1', documentNode), -1));

	it('returns a decimal when given a decimal',
		() => chai.assert.isTrue(evaluateXPathToBoolean('-(xs:decimal("1.5")) instance of xs:decimal', documentNode)));

	it('returns a float when given a float',
		() => chai.assert.isTrue(evaluateXPathToBoolean('-(xs:float("1.5")) instance of xs:float', documentNode)));

	it('returns a double when given a double',
		() => chai.assert.isTrue(evaluateXPathToBoolean('-(xs:double("1.5")) instance of xs:double', documentNode)));

	it('returns an integer when given an integer',
		() => chai.assert.isTrue(evaluateXPathToBoolean('-(xs:integer("1")) instance of xs:integer', documentNode)));

	it('accepts + when passed 0',
		() => chai.assert.equal(evaluateXPathToNumber('+0', documentNode), 0));

	it('accepts - when passed 0',
		() => chai.assert.equal(evaluateXPathToNumber('-0', documentNode), 0));

	it('accepts chaining +',
		() => chai.assert.equal(evaluateXPathToNumber('++++1', documentNode), 1));

	it('accepts chaining -',
		() => chai.assert.equal(evaluateXPathToNumber('----1', documentNode), 1));

	it('accepts chaining - and + intermittently',
		() => chai.assert.equal(evaluateXPathToNumber('+-+-1', documentNode), 1));

	it('resolves to NaN passed a string',
		() => chai.assert.isNaN(evaluateXPathToNumber('+"something"', documentNode)));

	it('resolves to NaN passed a string',
		() => chai.assert.isNaN(evaluateXPathToNumber('-"something"', documentNode)));

	it('resolves to NaN passed a boolean',
		() => chai.assert.isNaN(evaluateXPathToNumber('+true()', documentNode)));

	it('resolves to the empty sequence when passed the empty sequence',
		() => chai.assert.isTrue(evaluateXPathToBoolean('-() => empty()', documentNode)));

	it('accepts untyped atomics for "-"', () => {
		chai.assert.equal(evaluateXPathToNumber(
			'-<a>1</a>',
			documentNode,
			undefined,
			{},
			{ language: 'XQuery3.1' }
		), -1);
	});

	it('accepts untyped atomics for "+"', () => {
		chai.assert.equal(evaluateXPathToNumber(
			'+<a>1</a>',
			documentNode,
			undefined,
			{},
			{ language: 'XQuery3.1' }
		), 1);
	});
});

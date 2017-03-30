import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToNodes, evaluateXPathToNumber, evaluateXPathToBoolean } from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('Value compares', () => {
	it('works over singleton sequences',
		() => chai.assert.isTrue(evaluateXPathToBoolean('true() eq true()', documentNode)));

	it('works over empty sequences',
		() => chai.assert.deepEqual(evaluateXPathToNodes('() eq ()', documentNode), []));

	it('works over one empty sequence and a filled one',
		() => chai.assert.deepEqual(evaluateXPathToNodes('() eq (true())', documentNode), []));

	it('does not work over non-singleton sequences',
		() => chai.assert.throw(() => evaluateXPathToNodes('(1, 2) eq true()', documentNode), /XPTY0004/));

	it('Does work with typing: decimal to int',
		() => chai.assert.isTrue(evaluateXPathToBoolean('1 eq 1.0', documentNode)));

	it('Does work with typing: double to int',
		() => chai.assert.isTrue(evaluateXPathToBoolean('100 eq 1.0e2', documentNode)));

	it('atomizes attributes', () => {
		jsonMlMapper.parse([
			'someNode',
			{
				a: 'value',
				b: 'value'
			}
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('@a eq "value"', documentNode.documentElement));
	});

	it('works with typing: untyped attributes', () => {
		jsonMlMapper.parse([
			'someNode',
			{
				a: 'value'
			}
		], documentNode);
		chai.assert.throw(() => evaluateXPathToBoolean('@a eq 1', documentNode.documentElement), /FORG0001/);
	});

	it('(does not) work with typing: int to string',
		() => chai.assert.throw(() => evaluateXPathToBoolean('1 eq "1"', documentNode), /XPTY0004/));

	it('(does not) work with typing: boolean to string',
		() => chai.assert.throw(() => evaluateXPathToBoolean('true() eq "true"', documentNode), /XPTY0004/));

	describe('eq', () => {
		it('returns true if the first operand is equal to the second',
			() => chai.assert.isTrue(evaluateXPathToBoolean('1 eq 1', documentNode)));

		it('+0 eq -0',
			() => chai.assert.isTrue(evaluateXPathToBoolean('+0 eq -0', documentNode)));

		it('returns false if the first operand is not equal to the second',
			() => chai.assert.isFalse(evaluateXPathToBoolean('1 eq 2', documentNode)));
	});

	describe('ne', () => {
		it('returns true if the first operand is not equal to the second',
			() => chai.assert.isTrue(evaluateXPathToBoolean('1 ne 2', documentNode)));

		it('returns false if the first operand is equal to the second',
			() => chai.assert.isFalse(evaluateXPathToBoolean('1 ne 1', documentNode)));
	});

	describe('gt', () => {
		it('returns true if the first operand is greater than the second',
			() => chai.assert.isTrue(evaluateXPathToBoolean('2 gt 1', documentNode)));

		it('returns false if the first operand is equal to the second',
			() => chai.assert.isFalse(evaluateXPathToBoolean('1 gt 1', documentNode)));

		it('returns false if the first operand is less than the second',
			() => chai.assert.isFalse(evaluateXPathToBoolean('1 gt 2', documentNode)));
	});

	describe('lt', () => {
		it('returns true if the first operand is less than the second',
			() => chai.assert.isTrue(evaluateXPathToBoolean('1 lt 2', documentNode)));

		it('returns false if the first operand is equal to the second',
			() => chai.assert.isFalse(evaluateXPathToBoolean('1 lt 1', documentNode)));

		it('returns false if the first operand is less than the second',
			() => chai.assert.isFalse(evaluateXPathToBoolean('2 lt 1', documentNode)));
	});

	describe('ge', () => {
		it('returns true if the first operand is greater than the second',
			() => chai.assert.isTrue(evaluateXPathToBoolean('2 ge 1', documentNode)));

		it('returns true if the first operand is equal to the second',
			() => chai.assert.isTrue(evaluateXPathToBoolean('1 ge 1', documentNode)));

		it('returns false if the first operand is less than the second',
			() => chai.assert.isFalse(evaluateXPathToBoolean('1 ge 2', documentNode)));
	});

	describe('le', () => {
		it('returns true if the first operand is less than the second',
			() => chai.assert.isTrue(evaluateXPathToBoolean('1 le 2', documentNode)));

		it('returns true if the first operand is equal to the second',
			() => chai.assert.isTrue(evaluateXPathToBoolean('1 le 1', documentNode)));

		it('returns false if the first operand is greater than the second',
			() => chai.assert.isFalse(evaluateXPathToBoolean('2 le 1', documentNode)));
	});
});

describe('General compares', () => {
	it('Compares over sets',
		() => chai.assert.isTrue(evaluateXPathToBoolean('(1, 2, 3) = 3', documentNode)));
});

describe('Node compares', () => {
	beforeEach(() => {
		documentNode.appendChild(documentNode.createElement('someElement'));
	});
	describe('is', () => {
		it('returns true for the same node',
			() => chai.assert.isTrue(evaluateXPathToBoolean('. is .', documentNode)));
		it('returns false for another node',
			() => chai.assert.isFalse(evaluateXPathToBoolean('. is child::*[1]', documentNode)));
		it('works with variables',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $x := . return . is $x', documentNode)));
		it('returns the empty sequence if either operand is the empty sequence',
			() => chai.assert.equal(evaluateXPathToNumber('count(() is ())', documentNode), 0));
		it('throws an error when passed a non-node',
			() => chai.assert.throws(() => evaluateXPathToBoolean('1 is 1', documentNode), 'XPTY0004'));
		it('throws an error when passed a non-singleton sequence',
			() => chai.assert.throws(() => evaluateXPathToBoolean('. is (., .)', documentNode), 'XPTY0004'));
	});
});

import * as slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToNodes, evaluateXPathToNumber, evaluateXPathToBoolean } from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';
import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('Value compares', () => {
	it('works over singleton sequences', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('true() eq true()'));
	});
	it('works with async parameters', async () => {
		chai.assert.isTrue(await evaluateXPathToAsyncSingleton('true() eq (true() => fontoxpath:sleep())'));
	});
	it('works over empty sequences', () => {
		chai.assert.deepEqual(evaluateXPathToNodes('() eq ()'), []);
	});

	it('works over one empty sequence and a filled one', () => {
		chai.assert.deepEqual(evaluateXPathToNodes('() eq (true())'), []);
	});

	it('does not work over non-singleton sequences: lhs', () => {
		chai.assert.throw(() => evaluateXPathToNodes('(1, 2) eq 1'), 'XPTY0004');
	});

	it('does not work over non-singleton sequences: rhs', () => {
		chai.assert.throw(() => evaluateXPathToNodes('1 eq (1, 2)'), 'XPTY0004');
	});

	it('does not work over non-singleton sequences: boths sides', () => {
		chai.assert.throw(() => evaluateXPathToNodes('(1, 2) eq (1, 2)'), 'XPTY0004');
	});

	it('Does work with typing: decimal to int', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('1 eq 1.0'));
	});

	it('Does work with typing: double to int', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('100 eq 1.0e2'));
	});

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

	it('works with typing: untyped attributes on both sides', () => {
		jsonMlMapper.parse([
			'someNode',
			{
				a: 'value',
				b: 'value'
			}
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('@a eq @b', documentNode.documentElement));
	});

	it('(does not) work with typing: int to string', () => {
		chai.assert.throw(() => evaluateXPathToBoolean('1 eq "1"'), 'XPTY0004');
	});

	it('(does not) work with typing: boolean to string', () => {
		chai.assert.throw(() => evaluateXPathToBoolean('true() eq "true"'), 'XPTY0004');
	});

	describe('eq', () => {
		it('returns true if the first operand is equal to the second', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('1 eq 1'));
		});

		it('+0 eq -0', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('+0 eq -0'));
		});

		it('does QNames', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('fn:QName("a", "a") eq fn:QName("a","a")'));
		});
		it('returns false for unequal qnames: on localPart', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('fn:QName("a", "a") eq fn:QName("a","b")'));
		});
		it('returns false for unequal qnames: on uri', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('fn:QName("a", "a") eq fn:QName("b","a")'));
		});
		it('returns true for absent prefix', () => chai.assert.isTrue(evaluateXPathToBoolean('QName((), "local") eq xs:QName("local")')));
		it('returns true for equal qnames: unequal on prefix', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('fn:QName("a", "a:a") eq fn:QName("a","b:a")'));
		});
		it('returns true for equal qnames: absent prefix', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('QName("", "local") eq xs:QName("local")'));
		});
		it('returns false if the first operand is not equal to the second', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('1 eq 2'));
		});
	});

	describe('ne', () => {
		it('returns true if the first operand is not equal to the second', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('1 ne 2'));
		});

		it('returns false if the first operand is equal to the second', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('1 ne 1'));
		});

		it('returns true for unequal qnames: on localPart', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('fn:QName("a", "a") ne fn:QName("a","b")'));
		});
		it('returns true for unequal qnames: on uri', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('fn:QName("a", "a") ne fn:QName("b","a")'));
		});

	});

	describe('gt', () => {
		it('returns true if the first operand is greater than the second', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('2 gt 1'));
		});

		it('returns false if the first operand is equal to the second', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('1 gt 1'));
		});

		it('returns false if the first operand is less than the second', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('1 gt 2'));
		});

		it('is not implemented for qnames', () => {
			chai.assert.throws(() => evaluateXPathToBoolean('fn:QName("a", "a") gt fn:QName("a","b")'), 'XPTY0004');
		});
	});

	describe('lt', () => {
		it('returns true if the first operand is less than the second', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('1 lt 2'));
		});

		it('returns false if the first operand is equal to the second', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('1 lt 1'));
		});

		it('returns false if the first operand is less than the second', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('2 lt 1'));
		});

		it('is not implemented for qnames', () => {
			chai.assert.throws(() => evaluateXPathToBoolean('fn:QName("a", "a") gt fn:QName("a","b")'), 'XPTY0004');
		});
	});
	describe('ge', () => {
		it('returns true if the first operand is greater than the second', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('2 ge 1'));
		});

		it('returns true if the first operand is equal to the second', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('1 ge 1'));
		});

		it('returns false if the first operand is less than the second', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('1 ge 2'));
		});

		it('is not implemented for qnames', () => {
			chai.assert.throws(() => evaluateXPathToBoolean('fn:QName("a", "a") gt fn:QName("a","b")'), 'XPTY0004');
		});
	});
	describe('le', () => {
		it('returns true if the first operand is less than the second', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('1 le 2'));
		});

		it('returns true if the first operand is equal to the second', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('1 le 1'));
		});

		it('returns false if the first operand is greater than the second', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('2 le 1'));
		});

		it('is not implemented for qnames', () => {
			chai.assert.throws(() => evaluateXPathToBoolean('fn:QName("a", "a") gt fn:QName("a","b")'), 'XPTY0004');
		});
	});
});

describe('General compares', () => {
	it('Compares over sets', () => chai.assert.isTrue(evaluateXPathToBoolean('(1, 2, 3) = 3')));
	it('Compares over sets by comparing each and every value', () => chai.assert.isTrue(evaluateXPathToBoolean('(1, 2, 3) = (5, 4, 3)')));
	it('works with async parameters', async () => {
		chai.assert.isTrue(await evaluateXPathToAsyncSingleton('true() = (true() => fontoxpath:sleep())'));
	});

});

describe('Node compares', () => {
	beforeEach(() => {
		documentNode.appendChild(documentNode.createElement('someElement'));
	});
	describe('is', () => {
		it('returns true for the same node', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('. is .', documentNode));
		});
		it('returns false for another node', () => {
			chai.assert.isFalse(evaluateXPathToBoolean('. is child::*[1]', documentNode));
		});
		it('works with variables', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('let $x := . return . is $x', documentNode));
		});
		it('returns the empty sequence if either operand is the empty sequence', () => {
			chai.assert.equal(evaluateXPathToNumber('count(() is ())', documentNode), 0);
		});
		it('returns the empty sequence if the lhs operand is the empty sequence', () => {
			chai.assert.equal(evaluateXPathToNumber('count(() is .)', documentNode), 0);
		});
		it('returns the empty sequence if the rhs operand is the empty sequence', () => {
			chai.assert.equal(evaluateXPathToNumber('count(. is ())', documentNode), 0);
		});
		it('throws an error when passed a non-node', () => {
			chai.assert.throws(() => evaluateXPathToBoolean('1 is 1', documentNode), 'XPTY0004');
		});
		it('throws an error when passed a non-singleton sequence on the lhs', () => {
			chai.assert.throws(() => evaluateXPathToBoolean('. is (., .)', documentNode), 'XPTY0004');
		});
		it('throws an error when passed a non-singleton sequence on the rhs', () => {
			chai.assert.throws(() => evaluateXPathToBoolean('(., .) is .', documentNode), 'XPTY0004');
		});
		it('works with async parameters',async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('. is (. => fontoxpath:sleep())', documentNode));
		});
	});
});

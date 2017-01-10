import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToNodes, evaluateXPathToNumber, evaluateXPathToBoolean } from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('Value compares', () => {
	it('works over singleton sequences', () => {
		const selector = ('true() eq true()');
		chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(true);
	});

	it('works over empty sequences', () => {
		const selector = ('() eq ()');
		chai.expect(evaluateXPathToNodes(selector, documentNode, domFacade)).to.deep.equal([]);
	});

	it('works over one empty sequence and a filled one', () => {
		const selector = ('() eq (true())');
		chai.expect(evaluateXPathToNodes(selector, documentNode, domFacade)).to.deep.equal([]);
	});

	it('does not work over non-singleton sequences', () => {
		const selector = ('(1, 2) eq true()');
		chai.expect(() => {
			evaluateXPathToNodes(selector, documentNode, domFacade);
		}).to.throw(/XPTY0004/);
	});

	it('Does work with typing: decimal to int', () => {
		const selector = ('1 eq 1.0');
		chai.expect(
			evaluateXPathToBoolean(selector, documentNode, domFacade)
		).to.equal(true);
	});

	it('Does work with typing: double to int', () => {
		const selector = ('100 eq 1.0e2');
		chai.expect(
			evaluateXPathToBoolean(selector, documentNode, domFacade)
		).to.equal(true);
	});

	it('atomizes attributes', () => {
		jsonMlMapper.parse([
			'someNode',
			{
				a: 'value',
				b: 'value'
			}
		], documentNode);
		const selector = ('@a eq "value"');
		chai.expect(
			evaluateXPathToBoolean(selector, documentNode.documentElement, domFacade)
		).to.deep.equal(true);
	});

	it('(does not) work with typing: untyped attributes', () => {
		jsonMlMapper.parse([
			'someNode',
			{
				a: 'value'
			}
		], documentNode);
		const selector = ('@a eq 1');
		chai.expect(() => {
			evaluateXPathToBoolean(selector, documentNode.documentElement, domFacade);
		}).to.throw(/XPTY0004/);
	});

	it('(does not) work with typing: int to string', () => {
		const selector = ('1 eq "1"');
		chai.expect(() => {
			evaluateXPathToBoolean(selector, documentNode, domFacade);
		}).to.throw(/XPTY0004/);
	});

	it('(does not) work with typing: boolean to string', () => {
		const selector = ('true() eq "true"');
		chai.expect(() => {
			evaluateXPathToBoolean(selector, documentNode, domFacade);
		}).to.throw(/XPTY0004/);
	});

	describe('eq', () => {
		it('returns true if the first operand is equal to the second', () => {
			const selector = ('1 eq 1');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(true);
		});

		it('+0 eq -0', () => {
			const selector = ('+0 eq -0');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(true);
		});

		it('returns false if the first operand is not equal to the second', () => {
			const selector = ('1 eq 2');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(false);
		});
	});

	describe('ne', () => {
		it('returns true if the first operand is not equal to the second', () => {
			const selector = ('1 ne 2');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(true);
		});

		it('returns false if the first operand is equal to the second', () => {
			const selector = ('1 ne 1');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(false);
		});
	});

	describe('gt', () => {
		it('returns true if the first operand is greater than the second', () => {
			const selector = ('2 gt 1');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(true);
		});

		it('returns false if the first operand is equal to the second', () => {
			const selector = ('1 gt 1');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(false);
		});

		it('returns false if the first operand is less than the second', () => {
			const selector = ('1 gt 2');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(false);
		});
	});

	describe('lt', () => {
		it('returns true if the first operand is less than the second', () => {
			const selector = ('1 lt 2');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(true);
		});

		it('returns false if the first operand is equal to the second', () => {
			const selector = ('1 lt 1');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(false);
		});

		it('returns false if the first operand is less than the second', () => {
			const selector = ('2 lt 1');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(false);
		});
	});

	describe('ge', () => {
		it('returns true if the first operand is greater than the second', () => {
			const selector = ('2 ge 1');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(true);
		});

		it('returns true if the first operand is equal to the second', () => {
			const selector = ('1 ge 1');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(true);
		});

		it('returns false if the first operand is less than the second', () => {
			const selector = ('1 ge 2');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(false);
		});
	});

	describe('le', () => {
		it('returns true if the first operand is less than the second', () => {
			const selector = ('1 le 2');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(true);
		});

		it('returns true if the first operand is equal to the second', () => {
			const selector = ('1 le 1');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(true);
		});

		it('returns false if the first operand is greater than the second', () => {
			const selector = ('2 le 1');
			chai.expect(evaluateXPathToBoolean(selector, documentNode, domFacade)).to.equal(false);
		});
	});
});

describe('General compares', () => {
	it('Compares over sets', () => {
		const selector = ('(1, 2, 3) = 3');
		chai.expect(
			evaluateXPathToBoolean(selector, documentNode, domFacade)
		).to.equal(true);
	});
});

describe('Node compares', () => {
	beforeEach(() => {
		documentNode.appendChild(documentNode.createElement('someElement'));
	});
	describe('is', () => {
		it('returns true for the same node', () => chai.assert.isTrue(evaluateXPathToBoolean('. is .', documentNode, domFacade)));
		it('returns false for another node', () => chai.assert.isFalse(evaluateXPathToBoolean('. is child::*[1]', documentNode, domFacade)));
		it('works with variables', () => chai.assert.isTrue(evaluateXPathToBoolean('let $x := . return . is $x', documentNode, domFacade)));
		it(
			'returns the empty sequence if either operand is the empty sequence',
			() => chai.assert.equal(evaluateXPathToNumber('count(() is ())', documentNode, domFacade), 0)
		);
		it(
			'throws an error when passed a non-node',
			() => chai.assert.throws(() => evaluateXPathToBoolean('1 is 1', documentNode, domFacade), 'XPTY0004'));
		it(
			'throws an error when passed a non-singleton sequence',
			() => chai.assert.throws(() => evaluateXPathToBoolean('. is (., .)', documentNode, domFacade), 'XPTY0004'));
	});
});

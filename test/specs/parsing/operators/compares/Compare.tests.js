import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('Value compares', () => {
	it('works over singleton sequences', () => {
		const selector = parseSelector('true() eq true()');
		chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
	});

	it('works over empty sequences', () => {
		const selector = parseSelector('() eq ()');
		chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.deep.equal([]);
	});

	it('works over one empty sequence and a filled one', () => {
		const selector = parseSelector('() eq (true())');
		chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.deep.equal([]);
	});

	it('does not work over non-singleton sequences', () => {
		const selector = parseSelector('(1, 2) eq true()');
		chai.expect(() => {
			evaluateXPath(selector, documentNode, blueprint);
		}).to.throw(/XPTY0004/);
	});

	it('Does work with typing: decimal to int', () => {
		const selector = parseSelector('1 eq 1.0');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.equal(true);
	});

	it('Does work with typing: double to int', () => {
		const selector = parseSelector('100 eq 1.0e2');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.equal(true);
	});

	it('atomizes attributes', () => {
		jsonMLMapper.parse([
			'someNode',
			{
				a: 'value',
				b: 'value'
			}
		], documentNode);
		const selector = parseSelector('@a eq "value"');
		chai.expect(
			evaluateXPath(selector, documentNode.documentElement, blueprint)
		).to.deep.equal(true);
	});

	it('(does not) work with typing: untyped attributes', () => {
		jsonMLMapper.parse([
			'someNode',
			{
				a: 'value'
			}
		], documentNode);
		const selector = parseSelector('@a eq 1');
		chai.expect(() => {
			evaluateXPath(selector, documentNode.documentElement, blueprint);
		}).to.throw(/XPTY0004/);
	});

	it('(does not) work with typing: int to string', () => {
		const selector = parseSelector('1 eq "1"');
		chai.expect(() => {
			evaluateXPath(selector, documentNode, blueprint);
		}).to.throw(/XPTY0004/);
	});

	it('(does not) work with typing: boolean to string', () => {
		const selector = parseSelector('true() eq "true"');
		chai.expect(() => {
			evaluateXPath(selector, documentNode, blueprint);
		}).to.throw(/XPTY0004/);
	});

	describe('eq', () => {
		it('returns true if the first operand is equal to the second', () => {
			const selector = parseSelector('1 eq 1');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});

		it('+0 eq -0', () => {
			const selector = parseSelector('+0 eq -0');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});

		it('returns false if the first operand is not equal to the second', () => {
			const selector = parseSelector('1 eq 2');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
	});

	describe('ne', () => {
		it('returns true if the first operand is not equal to the second', () => {
			const selector = parseSelector('1 ne 2');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});

		it('returns false if the first operand is equal to the second', () => {
			const selector = parseSelector('1 ne 1');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
	});

	describe('gt', () => {
		it('returns true if the first operand is greater than the second', () => {
			const selector = parseSelector('2 gt 1');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});

		it('returns false if the first operand is equal to the second', () => {
			const selector = parseSelector('1 gt 1');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});

		it('returns false if the first operand is less than the second', () => {
			const selector = parseSelector('1 gt 2');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
	});

	describe('lt', () => {
		it('returns true if the first operand is less than the second', () => {
			const selector = parseSelector('1 lt 2');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});

		it('returns false if the first operand is equal to the second', () => {
			const selector = parseSelector('1 lt 1');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});

		it('returns false if the first operand is less than the second', () => {
			const selector = parseSelector('2 lt 1');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
	});

	describe('ge', () => {
		it('returns true if the first operand is greater than the second', () => {
			const selector = parseSelector('2 ge 1');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});

		it('returns true if the first operand is equal to the second', () => {
			const selector = parseSelector('1 ge 1');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});

		it('returns false if the first operand is less than the second', () => {
			const selector = parseSelector('1 ge 2');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
	});

	describe('le', () => {
		it('returns true if the first operand is less than the second', () => {
			const selector = parseSelector('1 le 2');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});

		it('returns true if the first operand is equal to the second', () => {
			const selector = parseSelector('1 le 1');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});

		it('returns false if the first operand is greater than the second', () => {
			const selector = parseSelector('2 le 1');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
	});
});

describe('General compares', () => {
	it('Compares over sets', () => {
		const selector = parseSelector('(1, 2, 3) = 3');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.equal(true);
	});
});

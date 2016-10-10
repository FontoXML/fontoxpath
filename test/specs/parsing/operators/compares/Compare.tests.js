define([
	'fontoxml-blueprints/readOnlyBlueprint',
	'fontoxml-dom-utils/jsonMLMapper',
	'slimdom',

	'fontoxml-selectors/parsing/createSelectorFromXPath',
	'fontoxml-selectors/evaluateXPath'
], function (
	blueprint,
	jsonMLMapper,
	slimdom,

	parseSelector,
	evaluateXPath
) {
	'use strict';

	var documentNode;
	beforeEach(function () {
		documentNode = slimdom.createDocument();
	});

	describe('Value compares', function () {
		it('works over singleton sequences', function () {
			var selector = parseSelector('true() eq true()');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});

		it('works over empty sequences', function () {
			var selector = parseSelector('() eq ()');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.deep.equal([]);
		});

		it('works over one empty sequence and a filled one', function () {
			var selector = parseSelector('() eq (true())');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.deep.equal([]);
		});

		it('does not work over non-singleton sequences', function () {
			var selector = parseSelector('(1, 2) eq true()');
			chai.expect(function () {
				evaluateXPath(selector, documentNode, blueprint);
			}).to.throw(/XPTY0004/);
		});

		it('Does work with typing: decimal to int', function () {
			var selector = parseSelector('1 eq 1.0');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(true);
		});

		it('Does work with typing: double to int', function () {
			var selector = parseSelector('100 eq 1.0e2');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(true);
		});

		it('atomizes attributes', function () {
			jsonMLMapper.parse([
				'someNode',
				{
					a: 'value',
					b: 'value'
				}
			], documentNode);
			var selector = parseSelector('@a eq "value"');
			chai.expect(
				evaluateXPath(selector, documentNode.documentElement, blueprint)
			).to.deep.equal(true);
		});

		it('(does not) work with typing: untyped attributes', function () {
			jsonMLMapper.parse([
				'someNode',
				{
					a: 'value'
				}
			], documentNode);
			var selector = parseSelector('@a eq 1');
			chai.expect(function () {
				evaluateXPath(selector, documentNode.documentElement, blueprint);
			}).to.throw(/XPTY0004/);
		});

		it('(does not) work with typing: int to string', function () {
			var selector = parseSelector('1 eq "1"');
			chai.expect(function () {
				evaluateXPath(selector, documentNode, blueprint);
			}).to.throw(/XPTY0004/);
		});

		it('(does not) work with typing: boolean to string', function () {
			var selector = parseSelector('true() eq "true"');
			chai.expect(function () {
				evaluateXPath(selector, documentNode, blueprint);
			}).to.throw(/XPTY0004/);
		});

		describe('eq', function () {
			it('returns true if the first operand is equal to the second', function () {
				var selector = parseSelector('1 eq 1');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});

			it('+0 eq -0', function () {
				var selector = parseSelector('+0 eq -0');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});

			it('returns false if the first operand is not equal to the second', function () {
				var selector = parseSelector('1 eq 2');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
			});
		});

		describe('ne', function () {
			it('returns true if the first operand is not equal to the second', function () {
				var selector = parseSelector('1 ne 2');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});

			it('returns false if the first operand is equal to the second', function () {
				var selector = parseSelector('1 ne 1');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
			});
		});

		describe('gt', function () {
			it('returns true if the first operand is greater than the second', function () {
				var selector = parseSelector('2 gt 1');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});

			it('returns false if the first operand is equal to the second', function () {
				var selector = parseSelector('1 gt 1');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
			});

			it('returns false if the first operand is less than the second', function () {
				var selector = parseSelector('1 gt 2');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
			});
		});

		describe('lt', function () {
			it('returns true if the first operand is less than the second', function () {
				var selector = parseSelector('1 lt 2');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});

			it('returns false if the first operand is equal to the second', function () {
				var selector = parseSelector('1 lt 1');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
			});

			it('returns false if the first operand is less than the second', function () {
				var selector = parseSelector('2 lt 1');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
			});
		});

		describe('ge', function () {
			it('returns true if the first operand is greater than the second', function () {
				var selector = parseSelector('2 ge 1');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});

			it('returns true if the first operand is equal to the second', function () {
				var selector = parseSelector('1 ge 1');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});

			it('returns false if the first operand is less than the second', function () {
				var selector = parseSelector('1 ge 2');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
			});
		});

		describe('le', function () {
			it('returns true if the first operand is less than the second', function () {
				var selector = parseSelector('1 le 2');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});

			it('returns true if the first operand is equal to the second', function () {
				var selector = parseSelector('1 le 1');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});

			it('returns false if the first operand is greater than the second', function () {
				var selector = parseSelector('2 le 1');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
			});
		});
	});

	describe('General compares', function () {
		it('Compares over sets', function () {
			var selector = parseSelector('(1, 2, 3) = 3');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(true);
		});
	});
});

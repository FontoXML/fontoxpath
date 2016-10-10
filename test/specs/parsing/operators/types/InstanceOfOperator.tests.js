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

	describe('instance of operator', function () {
		it('returns true for a valid instance of xs:boolean', function () {
			var selector = parseSelector('true() instance of xs:boolean');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});

		it('returns true for a valid instance of xs:boolean?', function () {
			var selector1 = parseSelector('() instance of xs:boolean?'),
				selector2 = parseSelector('true() instance of xs:boolean?');
			chai.expect(evaluateXPath(selector1, documentNode, blueprint)).to.equal(true);
			chai.expect(evaluateXPath(selector2, documentNode, blueprint)).to.equal(true);
		});

		it('returns true for a valid instance of xs:boolean+', function () {
			var selector1 = parseSelector('true() instance of xs:boolean+'),
				selector2 = parseSelector('(true(), false()) instance of xs:boolean+');
			chai.expect(evaluateXPath(selector1, documentNode, blueprint)).to.equal(true);
			chai.expect(evaluateXPath(selector2, documentNode, blueprint)).to.equal(true);
		});

		it('returns true for a valid instance of xs:boolean*', function () {
			var selector1 = parseSelector('() instance of xs:boolean*'),
				selector2 = parseSelector('true() instance of xs:boolean*'),
				selector3 = parseSelector('(true(), false()) instance of xs:boolean*');
			chai.expect(evaluateXPath(selector1, documentNode, blueprint)).to.equal(true);
			chai.expect(evaluateXPath(selector2, documentNode, blueprint)).to.equal(true);
			chai.expect(evaluateXPath(selector3, documentNode, blueprint)).to.equal(true);
		});

		it('returns false for an invalid instance of xs:boolean', function () {
			var selector = parseSelector('() instance of xs:boolean');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});

		it('returns false for an invalid instance of xs:boolean?', function () {
			var selector = parseSelector('(true(), false()) instance of xs:boolean?');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});

		it('returns false for an invalid instance of xs:boolean+', function () {
			var selector = parseSelector('() instance of xs:boolean+');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
	});
});

define([
	'fontoxml-blueprints/readOnlyBlueprint',
	'slimdom',

	'fontoxml-selectors/parsing/createSelectorFromXPath',
	'fontoxml-selectors/evaluateXPath'
], function (
	blueprint,
	slimdom,

	parseSelector,
	evaluateXPath
) {
	'use strict';

	var documentNode;
	beforeEach(function () {
		documentNode = slimdom.createDocument();
	});

	describe('and operator', function () {
		it('can parse an "and" selector', function () {
			var selector = parseSelector('true() and true()');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});

		it('can parse a concatenation of ands', function () {
			var selector = parseSelector('true() and true() and true() and false()');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
	});
});

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

	describe('not', function () {
		it('can parse an "not" selector', function () {
			var selector = parseSelector('not(true())');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
	});
});

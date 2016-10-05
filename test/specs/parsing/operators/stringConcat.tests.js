define([
	'fontoxml-blueprints/readOnlyBlueprint',
	'fontoxml-dom-utils/jsonMLMapper',
	'slimdom',

	'fontoxml-selectors/parsing/createSelectorFromXPath',
	'fontoxml-selectors/addXPathCustomTest',
	'fontoxml-selectors/evaluateXPath'
], function (
	blueprint,
	jsonMLMapper,
	slimdom,

	parseSelector,
	addXPathCustomTest,
	evaluateXPath
) {
	'use strict';

	var documentNode;
	beforeEach(function () {
		documentNode = slimdom.createDocument();
	});

	describe('stringConcat', function () {
		it('can concatenate strings', function () {
			var selector = parseSelector('"con" || "cat" || "enate"');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal('concatenate');
		});

		it('can concatenate empty sequences', function () {
			var selector = parseSelector('() || "con" || () || "cat" || () || "enate" || ()');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal('concatenate');
		});
	});
});

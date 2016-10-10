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

	describe('comments', function () {
		it('can parse comments', function () {
			var selector = parseSelector('true() (: and false() :) or true()');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal(true);
		});

		it('can parse nested comments', function () {
			var selector = parseSelector('true() (: and false() (:and true():) :) or false');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal(true);
		});
	});
});

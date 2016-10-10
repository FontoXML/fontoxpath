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

	describe('self', function () {
		it('parses self::', function () {
			var selector = parseSelector('self::someElement'),
				element = documentNode.createElement('someElement');
			chai.expect(
				evaluateXPath(selector, element, blueprint))
			.to.deep.equal(element);
		});
	});
});

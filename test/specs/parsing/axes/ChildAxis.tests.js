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

	describe('child', function () {
		it('parses child::', function () {
			var selector = parseSelector('child::someElement');
			jsonMLMapper.parse([
				'someParentElement',
				['someElement']
			], documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE))
			.to.deep.equal([documentNode.documentElement.firstChild]);
		});

		it('is added implicitly', function () {
			var selector = parseSelector('someElement');
			jsonMLMapper.parse([
				'someParentElement',
				['someElement']
			], documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE))
			.to.deep.equal([documentNode.documentElement.firstChild]);
		});
	});
});

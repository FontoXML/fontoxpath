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

	describe('preceding-sibling', function () {
		it('parses preceding-sibling::', function () {
			var selector = parseSelector('preceding-sibling::someSiblingElement');
			jsonMLMapper.parse([
				'someParentElement',
				['someSiblingElement'],
				['someElement']
			], documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode.documentElement.lastChild, blueprint, {}, evaluateXPath.NODES_TYPE))
			.to.deep.equal([documentNode.documentElement.firstChild]);
		});
	});
});

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

	describe('following-sibling', function () {
		it('parses following-sibling::', function () {
			var selector = parseSelector('following-sibling::someSiblingElement');
			jsonMLMapper.parse([
				'someParentElement',
				['someElement'],
				['someSiblingElement']
			], documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint, {}, evaluateXPath.NODES_TYPE))
			.to.deep.equal([documentNode.documentElement.lastChild]);
		});
	});
});

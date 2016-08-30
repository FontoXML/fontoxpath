define([
	'fontoxml-blueprints',
	'fontoxml-dom-utils/jsonMLMapper',
	'slimdom',

	'fontoxml-selectors/parsing/createSelectorFromXPath',
	'fontoxml-selectors/addXPathCustomTest',
	'fontoxml-selectors/evaluateXPath'
], function (
	blueprints,
	jsonMLMapper,
	slimdom,

	parseSelector,
	addXPathCustomTest,
	evaluateXPath
) {
	'use strict';

	var blueprint = new blueprints.ReadOnlyBlueprint();

	describe('createSelectorFromXPath', function () {
		var documentNode;
		beforeEach(function () {
			documentNode = slimdom.createDocument();
		});

		it('matches hovercrafts full of eels', function () {
			jsonMLMapper.parse([
				'hovercraft',
				['eel'],
				['eel']
			], documentNode);
			chai.expect(evaluateXPath('self::hovercraft[eel and not(*[not(self::eel)])]', documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement]);
		});
	});
});

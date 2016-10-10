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

	describe('descendant', function () {
		it('parses descendant::', function () {
			var selector = parseSelector('descendant::someElement');
			jsonMLMapper.parse([
				'someParentElement',
				['someElement']
			], documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE))
			.to.deep.equal([documentNode.firstChild.firstChild]);
		});
	});

	describe('descendant-or-self', function () {
		it('descendant part', function () {
			var selector = parseSelector('descendant-or-self::someElement');
			jsonMLMapper.parse([
				'someParentElement',
				['someElement']
			], documentNode);
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild]);
		});
		it('self part', function () {
			var selector = parseSelector('descendant-or-self::someParentElement');
			jsonMLMapper.parse([
				'someParentElement',
				['someElement']
			], documentNode);
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement]);
		});
		it('ordering', function () {
			var selector = parseSelector('descendant-or-self::*');
			jsonMLMapper.parse([
				'someParentElement',
				['someElement']
			], documentNode);
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement, documentNode.documentElement.firstChild]);
		});
	});
});

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

	describe('absolute paths', function () {
		it('supports absolute paths', function () {
			jsonMLMapper.parse([
				'someNode'
			], documentNode);
			var selector = parseSelector('/someNode');
			chai.expect(evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement]);
		});

		it('supports chaining from absolute paths', function () {
			jsonMLMapper.parse([
				'someNode',
				['someChildNode']
			], documentNode);
			var selector = parseSelector('/someNode/someChildNode');
			chai.expect(evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild]);
		});

		it('allows // as root', function () {
			jsonMLMapper.parse([
				'someNode',
				['someChildNode']
			], documentNode);
			var selector = parseSelector('//someChildNode');
			chai.expect(evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild]);
		});

		it('targets descendants with //', function () {
			jsonMLMapper.parse([
				'someNode',
				['someChildNode', ['someDescendantNode']]
			], documentNode);
			var selector = parseSelector('//someDescendantNode');
			chai.expect(evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild.firstChild]);
		});
	});
});

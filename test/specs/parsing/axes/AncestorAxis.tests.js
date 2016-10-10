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

	describe('ancestor', function () {
		it('parses ancestor::', function () {
			var selector = parseSelector('ancestor::someParentElement');
			jsonMLMapper.parse([
				'someParentElement',
				['someElement', { 'someAttribute': 'someValue' }]
			], documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint, {}, evaluateXPath.NODES_TYPE))
			.to.deep.equal([documentNode.documentElement]);
		});
	});

	describe('ancestor-or-self', function () {
		it('parses ancestor-or-self:: ancestor part', function () {
			var selector = parseSelector('ancestor-or-self::someParentElement');
			jsonMLMapper.parse([
				'someParentElement',
				['someElement', { 'someAttribute': 'someValue' }]
			], documentNode);
			chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement]);
		});
		it('parses ancestor-or-self:: self part', function () {
			var selector = parseSelector('ancestor-or-self::someParentElement');
			jsonMLMapper.parse([
				'someParentElement',
				['someElement', { 'someAttribute': 'someValue' }]
			], documentNode);
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement]);
		});
		it('orders self before all ancestors', function () {
			var selector = parseSelector('ancestor-or-self::*');
			jsonMLMapper.parse([
				'someParentElement',
				['someElement']
			], documentNode);
			chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild, documentNode.documentElement]);
		});
	});
});

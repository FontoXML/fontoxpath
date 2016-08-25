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
	describe('relative paths', function () {
		it('supports relative paths', function () {
			jsonMLMapper.parse([
				'someNode',
				['someChildNode']
			], documentNode);
			var selector = parseSelector('someChildNode');
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.deep.equal([documentNode.documentElement.firstChild]);
		});


		it('supports addressing the parent axis with ..', function () {
			jsonMLMapper.parse([
				'someNode',
				[
					'someChildNode',
					['someGrandChild']
				]
			], documentNode);
			var selector = parseSelector('../child::someNode');
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.deep.equal([
				documentNode.documentElement
			]);
		});

		it('supports walking from attribute nodes', function () {
			jsonMLMapper.parse([
				'someNode',
				{ someAttribute: 'someValue' },
				['someChildNode']
			], documentNode);
			var selector = parseSelector('@someAttribute/..');
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.deep.equal([documentNode.documentElement]);
		});

		it('supports addressing the contextNode with .', function () {
			jsonMLMapper.parse([
				'someNode',
				[
					'someChildNode',
					['someGrandChild']
				]
			], documentNode);
			var selector = parseSelector('.//*');
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.deep.equal([
				documentNode.documentElement.firstChild,
				documentNode.documentElement.firstChild.firstChild
			]);
		});
	});
});

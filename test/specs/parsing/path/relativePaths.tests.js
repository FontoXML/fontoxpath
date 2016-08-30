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
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild]);
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
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([
				documentNode.documentElement
			]);
		});

		it('returns its results sorted on document order', function () {
			jsonMLMapper.parse([
				'someNode',
				[
					'firstNode'
				],
				[
					'secondNode'
				]
			], documentNode);
			var selector = parseSelector('(//secondNode, //firstNode)/self::node()');
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([
				documentNode.documentElement.firstChild,
				documentNode.documentElement.lastChild
			]);
		});

		it('supports postfix expressions as sequences', function () {
			jsonMLMapper.parse([
				'someNode',
				[
					'firstNode'
				],
				[
					'secondNode'
				]
			], documentNode);
			var selector = parseSelector('/someNode/(secondNode, firstNode)/self::node()');
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([
				documentNode.documentElement.firstChild,
				documentNode.documentElement.lastChild
			]);
		});

		it('supports walking from attribute nodes', function () {
			jsonMLMapper.parse([
				'someNode',
				{ someAttribute: 'someValue' },
				['someChildNode']
			], documentNode);
			var selector = parseSelector('@someAttribute/..');
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement]);
		});

		it('allows returning other things then nodes at the last step of the path', function () {
			chai.expect(evaluateXPath('./42', documentNode, blueprint, {}, evaluateXPath.NUMBER_TYPE)).to.equal(42);
		});

		it('sorts attribute nodes after their element', function () {
			jsonMLMapper.parse([
				'someNode',
				{ someAttribute: 'someValue' },
				['someChildNode']
			], documentNode);
			var selector = parseSelector('((@someAttribute, /someNode, //someChildNode)/.)[1]');
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement]);
			selector = parseSelector('((@someAttribute, /someNode, //someChildNode)/.)[2]');
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.STRING_TYPE)).to.deep.equal('someValue');
			selector = parseSelector('((@someAttribute, /someNode, //someChildNode)/.)[3]');
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild]);
		});

		it('sorts attribute nodes alphabetically', function () {
			jsonMLMapper.parse([
				'someNode',
				{ AsomeAttribute: 'someValue', BsomeOtherAttribute: 'someOtherValue' },
				['someChildNode']
			], documentNode);
			// We need to convert to string becase string-join expects strings and function conversion is not in yet
			var selector = parseSelector('(@BsomeOtherAttribute, @AsomeAttribute)/string() => string-join(", ")');
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.STRING_TYPE)).to.deep.equal('someValue, someOtherValue');
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
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([
				documentNode.documentElement.firstChild,
				documentNode.documentElement.firstChild.firstChild
			]);
		});
	});
});

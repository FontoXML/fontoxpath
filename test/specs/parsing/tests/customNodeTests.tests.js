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

	describe('(deprecated) test functions', function () {
		// Deprecated, not a proper XPath
		it('allows true and false in a test', function () {
			var selector = parseSelector('self::false() or self::true()');
			chai.expect(selector.matches(documentNode, blueprint)).to.equal(true);
		});
	});

	describe('(deprecated) custom nodeTest (fonto:.*())', function () {
		it('allows custom nodeTests', function () {
			addXPathCustomTest(
				'fonto:nodenameContains',
				function (includeString, node, blueprint) {
					return node.nodeName.includes(includeString);
				});
			var selector = parseSelector(
					'descendant-or-self::fonto:nodenameContains("Child")');
			jsonMLMapper.parse([
				'someOtherParentElement',
				['someChildElement']
			], documentNode);
			chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
		});

		it('allows predicates in conjunction with custom tests', function () {
			addXPathCustomTest(
				'fonto:nodenameContains',
				function (includeString, node, blueprint) {
					return node.nodeName.includes(includeString);
				});
			var selector = parseSelector(
					'self::fonto:nodenameContains("someNode")[self::false()]');
			jsonMLMapper.parse([
				'someNode'
			], documentNode);
			chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(false, 'The false() predicate should prevent the first part from matching');
		});


		it('allows custom nodeTests with 0 arguments', function () {
			addXPathCustomTest(
				'fonto:true',
				function (node, blueprint) {
					chai.expect(arguments.length).to.equal(2);
					return true;
				});
			var selector = parseSelector(
					'descendant-or-self::fonto:true()');
			jsonMLMapper.parse([
				'someOtherParentElement',
				['someChildElement']
			], documentNode);
			chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
		});

		it('allows custom nodeTests with multiple arguments', function () {
			addXPathCustomTest(
				'fonto:nameWithinRange',
				function (lower, upper, node, blueprint) {
					chai.expect(lower).to.equal('a');
					chai.expect(upper).to.equal('c');
					return lower < node.nodeName &&
						node.nodeName < upper;
				});
			var selector = parseSelector(
					'descendant-or-self::fonto:nameWithinRange("a", "c")');
			jsonMLMapper.parse([
				'someOtherParentElement',
				['b']
			], documentNode);
			chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
		});

		it('still allows deprecated syntax of custom nodeTests', function () {
			addXPathCustomTest(
				'fonto-nodenameContains',
				function (includeString, node, blueprint) {
					return node.nodeName.includes(includeString);
				});
			var selector = parseSelector(
					'descendant-or-self::fonto-nodenameContains("Child")');
			jsonMLMapper.parse([
				'someOtherParentElement',
				['someChildElement']
			], documentNode);
			chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
		});

		it('still allows deprecated syntax of custom nodeTests', function () {
			addXPathCustomTest(
				'fonto-nodenameContains',
				function (includeString, node, blueprint) {
					return node.nodeName.includes(includeString);
				});
			var selector = parseSelector(
					'descendant-or-self::fonto:nodenameContains("Child")');
			jsonMLMapper.parse([
				'someOtherParentElement',
				['someChildElement']
			], documentNode);
			chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
		});
	});
});

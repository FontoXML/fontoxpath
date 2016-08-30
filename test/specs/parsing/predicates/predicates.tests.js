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

	describe('predicates', function () {
		it('can parse a simple nodeName + attribute selector', function () {
			var selector = parseSelector('self::someElement[@someAttribute=\'someValue\']');
			var element = documentNode.createElement('someElement');
			chai.expect(evaluateXPath(selector, element, blueprint)).to.deep.equal([]);
			element.setAttribute('someAttribute', 'someValue');
			chai.expect(evaluateXPath(selector, element, blueprint)).to.deep.equal(element);
		});

		it('uses correct contexts in predicates', function () {
			var selector = parseSelector('parent::someParentElement[parent::someGrandParentElement]');
			jsonMLMapper.parse([
				'someGrandParentElement',
				[
					'someParentElement',
					['someChildelement']
				]
			], documentNode);
			chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild.firstChild, blueprint)).to.deep.equal(documentNode.documentElement.firstChild);
		});

		it('can parse a simple any element + attribute selector', function () {
			var selector = parseSelector('self::*[@someAttribute=\'someValue\']');
			var element = documentNode.createElement('someElement');
			element.setAttribute('someAttribute', 'someValue');
			chai.expect(evaluateXPath(selector, element, blueprint)).to.deep.equal(element);
			var comment = documentNode.createComment('someComment');
			chai.expect(evaluateXPath(selector, comment, blueprint)).to.deep.equal([]);
		});

		it('can parse nested predicates', function () {
			var selector = parseSelector('descendant-or-self::node()[self::*[@someAttribute="someValue"]]');
			jsonMLMapper.parse([
				'someParentElement',
				['someChildElement']
			], documentNode);
			chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint)).to.deep.equal([]);
		});

		it('can parse multiple chained predicates', function () {
			var selector = parseSelector('self::node()[self::*][child::someChildElement]');
			jsonMLMapper.parse([
				'someParentElement',
				['someChildElement']
			], documentNode);
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.deep.equal(documentNode.documentElement);
		});

		it('can parse multiple chained predicates, resulting in a false', function () {
			var selector = parseSelector('self::node()[self::*][child::someChildElement][self::false()]');
			jsonMLMapper.parse([
				'someParentElement',
				['someChildElement']
			], documentNode);
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.deep.equal([]);
		});

		it('allows not', function () {
			var selector = parseSelector('not(someChild)');
			jsonMLMapper.parse([
				'someOtherParentElement',
				['someChildElement']
			], documentNode);
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.deep.equal(true);
		});

		it('can target the root element', function () {
			var selector = parseSelector('parent::node() and not(parent::*)');
			jsonMLMapper.parse([
				'someOtherParentElement',
				['someChildElement']
			], documentNode);
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.deep.equal(true);
		});

		it('works over atomic sequences', function () {
			chai.assert(evaluateXPath('count((1,2,3)[. > 2]) = 1', documentNode, blueprint));
		});
	});

	describe('filters', function () {
		it('works with boolean values: all', function () {
			var selector = parseSelector('(1,2,3)[true()]');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([1,2,3]);
		});
		it('works with boolean values: none', function () {
			var selector = parseSelector('(1,2,3)[false()]');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([]);
		});
		it('works with integer values', function () {
			var selector = parseSelector('(1,2,3)[2]');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal(2);
		});
		it('works with decimal values', function () {
			var selector = parseSelector('(1,2,3)[.5]');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([]);
		});
		it('is passed the context item', function () {
			var selector = parseSelector('(1 to 3)[.!=2]');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([1,3]);
		});
	});

});

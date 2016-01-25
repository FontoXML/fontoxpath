define([
	'fontoxml-blueprints',
	'fontoxml-dom-utils/jsonMLMapper',
	'slimdom',

	'fontoxml-selectors/parsing/createSelectorFromXPath',
	'fontoxml-selectors/addXPathCustomTest'
], function (
	blueprints,
	jsonMLMapper,
	slimdom,

	parseSelector,
	addXPathCustomTest
) {
	'use strict';

	var blueprint = new blueprints.ReadOnlyBlueprint();

	describe('createSelectorFromXPath', function () {
		var documentNode;
		beforeEach(function () {
			documentNode = slimdom.createDocument();
		});

		describe('axes', function () {
			describe('self', function () {
				it('parses self::', function () {
					var selector = parseSelector('self::someElement');
					var element = documentNode.createElement('someElement');
					chai.expect(selector.matches(element, blueprint)).to.equal(true);
				});
			});

			describe('attribute', function () {
				it('parses attribute existence', function () {
					var selector = parseSelector('attribute::someAttribute');
					var element = documentNode.createElement('someElement');
					element.setAttribute('someAttribute', 'someValue');
					chai.expect(selector.matches(element, blueprint)).to.equal(true);
				});
				it('parses the shorthand for existence', function () {
					var selector = parseSelector('@someAttribute');
					var element = documentNode.createElement('someElement');
					element.setAttribute('someAttribute', 'someValue');
					chai.expect(selector.matches(element, blueprint)).to.equal(true);
				});
				it('parses the shorthand for value', function () {
					var selector = parseSelector('@someAttribute=\'someValue\'');
					var element = documentNode.createElement('someElement');
					element.setAttribute('someAttribute', 'someValue');
					chai.expect(selector.matches(element, blueprint)).to.equal(true);
				});
			});

			describe('descendant', function () {
				it('parses descendant::', function () {
					var selector = parseSelector('descendant::someElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement']
					], documentNode);
					chai.expect(selector.matches(documentNode, blueprint)).to.equal(true);
				});
			});

			describe('parent', function () {
				it('parses parent::', function () {
					var selector = parseSelector('parent::someParentElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement', { 'someAttribute': 'someValue' }]
					], documentNode);
					chai.expect(selector.matches(documentNode.firstChild.firstChild, blueprint)).to.equal(true);
				});
			});

			describe('descendant-or-self', function () {
				it('descendant part', function () {
					var selector = parseSelector('descendant-or-self::someElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement']
					], documentNode);
					chai.expect(selector.matches(documentNode.firstChild, blueprint)).to.equal(true);
				});
				it('self part', function () {
					var selector = parseSelector('descendant-or-self::someParentElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement']
					], documentNode);
					chai.expect(selector.matches(documentNode.firstChild, blueprint)).to.equal(true);
				});
			});

			describe('ancestor', function () {
				it('parses ancestor::', function () {
					var selector = parseSelector('ancestor::someParentElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement', { 'someAttribute': 'someValue' }]
					], documentNode);
					chai.expect(selector.matches(documentNode.firstChild.firstChild, blueprint)).to.equal(true);
				});
			});

			describe('ancestor-or-self', function () {
				it('parses ancestor-or-self:: ancestor part', function () {
					var selector = parseSelector('ancestor-or-self::someParentElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement', { 'someAttribute': 'someValue' }]
					], documentNode);
					chai.expect(selector.matches(documentNode.firstChild.firstChild, blueprint)).to.equal(true);
				});
				it('parses ancestor-or-self:: self part', function () {
					var selector = parseSelector('ancestor-or-self::someParentElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement', { 'someAttribute': 'someValue' }]
					], documentNode);
					chai.expect(selector.matches(documentNode.firstChild, blueprint)).to.equal(true);
				});
			});
			describe('child', function () {
				it('parses child::', function () {
					var selector = parseSelector('child::someElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement']
					], documentNode);
					chai.expect(selector.matches(documentNode.firstChild, blueprint)).to.equal(true);
				});
				it('is added implicitly', function () {
					var selector = parseSelector('someElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement']
					], documentNode);
					chai.expect(selector.matches(documentNode.firstChild, blueprint)).to.equal(true);
				});
			});
		});

		describe('operators', function () {
			it('can parse an "and" selector', function () {
				var selector = parseSelector('child::someElement and ancestor::someParentElement');
				jsonMLMapper.parse([
					'someParentElement',
					[
						'someMiddleElement',
						['someElement', { 'someAttribute': 'someValue' }]
					]
				], documentNode);
				chai.expect(selector.matches(documentNode.firstChild.firstChild, blueprint)).to.equal(true);
			});

			it('can parse a double "and" selector', function () {
				var selector = parseSelector('child::someElement and ancestor::someParentElement and @someAttribute=\'someValue\'');
				jsonMLMapper.parse([
					'someParentElement',
					[
						'someMiddleElement',
						{ 'someAttribute': 'someValue' },
						['someElement']
					]
				], documentNode);
				chai.expect(selector.matches(documentNode.firstChild.firstChild, blueprint)).to.equal(true);
			});

			it('allows not in combination with and', function () {
				var selector = parseSelector('someChildElement and not(someOtherChild)');
				jsonMLMapper.parse([
					'someOtherParentElement',
					['someChildElement']
				], documentNode);
				chai.expect(selector.matches(documentNode.firstChild, blueprint)).to.equal(true);
			});
		});

		it('allows shorthand for parent (..)', function () {
			var selector = parseSelector('..');
			jsonMLMapper.parse([
				'someParentElement',
				['someChildElement']
			], documentNode);
			chai.expect(selector.matches(documentNode.firstChild.firstChild, blueprint)).to.equal(true, 'someMiddleElement has a parent');
		});

		describe('predicates', function () {
			it('can parse a simple nodeName + attribute selector', function () {
				var selector = parseSelector('self::someElement[@someAttribute=\'someValue\']');
				var element = documentNode.createElement('someElement');
				element.setAttribute('someAttribute', 'someValue');
				chai.expect(selector.matches(element, blueprint)).to.equal(true);
			});

			it('can parse nested predicates', function () {
				var selector = parseSelector('descendant-or-self::node()[self::*[@someAttribute="someValue"]]');
				jsonMLMapper.parse([
					'someParentElement',
					['someChildElement']
				], documentNode);
				chai.expect(selector.matches(documentNode.firstChild.firstChild, blueprint)).to.equal(true);
			});

			it('allows not', function () {
				var selector = parseSelector('not(someChild)');
				jsonMLMapper.parse([
					'someOtherParentElement',
					['someChildElement']
				], documentNode);
				chai.expect(selector.matches(documentNode.firstChild, blueprint)).to.equal(true);
			});

			it('can target the root element', function () {
				var selector = parseSelector('parent::node() and not(parent::*)');
				jsonMLMapper.parse([
					'someOtherParentElement',
					['someChildElement']
				], documentNode);
				chai.expect(selector.matches(documentNode.firstChild, blueprint)).to.equal(true);
			});
		});

		it('allows processing instruction targets', function () {
			var selector = parseSelector('self::processing-instruction("someTarget")');
			jsonMLMapper.parse([
				'someOtherParentElement',
				['?someTarget', 'someData']
			], documentNode);
			chai.expect(selector.matches(documentNode.firstChild.firstChild, blueprint)).to.equal(true);
		});

		describe('custom nodeTest (fonto-.*())', function () {
			it('allows custom nodeTests', function () {
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
				chai.expect(selector.matches(documentNode.firstChild, blueprint)).to.equal(true);
			});

			it('allows custom nodeTests with 0 arguments', function () {
				addXPathCustomTest(
					'fonto-true',
					function (node, blueprint) {
						chai.expect(arguments.length).to.equal(2);
						return true;
					});
				var selector = parseSelector(
						'descendant-or-self::fonto-true()');
				jsonMLMapper.parse([
					'someOtherParentElement',
					['someChildElement']
				], documentNode);
				chai.expect(selector.matches(documentNode.firstChild, blueprint)).to.equal(true);
			});

			it('allows custom nodeTests with multiple arguments', function () {
				addXPathCustomTest(
					'fonto-nameWithinRange',
					function (lower, upper, node, blueprint) {
						return lower < node.nodeName &&
							node.nodeName < upper;
					});
				var selector = parseSelector(
						'descendant-or-self::fonto-nameWithinRange("a", "c")');
				jsonMLMapper.parse([
					'someOtherParentElement',
					['b']
				], documentNode);
				chai.expect(selector.matches(documentNode.firstChild, blueprint)).to.equal(true);
			});
		});
	});
});

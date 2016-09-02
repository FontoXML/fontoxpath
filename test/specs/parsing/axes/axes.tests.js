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

	describe('axes', function () {
		describe('self', function () {
			it('parses self::', function () {
				var selector = parseSelector('self::someElement');
				var element = documentNode.createElement('someElement');
				chai.expect(evaluateXPath(selector, element, blueprint)).to.deep.equal(element);
			});
		});

		describe('attribute', function () {
			it('parses attribute existence', function () {
				var selector = parseSelector('attribute::someAttribute');
				var element = documentNode.createElement('someElement');
				element.setAttribute('someAttribute', 'someValue');
				chai.expect(evaluateXPath(selector, element, blueprint)).to.deep.equal('someValue');
			});
			it('returns no attributes for documents', function () {
				var selector = parseSelector('attribute::someAttribute');
				chai.expect(evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.STRING_TYPE)).to.deep.equal('');
			});

			it('resolves to false if attribute is absent', function () {
				var selector = parseSelector('@someAttribute');
				var element = documentNode.createElement('someElement');
				chai.expect(evaluateXPath(selector, element, blueprint)).to.deep.equal([]);
			});
			it('allows namespaces', function () {
				var selector = parseSelector('attribute::someNamespace:someAttribute');
				var element = documentNode.createElement('someElement');
				element.setAttribute('someNamespace:someAttribute', 'someValue');
				chai.expect(evaluateXPath(selector, element, blueprint)).to.deep.equal('someValue');
			});
			it('parses the shorthand for existence', function () {
				var selector = parseSelector('@someAttribute');
				var element = documentNode.createElement('someElement');
				element.setAttribute('someAttribute', 'someValue');
				chai.expect(evaluateXPath(selector, element, blueprint)).to.deep.equal('someValue');
			});
			it('parses the shorthand for value', function () {
				var selector = parseSelector('@someAttribute=\'someValue\'');
				var element = documentNode.createElement('someElement');
				element.setAttribute('someAttribute', 'someValue');
				chai.expect(evaluateXPath(selector, element, blueprint)).to.deep.equal(true);
			});
			it('allows namespaces in the shorthand', function () {
				var selector = parseSelector('@someNamespace:someAttribute="someValue"');
				var element = documentNode.createElement('someElement');
				element.setAttribute('someNamespace:someAttribute', 'someValue');
				chai.expect(evaluateXPath(selector, element, blueprint)).to.deep.equal(true);
			});
		});

		describe('descendant', function () {
			it('parses descendant::', function () {
				var selector = parseSelector('descendant::someElement');
				jsonMLMapper.parse([
					'someParentElement',
					['someElement']
				], documentNode);
				chai.expect(evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.firstChild.firstChild]);
			});
		});

		describe('parent', function () {
			it('parses parent::', function () {
				var selector = parseSelector('parent::someParentElement');
				jsonMLMapper.parse([
					'someParentElement',
					['someElement', { 'someAttribute': 'someValue' }]
				], documentNode);
				chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement]);
			});
		});

		describe('following-sibling', function () {
			it('parses following-sibling::', function () {
				var selector = parseSelector('following-sibling::someSiblingElement');
				jsonMLMapper.parse([
					'someParentElement',
					['someElement'],
					['someSiblingElement']
				], documentNode);
				chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.lastChild]);
			});
		});

		describe('preceding-sibling', function () {
			it('parses preceding-sibling::', function () {
				var selector = parseSelector('preceding-sibling::someSiblingElement');
				jsonMLMapper.parse([
					'someParentElement',
					['someSiblingElement'],
					['someElement']
				], documentNode);
				chai.expect(evaluateXPath(selector, documentNode.documentElement.lastChild, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild]);
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
		});

		describe('ancestor', function () {
			it('parses ancestor::', function () {
				var selector = parseSelector('ancestor::someParentElement');
				jsonMLMapper.parse([
					'someParentElement',
					['someElement', { 'someAttribute': 'someValue' }]
				], documentNode);
				chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement]);
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
		});
		describe('child', function () {
			it('parses child::', function () {
				var selector = parseSelector('child::someElement');
				jsonMLMapper.parse([
					'someParentElement',
					['someElement']
				], documentNode);
				chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild]);
			});
			it('is added implicitly', function () {
				var selector = parseSelector('someElement');
				jsonMLMapper.parse([
					'someParentElement',
					['someElement']
				], documentNode);
				chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild]);
			});
		});
	});

});

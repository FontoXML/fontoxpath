define([
	'fontoxml-blueprints/readOnlyBlueprint',
	'slimdom',

	'fontoxml-selectors/parsing/createSelectorFromXPath',
	'fontoxml-selectors/evaluateXPath'
], function (
	blueprint,
	slimdom,

	parseSelector,
	evaluateXPath
) {
	'use strict';

	var documentNode;
	beforeEach(function () {
		documentNode = slimdom.createDocument();
	});

	describe('attribute', function () {
		it('parses attribute existence', function () {
			var selector = parseSelector('attribute::someAttribute'),
				element = documentNode.createElement('someElement');
			element.setAttribute('someAttribute', 'someValue');
			chai.expect(
				evaluateXPath(selector, element, blueprint))
			.to.equal('someValue');
		});

		it('returns no attributes for documents', function () {
			var selector = parseSelector('attribute::someAttribute');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.STRING_TYPE))
			.to.equal('');
		});

		it('returns no attributes for comments', function () {
			var selector = parseSelector('attribute::someAttribute');
			chai.expect(
				evaluateXPath(selector, documentNode.createComment('some comment'), blueprint, {}, evaluateXPath.STRING_TYPE))
			.to.equal('');
		});

		it('returns no attributes for processing instructions', function () {
			var selector = parseSelector('attribute::someAttribute');
			chai.expect(
				evaluateXPath(selector, documentNode.createProcessingInstruction('someTarget', 'some data'), blueprint, {}, evaluateXPath.STRING_TYPE))
			.to.equal('');
		});

		it('resolves to false if attribute is absent', function () {
			var selector = parseSelector('@someAttribute'),
				element = documentNode.createElement('someElement');
			chai.expect(
				evaluateXPath(selector, element, blueprint))
			.to.deep.equal([]);
		});

		it('allows namespaces', function () {
			var selector = parseSelector('attribute::someNamespace:someAttribute'),
				element = documentNode.createElement('someElement');
			element.setAttribute('someNamespace:someAttribute', 'someValue');
			chai.expect(
				evaluateXPath(selector, element, blueprint))
			.to.equal('someValue');
		});

		it('parses the shorthand for existence', function () {
			var selector = parseSelector('@someAttribute'),
				element = documentNode.createElement('someElement');
			element.setAttribute('someAttribute', 'someValue');
			chai.expect(
				evaluateXPath(selector, element, blueprint))
			.to.equal('someValue');
		});

		it('parses the shorthand for value', function () {
			var selector = parseSelector('@someAttribute=\'someValue\''),
				element = documentNode.createElement('someElement');
			element.setAttribute('someAttribute', 'someValue');
			chai.expect(
				evaluateXPath(selector, element, blueprint))
			.to.equal(true);
		});

		it('allows namespaces in the shorthand', function () {
			var selector = parseSelector('@someNamespace:someAttribute="someValue"'),
				element = documentNode.createElement('someElement');
			element.setAttribute('someNamespace:someAttribute', 'someValue');
			chai.expect(
				evaluateXPath(selector, element, blueprint))
			.to.equal(true);
		});

		it('allows a wildcard as attribute name', function () {
			var selector = parseSelector('string-join(@*/name(), ",")'),
				element = documentNode.createElement('someElement');
			element.setAttribute('someAttribute1', 'someValue1');
			element.setAttribute('someAttribute2', 'someValue2');
			element.setAttribute('someAttribute3', 'someValue3');
			chai.expect(
				evaluateXPath(selector, element, blueprint, {}, evaluateXPath.STRING_TYPE))
			.to.equal('someAttribute1,someAttribute2,someAttribute3');
		});

		it('allows a kindTest as attribute test', function () {
			var selector = parseSelector('string-join(@node()/name(), ",")'),
				element = documentNode.createElement('someElement');
			element.setAttribute('someAttribute1', 'someValue1');
			element.setAttribute('someAttribute2', 'someValue2');
			element.setAttribute('someAttribute3', 'someValue3');
			chai.expect(
				evaluateXPath(selector, element, blueprint, {}, evaluateXPath.STRING_TYPE))
			.to.equal('someAttribute1,someAttribute2,someAttribute3');
		});
	});
});

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

	var documentNode,
		someElement;
	beforeEach(function () {
		documentNode = slimdom.createDocument();
		someElement = documentNode.createElement('someElement');
		documentNode.appendChild(someElement);
	});

	describe('"instance of" and isValidArgument()', function () {
		describe('invalids', function () {
			it('returns false for a wrong type (xs:boolean != xs:integer)', function () {
				var selector = parseSelector('true() instance of xs:integer');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
			});

			it('returns false for a wrong multiplicity (xs:integer+ != xs:integer)', function () {
				var selector = parseSelector('(1, 2, 3) instance of xs:integer');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
			});

			it('returns false for a wrong multiplicity (xs:integer+ != xs:integer?)', function () {
				var selector = parseSelector('(1, 2, 3) instance of xs:integer?');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
			});

			it('returns false for a wrong multiplicity (() != xs:integer+)', function () {
				var selector = parseSelector('() instance of xs:integer+');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
			});
		});

		describe('boolean', function () {
			it('returns true for a single boolean (xs:boolean)', function () {
				var selector = parseSelector('true() instance of xs:boolean');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});
			it('returns true for a single boolean (xs:boolean?)', function () {
				var selector = parseSelector('true() instance of xs:boolean?');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});
			it('returns true for a single boolean (xs:boolean+)', function () {
				var selector = parseSelector('(true(), false()) instance of xs:boolean+');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});
			it('returns true for a single boolean (xs:boolean*)', function () {
				var selector = parseSelector('(true(), false()) instance of xs:boolean*');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});
		});

		describe('integer', function () {
			it('returns true for a single integer (xs:integer)', function () {
				var selector = parseSelector('1 instance of xs:integer');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});
			it('returns true for a single integer (xs:integer?)', function () {
				var selector = parseSelector('1 instance of xs:integer?');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});
			it('returns true for multiple integers (xs:integer+)', function () {
				var selector = parseSelector('(1, 2, 3) instance of xs:integer+');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});
			it('returns true for multiple integers (xs:integer*)', function () {
				var selector = parseSelector('(1, 2, 3) instance of xs:integer*');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});
		});

		describe('string', function () {
			it('returns true for a single string (xs:string)', function () {
				var selector = parseSelector('"abc" instance of xs:string');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});
			it('returns true for a single string (xs:string?)', function () {
				var selector = parseSelector('"abc" instance of xs:string?');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});
			it('returns true for multiple strings (xs:string+)', function () {
				var selector = parseSelector('("abc", "123") instance of xs:string+');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});
			it('returns true for multiple strings (xs:string*)', function () {
				var selector = parseSelector('("abc", "123") instance of xs:string*');
				chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
			});
		});

		describe('node', function () {
			it('returns true for a node (node())', function () {
				var selector = parseSelector('. instance of node()');
				chai.expect(evaluateXPath(selector, someElement, blueprint)).to.equal(true);
			});
		});
	});
});

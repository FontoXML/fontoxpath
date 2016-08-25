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

	describe('unary operators', function () {
		it('accepts + when passed an integer', function () {
			var selector = parseSelector('+1');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(1);
		});
		it('negates a - when passed an integer', function () {
			var selector = parseSelector('-1');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(-1);
		});
		it('accepts + when passed 0', function () {
			var selector = parseSelector('+0');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(0);
		});
		it('accepts - when passed 0', function () {
			var selector = parseSelector('-0');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(0);
		});
		it('accepts chaining +', function () {
			var selector = parseSelector('++++1');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(1);
		});
		it('accepts chaining -', function () {
			var selector = parseSelector('----1');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(1);
		});
		it('accepts chaining - and + intermittently', function () {
			var selector = parseSelector('+-+-1');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(1);
		});
		it('resolves to NaN passed a string', function () {
			var selector = parseSelector('+"something"');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.be.NaN;
		});
		it('resolves to NaN passed a boolean', function () {
			var selector = parseSelector('+true()');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.be.NaN;
		});
		it('resolves to NaN passed a node', function () {
			var selector = parseSelector('+.');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.be.NaN;
		});
	});

	describe('mathematical operators', function () {
		it('can evaluate 1 + 1 to 2', function () {
			var selector = parseSelector('1 + 1');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(2);
		});
		it('can evaluate 1 - 1 to 0', function () {
			var selector = parseSelector('1 - 1');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(0);
		});
		it('can evaluate 1 * 2 to 2', function () {
			var selector = parseSelector('1 * 2');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(2);
		});
		it('can evaluate 1 div 2 to 0.5', function () {
			var selector = parseSelector('1 div 2');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(0.5);
		});
		it('can evaluate 1 idiv 2 to 1', function () {
			var selector = parseSelector('1 div 2');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(0.5);
		});
		it('can evaluate 5 mod 3 to 2', function () {
			var selector = parseSelector('5 mod 3');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(2);
		});
		it('can evaluate "something" + 1 to NaN', function () {
			var selector = parseSelector('"something" + 1');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.be.NaN;
		});
		it('can parse untyped attributes', function () {
			var selector = parseSelector('@a + 1');
			jsonMLMapper.parse(['someElement',{a:'1'}], documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode.documentElement, blueprint)
			).to.equal(2);
		});
	});
});

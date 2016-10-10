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
});

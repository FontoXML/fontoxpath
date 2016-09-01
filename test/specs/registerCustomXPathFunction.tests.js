define([
	'fontoxml-blueprints/readOnlyBlueprint',
	'slimdom',

	'fontoxml-selectors/registerCustomXPathFunction',
	'fontoxml-selectors/parsing/createSelectorFromXPath',
	'fontoxml-selectors/selectors/functions/functionRegistry',
	'fontoxml-selectors/evaluateXPath'
], function (
	blueprint,
	slimdom,

	registerCustomXPathFunction,
	parseSelector,
	functionRegistry,
	evaluateXPath
	) {
	'use strict';

	describe('registerCustomXPathFunction()', function () {
		var documentNode;
		beforeEach(function () {
			documentNode = slimdom.createDocument();
		});

		before(function () {
			registerCustomXPathFunction(
				'fonto:custom-test1',
				['xs:string'],
				'xs:boolean',
				function (dynamicContext, string) {
					return string === 'test';
				});

			registerCustomXPathFunction(
				'fonto:custom-test2',
				['xs:string', 'xs:boolean'],
				'xs:boolean',
				function (dynamicContext, string, boolean) {
					return string === 'test' && boolean;
				});

			registerCustomXPathFunction(
				'fonto:custom-test3',
				['xs:string'],
				'xs:string',
				function (dynamicContext, string) {
					return string;
				});

			registerCustomXPathFunction(
				'fonto:custom-test4',
				['xs:string*'],
				'xs:string*',
				function (dynamicContext, stringArray) {
					return stringArray.map(function (string) {
						return string + '-test';
					});
				});
		});

		it('registers a given custom function', function () {
			var result1 = functionRegistry.hasFunction('fonto:custom-test1', 1);
			var result2 = functionRegistry.hasFunction('fonto:custom-test2', 2);
			var result3 = functionRegistry.hasFunction('fonto:custom-test3', 1);
			var result4 = functionRegistry.hasFunction('fonto:custom-test4', 1);

			chai.expect(result1).to.equal(true);
			chai.expect(result2).to.equal(true);
			chai.expect(result3).to.equal(true);
			chai.expect(result4).to.equal(true);
		});

		it('the registered function can be used in a xPath selector with return value boolean', function () {
			var selector1 = parseSelector('fonto:custom-test1("test")'),
				selector2 = parseSelector('fonto:custom-test1("bla")');
			chai.expect(evaluateXPath(selector1, documentNode, blueprint)).to.equal(true);
			chai.expect(evaluateXPath(selector2, documentNode, blueprint)).to.equal(false);
		});

		it('the registered function can be used in a xPath selector with 2 arguments', function () {
			var selector1 = parseSelector('fonto:custom-test2("test", true())'),
				selector2 = parseSelector('fonto:custom-test2("test", false())');
			chai.expect(evaluateXPath(selector1, documentNode, blueprint)).to.equal(true);
			chai.expect(evaluateXPath(selector2, documentNode, blueprint)).to.equal(false);
		});

		it('the registered function can be used in a xPath selector with return value string', function () {
			var selector1 = parseSelector('fonto:custom-test3("test")'),
				selector2 = parseSelector('fonto:custom-test3("test")');
			chai.expect(evaluateXPath(selector1, documentNode, blueprint)).to.equal('test');
			chai.expect(evaluateXPath(selector2, documentNode, blueprint)).to.equal('test');
		});

		it('the registered function can be used in a xPath selector with return value array', function () {
			var selector1 = parseSelector('fonto:custom-test4(("abc", "123", "XYZ"))'),
				selector2 = parseSelector('fonto:custom-test4(("abc"))'),
				selector3 = parseSelector('fonto:custom-test4(())');
			chai.expect(evaluateXPath(selector1, documentNode, blueprint)).to.deep.equal(['abc-test', '123-test', 'XYZ-test']);
			// Returns ['abc-test'], but does get atomized by the evaluateXPath function
			chai.expect(evaluateXPath(selector2, documentNode, blueprint)).to.deep.equal('abc-test');
			chai.expect(evaluateXPath(selector3, documentNode, blueprint)).to.deep.equal([]);
		});
	});
});

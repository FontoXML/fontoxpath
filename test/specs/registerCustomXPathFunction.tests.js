import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import functionRegistry from 'fontoxml-selectors/selectors/functions/functionRegistry';
import registerCustomXPathFunction from 'fontoxml-selectors/registerCustomXPathFunction';

describe('registerCustomXPath() =>', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = slimdom.createDocument();
	});

	before(() => {
		registerCustomXPathFunction(
			'fonto:custom-test1',
			['xs:string?'],
			'xs:boolean',
			function (dynamicContext, string) {
				return string === null || string === 'test';
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
			['item()?'],
			'item()',
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

	it('registers a given custom function', () => {
		chai.assert(functionRegistry.hasFunction('fonto:custom-test1', 1));
		chai.assert(functionRegistry.hasFunction('fonto:custom-test2', 2));
		chai.assert(functionRegistry.hasFunction('fonto:custom-test3', 1));
		chai.assert(functionRegistry.hasFunction('fonto:custom-test4', 1));
	});

	it('the registered function can be used in a xPath selector with return value boolean', () => {
		chai.assert(evaluateXPath('fonto:custom-test1("test")', documentNode, blueprint) === true);
		chai.assert(evaluateXPath('fonto:custom-test1("bla")', documentNode, blueprint) === false);
		chai.assert(evaluateXPath('fonto:custom-test1(())', documentNode, blueprint) === true);
	});

	it('the registered function can be used in a xPath selector with 2 arguments', () => {
		chai.assert(evaluateXPath('fonto:custom-test2("test", true())', documentNode, blueprint) === true);
		chai.assert(evaluateXPath('fonto:custom-test2("test", false())', documentNode, blueprint) === false);
	});

	it('the registered function can be used in a xPath selector with return value string', () => {
		chai.assert(evaluateXPath('fonto:custom-test3("test")', documentNode, blueprint) === 'test');
		chai.assert(evaluateXPath('fonto:custom-test3("test")', documentNode, blueprint) === 'test');
	});

	it('the registered function can be used in a xPath selector with return value array', () => {
		chai.assert.deepEqual(evaluateXPath('fonto:custom-test4(("abc", "123", "XYZ"))', documentNode, blueprint), ['abc-test', '123-test', 'XYZ-test']);
		// Returns ['abc-test'], but does get atomized by the evaluateXPath function
		chai.assert.deepEqual(evaluateXPath('fonto:custom-test4(("abc"))', documentNode, blueprint), 'abc-test');
		chai.assert.deepEqual(evaluateXPath('fonto:custom-test4(())', documentNode, blueprint), []);
	});
});

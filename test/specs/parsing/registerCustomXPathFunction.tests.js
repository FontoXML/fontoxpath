import * as slimdom from 'slimdom';

import {
	registerCustomXPathFunction,
	evaluateXPathToBoolean,
	evaluateXPathToString,
	evaluateXPathToStrings
} from 'fontoxpath';

describe('registerCustomXPath() =>', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = new slimdom.Document();
	});

	before(() => {
		registerCustomXPathFunction(
			'fonto:custom-test1',
			['xs:string?'],
			'xs:boolean',
			function (dynamicContext, string) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has been passed');
				return string === null || string === 'test';
			});

		registerCustomXPathFunction(
			'fonto:custom-test2',
			['xs:string', 'xs:boolean'],
			'xs:boolean',
			function (dynamicContext, string, boolean) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has been passed');

				return string === 'test' && boolean;
			});

		registerCustomXPathFunction(
			'fonto:custom-test3',
			['item()?'],
			'item()',
			function (dynamicContext, string) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has been passed');

				return string;
			});

		registerCustomXPathFunction(
			'fonto:custom-test4',
			['xs:string*'],
			'xs:string*',
			function (dynamicContext, stringArray) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has been passed');

				return stringArray.map(function (string) {
					return string + '-test';
				});
			});
	});

	it('the registered function can be used in a xPath selector with return value boolean', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('fonto:custom-test1("test")', documentNode));
		chai.assert.isFalse(evaluateXPathToBoolean('fonto:custom-test1("bla")', documentNode));
		chai.assert.isTrue(evaluateXPathToBoolean('fonto:custom-test1(())', documentNode));
	});

	it('the registered function can be used in a xPath selector with 2 arguments', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('fonto:custom-test2("test", true())', documentNode));
		chai.assert.isFalse(evaluateXPathToBoolean('fonto:custom-test2("test", false())', documentNode));
	});

	it('the registered function can be used in a xPath selector with return value string', () => {
		chai.assert.isTrue(evaluateXPathToString('fonto:custom-test3("test")', documentNode) === 'test');
		chai.assert.isTrue(evaluateXPathToString('fonto:custom-test3("test")', documentNode) === 'test');
	});

	it('the registered function can be used in a xPath selector with return value array', () => {
		chai.assert.deepEqual(evaluateXPathToStrings('fonto:custom-test4(("abc", "123", "XYZ"))', documentNode), ['abc-test', '123-test', 'XYZ-test']);
		// Returns ['abc-test'], but does get atomized by the evaluateXPath function
		chai.assert.deepEqual(evaluateXPathToString('fonto:custom-test4(("abc"))', documentNode), 'abc-test');
		chai.assert.deepEqual(evaluateXPathToStrings('fonto:custom-test4(())', documentNode), []);
	});
});

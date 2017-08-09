import * as slimdom from 'slimdom';

import {
	registerCustomXPathFunction,
	evaluateXPathToBoolean,
	evaluateXPathToString,
	evaluateXPathToStrings
} from 'fontoxpath';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

describe('registerCustomXPath() =>', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = new slimdom.Document();

		jsonMlMapper.parse([
			'someElement',
			{ 'someAttribute': 'someValue' }
		], documentNode);
	});

	before(() => {
		registerCustomXPathFunction(
			'test:custom-function1',
			['xs:string?'],
			'xs:boolean',
			function (dynamicContext, string) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has been passed');
				return string === null || string === 'test';
			});

		registerCustomXPathFunction(
			'test:custom-function2',
			['xs:string', 'xs:boolean'],
			'xs:boolean',
			function (dynamicContext, string, boolean) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has been passed');

				return string === 'test' && boolean;
			});

		registerCustomXPathFunction(
			'test:custom-function3',
			['item()*'],
			'item()',
			function (dynamicContext, input) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has been passed');

				return input[0] || null;
			});

		registerCustomXPathFunction(
			'test:custom-function4',
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
		chai.assert.isTrue(evaluateXPathToBoolean('test:custom-function1("test")', documentNode));
		chai.assert.isFalse(evaluateXPathToBoolean('test:custom-function1("bla")', documentNode));
		chai.assert.isTrue(evaluateXPathToBoolean('test:custom-function1(())', documentNode));
	});

	it('the registered function can be used in a xPath selector with 2 arguments', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('test:custom-function2("test", true())', documentNode));
		chai.assert.isFalse(evaluateXPathToBoolean('test:custom-function2("test", false())', documentNode));
	});

	it('the registered function can be used in a xPath selector with return value string', () => {
		chai.assert.isTrue(evaluateXPathToString('test:custom-function3("test")', documentNode) === 'test');
		chai.assert.isTrue(evaluateXPathToString('test:custom-function3("test")', documentNode) === 'test');
	});

	it('disallows attributes as parameters', () => {
		chai.assert.throws(() => evaluateXPathToString('test:custom-function3(//@*)', documentNode), 'Cannot pass attribute nodes');
	});

	it('the registered function can be used in a xPath selector with return value array', () => {
		chai.assert.deepEqual(evaluateXPathToStrings('test:custom-function4(("abc", "123", "XYZ"))', documentNode), ['abc-test', '123-test', 'XYZ-test']);
		// Returns ['abc-test'], but does get atomized by the evaluateXPath function
		chai.assert.deepEqual(evaluateXPathToString('test:custom-function4(("abc"))', documentNode), 'abc-test');
		chai.assert.deepEqual(evaluateXPathToStrings('test:custom-function4(())', documentNode), []);
	});
});

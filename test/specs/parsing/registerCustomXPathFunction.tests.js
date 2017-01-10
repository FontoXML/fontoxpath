import slimdom from 'slimdom';

import {
	domFacade,
	registerCustomXPathFunction,
	evaluateXPathToBoolean,
	evaluateXPathToString,
	evaluateXPathToStrings
} from 'fontoxpath';

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
		chai.assert(evaluateXPathToBoolean('fonto:custom-test1("test")', documentNode, domFacade) === true);
		chai.assert(evaluateXPathToBoolean('fonto:custom-test1("bla")', documentNode, domFacade) === false);
		chai.assert(evaluateXPathToBoolean('fonto:custom-test1(())', documentNode, domFacade) === true);
	});

	it('the registered function can be used in a xPath selector with 2 arguments', () => {
		chai.assert(evaluateXPathToBoolean('fonto:custom-test2("test", true())', documentNode, domFacade) === true);
		chai.assert(evaluateXPathToBoolean('fonto:custom-test2("test", false())', documentNode, domFacade) === false);
	});

	it('the registered function can be used in a xPath selector with return value string', () => {
		chai.assert(evaluateXPathToString('fonto:custom-test3("test")', documentNode, domFacade) === 'test');
		chai.assert(evaluateXPathToString('fonto:custom-test3("test")', documentNode, domFacade) === 'test');
	});

	it('the registered function can be used in a xPath selector with return value array', () => {
		chai.assert.deepEqual(evaluateXPathToStrings('fonto:custom-test4(("abc", "123", "XYZ"))', documentNode, domFacade), ['abc-test', '123-test', 'XYZ-test']);
		// Returns ['abc-test'], but does get atomized by the evaluateXPath function
		chai.assert.deepEqual(evaluateXPathToString('fonto:custom-test4(("abc"))', documentNode, domFacade), 'abc-test');
		chai.assert.deepEqual(evaluateXPathToStrings('fonto:custom-test4(())', documentNode, domFacade), []);
	});
});

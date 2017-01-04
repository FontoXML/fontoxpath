import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
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
			function (_dynamicContext, string) {
				return string === null || string === 'test';
			});

		registerCustomXPathFunction(
			'fonto:custom-test2',
			['xs:string', 'xs:boolean'],
			'xs:boolean',
			function (_dynamicContext, string, boolean) {
				return string === 'test' && boolean;
			});

		registerCustomXPathFunction(
			'fonto:custom-test3',
			['item()?'],
			'item()',
			function (_dynamicContext, string) {
				return string;
			});

		registerCustomXPathFunction(
			'fonto:custom-test4',
			['xs:string*'],
			'xs:string*',
			function (_dynamicContext, stringArray) {
				return stringArray.map(function (string) {
					return string + '-test';
				});
			});
	});

	it('the registered function can be used in a xPath selector with return value boolean', () => {
		chai.assert(evaluateXPath('fonto:custom-test1("test")', documentNode, domFacade) === true);
		chai.assert(evaluateXPath('fonto:custom-test1("bla")', documentNode, domFacade) === false);
		chai.assert(evaluateXPath('fonto:custom-test1(())', documentNode, domFacade) === true);
	});

	it('the registered function can be used in a xPath selector with 2 arguments', () => {
		chai.assert(evaluateXPath('fonto:custom-test2("test", true())', documentNode, domFacade) === true);
		chai.assert(evaluateXPath('fonto:custom-test2("test", false())', documentNode, domFacade) === false);
	});

	it('the registered function can be used in a xPath selector with return value string', () => {
		chai.assert(evaluateXPath('fonto:custom-test3("test")', documentNode, domFacade) === 'test');
		chai.assert(evaluateXPath('fonto:custom-test3("test")', documentNode, domFacade) === 'test');
	});

	it('the registered function can be used in a xPath selector with return value array', () => {
		chai.assert.deepEqual(evaluateXPath('fonto:custom-test4(("abc", "123", "XYZ"))', documentNode, domFacade), ['abc-test', '123-test', 'XYZ-test']);
		// Returns ['abc-test'], but does get atomized by the evaluateXPath function
		chai.assert.deepEqual(evaluateXPath('fonto:custom-test4(("abc"))', documentNode, domFacade), 'abc-test');
		chai.assert.deepEqual(evaluateXPath('fonto:custom-test4(())', documentNode, domFacade), []);
	});
});

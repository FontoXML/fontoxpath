import * as chai from 'chai';
import * as slimdom from 'slimdom';

import {
	registerCustomXPathFunction,
	evaluateXPathToBoolean,
	evaluateXPathToString,
	evaluateXPathToStrings,
	evaluateXPath
} from 'fontoxpath';

import jsonMlMapper from 'test-helpers/jsonMlMapper';
import IDomFacade from 'fontoxpath/domFacade/IDomFacade';

describe('registerCustomXPath', () => {
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
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');
				return string === null || string === 'test';
			});

		registerCustomXPathFunction(
			'test:custom-function2',
			['xs:string', 'xs:boolean'],
			'xs:boolean',
			function (dynamicContext, string, boolean) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return string === 'test' && boolean;
			});

		registerCustomXPathFunction(
			'test:custom-function3',
			['item()*'],
			'item()',
			function (dynamicContext, input) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return input[0] || null;
			});

		registerCustomXPathFunction(
			'test:custom-function4',
			['xs:string*'],
			'xs:string*',
			function (dynamicContext, stringArray) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return stringArray.map(function (string) {
					return string + '-test';
				});
			});

		registerCustomXPathFunction(
			'test:custom-date-function',
			[],
			'xs:date',
			function (dynamicContext) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return new Date(Date.UTC(2018, 5, 22, 10, 25, 30));
			});

		registerCustomXPathFunction(
			'test:custom-time-function',
			[],
			'xs:time',
			function (dynamicContext) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return new Date(Date.UTC(2018, 5, 22, 10, 25, 30));
			});

		registerCustomXPathFunction(
			'test:custom-dateTime-function',
			[],
			'xs:dateTime',
			function (dynamicContext) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return new Date(Date.UTC(2018, 5, 22, 10, 25, 30));
			});

		registerCustomXPathFunction(
			'test:custom-gYearMonth-function',
			[],
			'xs:gYearMonth',
			function (dynamicContext) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return new Date(Date.UTC(2018, 5, 22, 10, 25, 30));
			});

		registerCustomXPathFunction(
			'test:custom-gYear-function',
			[],
			'xs:gYear',
			function (dynamicContext) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return new Date(Date.UTC(2018, 5, 22, 10, 25, 30));
			});

		registerCustomXPathFunction(
			'test:custom-gMonthDay-function',
			[],
			'xs:gMonthDay',
			function (dynamicContext) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return new Date(Date.UTC(2018, 5, 22, 10, 25, 30));
			});

		registerCustomXPathFunction(
			'test:custom-gMonth-function',
			[],
			'xs:gMonth',
			function (dynamicContext) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return new Date(Date.UTC(2018, 5, 22, 10, 25, 30));
			});

		registerCustomXPathFunction(
			'test:custom-gDay-function',
			[],
			'xs:gDay',
			function (dynamicContext) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return new Date(Date.UTC(2018, 5, 22, 10, 25, 30));
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

	it('functions can be registered using a namespace', () => {
		var namespaceURI = 'http://www.example.com/customFunctionTest';
		registerCustomXPathFunction(
			{ namespaceURI: 'http://www.example.com/customFunctionTest', localName: 'test' },
			[],
			'xs:boolean',
			function (dynamicContext) {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');
				chai.assert.equal(dynamicContext.currentContext.nodeId, '123456789');

				return true;
			});
		const options = {
			currentContext: {
				nodeId: '123456789'
			}
		}
		chai.assert.isTrue(evaluateXPathToBoolean(`Q{${namespaceURI}}test()`, null, null, null, options), 'Attempt to access the function using the namespace uri');
	});

	it('disallows attributes as parameters', () => {
		chai.assert.throws(() => evaluateXPathToString('test:custom-function3(//@*)', documentNode), 'Cannot pass attribute nodes');
	});

	it('the registered function can be used in an XPath selector with return value array', () => {
		chai.assert.deepEqual(evaluateXPathToStrings('test:custom-function4(("abc", "123", "XYZ"))', documentNode), ['abc-test', '123-test', 'XYZ-test']);
		// Returns ['abc-test'], but does get atomized by the evaluateXPath function
		chai.assert.deepEqual(evaluateXPathToString('test:custom-function4(("abc"))', documentNode), 'abc-test');
		chai.assert.deepEqual(evaluateXPathToStrings('test:custom-function4(())', documentNode), []);
	});

	it ('the registered function can be used in a xPath selector with return value date', () => {
		chai.assert.equal(evaluateXPathToString('test:custom-date-function()', documentNode), '2018-06-22Z');
	});

	it ('the registered function can be used in a xPath selector with return value time', () => {
		chai.assert.equal(evaluateXPathToString('test:custom-time-function()', documentNode), '10:25:30Z');
	});

	it ('the registered function can be used in a xPath selector with return value dateTime', () => {
		chai.assert.equal(evaluateXPathToString('test:custom-dateTime-function()', documentNode), '2018-06-22T10:25:30Z');
	});

	it ('the registered function can be used in a xPath selector with return value gYearMonth', () => {
		chai.assert.equal(evaluateXPathToString('test:custom-gYearMonth-function()', documentNode), '2018-06Z');
	});

	it ('the registered function can be used in a xPath selector with return value gYear', () => {
		chai.assert.equal(evaluateXPathToString('test:custom-gYear-function()', documentNode), '2018Z');
	});

	it ('the registered function can be used in a xPath selector with return value gMonthDay', () => {
		chai.assert.equal(evaluateXPathToString('test:custom-gMonthDay-function()', documentNode), '--06-22Z');
	});

	it ('the registered function can be used in a xPath selector with return value gMonth', () => {
		chai.assert.equal(evaluateXPathToString('test:custom-gMonth-function()', documentNode), '--06Z');
	});

	it ('the registered function can be used in a xPath selector with return value gDay', () => {
		chai.assert.equal(evaluateXPathToString('test:custom-gDay-function()', documentNode), '---22Z');
	});

	it('keeps domFacades intact', () => {
		const outerDomFacade = { 'this-is-the-outer-one': true } as unknown as IDomFacade;
		registerCustomXPathFunction(
			'test:custom-function-keeps-the-dom-facade',
			[],
			'xs:boolean',
			function (dynamicContext, string) {
				chai.assert.equal(outerDomFacade, dynamicContext.domFacade);
				return true;
			});
		chai.assert.isTrue(
			evaluateXPathToBoolean('test:custom-function-keeps-the-dom-facade()', documentNode, outerDomFacade));
	});

	describe('Custom functions are given the correct javascript type', () => {

		before(() => {

			registerCustomXPathFunction(
				'test:custom-date-function-param',
				['xs:date'],
				'xs:date',
				function (dynamicContext, date) {
					chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
					chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');
	
					chai.assert.isTrue(date instanceof Date, 'Parameter is not of type javascript date')
	
					return date;
				});

			registerCustomXPathFunction(
				'test:custom-date-function-optional-param',
				['xs:date?'],
				'xs:date?',
				function (dynamicContext, date) {
					chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
					chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');
	
					chai.assert.isTrue(date === null || date instanceof Date, 'Parameter is not null or of type javascript date')
	
					return date;
				});

			registerCustomXPathFunction(
				'test:custom-date-function-multiple-param',
				['xs:date*'],
				'xs:date*',
				function (dynamicContext, dates) {
					chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
					chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');
	
					chai.assert.isTrue(Array.isArray(dates), "Parameter is not an array");

					for (const date of dates) {
						chai.assert.isTrue(date instanceof Date, 'Parameter is not of type javascript date')
					}	
					return dates;
				});

		})
		it('Passes a javascript date to the custom function', () => {
			chai.assert.equal(evaluateXPathToString('test:custom-date-function-param(xs:date("2019-08-29"))', documentNode), '2019-08-29Z');
		})
		it('Passess null to the custom function', () => {
			chai.assert.equal(evaluateXPathToString('test:custom-date-function-optional-param(())', documentNode), '');
		})
		it('Passes an array of javascript dates to the function', () => {
			chai.assert.deepEqual(evaluateXPathToStrings('test:custom-date-function-multiple-param((xs:date("2019-08-29"), xs:date("2019-08-31")))', documentNode), ['2019-08-29Z', '2019-08-31Z']);
		})
	})
});

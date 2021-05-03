import * as chai from 'chai';
import * as slimdom from 'slimdom';

import {
	createTypedValueFactory,
	evaluateXPath,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToString,
	evaluateXPathToStrings,
	registerCustomXPathFunction,
} from 'fontoxpath';

import IDomFacade from 'fontoxpath/domFacade/IDomFacade';
import jsonMlMapper from 'test-helpers/jsonMlMapper';
import { BaseType } from 'fontoxpath/expressions/dataTypes/Value';

describe('registerCustomXPathFunction', () => {
	function identityNamespaceResolver(prefix) {
		return prefix;
	}

	let documentNode;
	const stringValueFactory = createTypedValueFactory({
		kind: BaseType.NULLABLE,
		item: { kind: BaseType.XSSTRING },
	});
	beforeEach(() => {
		documentNode = new slimdom.Document();

		jsonMlMapper.parse(['someElement', { someAttribute: 'someValue' }], documentNode);
	});

	before(() => {
		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'custom-function1' },
			[{ kind: BaseType.XSSTRING, occurrence: OccurrenceIndicator.NULLABLE }],
			{ kind: BaseType.XSBOOLEAN },
			(dynamicContext, stringValue) => {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');
				return stringValue === null || stringValue === 'test';
			}
		);

		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'custom-function2' },
			[{ kind: BaseType.XSSTRING }, { kind: BaseType.XSBOOLEAN }],
			{ kind: BaseType.XSBOOLEAN },
			(dynamicContext, stringValue, booleanValue) => {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return stringValue === 'test' && booleanValue;
			}
		);

		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'custom-function3' },
			[{ kind: BaseType.ANY, item: { kind: BaseType.ITEM } }],
			{ kind: BaseType.ITEM },
			(dynamicContext, input) => {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return input[0] || null;
			}
		);

		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'custom-function4' },
			[{ kind: BaseType.ANY, item: { kind: BaseType.XSSTRING } }],
			{ kind: BaseType.ANY, item: { kind: BaseType.XSSTRING } },
			(dynamicContext, stringArray) => {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return stringArray.map((stringValue) => {
					return stringValue + '-test';
				});
			}
		);

		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'custom-function5' },
			[{ kind: BaseType.XSSTRING, occurrence: OccurrenceIndicator.NULLABLE }],
			{ kind: BaseType.XSSTRING, occurrence: OccurrenceIndicator.NULLABLE },
			(dynamicContext, stringValue) => {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				if (stringValue === 'returnNull') {
					return null;
				} else if (stringValue === null) {
					return 'nullIsPassed';
				} else {
					return stringValueFactory('test', dynamicContext.domFacade);
				}
			}
		);

		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'custom-date-function' },
			[],
			{ kind: BaseType.XSDATE },
			(dynamicContext) => {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return new Date(Date.UTC(2018, 5, 22, 10, 25, 30));
			}
		);

		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'custom-time-function' },
			[],
			{ kind: BaseType.XSTIME },
			(dynamicContext) => {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return new Date(Date.UTC(2018, 5, 22, 10, 25, 30));
			}
		);

		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'custom-dateTime-function' },
			[],
			{ kind: BaseType.XSDATETIME },
			(dynamicContext) => {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return new Date(Date.UTC(2018, 5, 22, 10, 25, 30));
			}
		);

		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'custom-gYearMonth-function' },
			[],
			{ kind: BaseType.XSGYEARMONTH },
			(dynamicContext) => {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return new Date(Date.UTC(2018, 5, 22, 10, 25, 30));
			}
		);

		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'custom-gYear-function' },
			[],
			{ kind: BaseType.XSGYEAR },
			(dynamicContext) => {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return new Date(Date.UTC(2018, 5, 22, 10, 25, 30));
			}
		);

		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'custom-gMonthDay-function' },
			[],
			{ kind: BaseType.XSGMONTHDAY },
			(dynamicContext) => {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return new Date(Date.UTC(2018, 5, 22, 10, 25, 30));
			}
		);

		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'custom-gMonth-function' },
			[],
			{ kind: BaseType.XSGMONTH },
			(dynamicContext) => {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return new Date(Date.UTC(2018, 5, 22, 10, 25, 30));
			}
		);

		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'custom-gDay-function' },
			[],
			{ kind: BaseType.XSGDAY },
			(dynamicContext) => {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');

				return new Date(Date.UTC(2018, 5, 22, 10, 25, 30));
			}
		);
	});

	it('the registered function can be used in a xPath selector with return value boolean', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean('test:custom-function1("test")', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			})
		);
		chai.assert.isFalse(
			evaluateXPathToBoolean('test:custom-function1("bla")', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			})
		);
		chai.assert.isTrue(
			evaluateXPathToBoolean('test:custom-function1(())', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			})
		);
	});

	it('the registered function can be used in a xPath selector with 2 arguments', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'test:custom-function2("test", true())',
				documentNode,
				null,
				null,
				{ namespaceResolver: identityNamespaceResolver }
			)
		);
		chai.assert.isFalse(
			evaluateXPathToBoolean(
				'test:custom-function2("test", false())',
				documentNode,
				null,
				null,
				{ namespaceResolver: identityNamespaceResolver }
			)
		);
	});

	it('the registered function can be used in a xPath selector with return value string', () => {
		chai.assert.isTrue(
			evaluateXPathToString('test:custom-function3("test")', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			}) === 'test'
		);
		chai.assert.isTrue(
			evaluateXPathToString('test:custom-function3("test")', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			}) === 'test'
		);
	});

	it('functions can be registered using a namespace', () => {
		const namespaceURI = 'http://www.example.com/customFunctionTest';
		registerCustomXPathFunction(
			{ namespaceURI: 'http://www.example.com/customFunctionTest', localName: 'test' },
			[],
			{ kind: BaseType.XSBOOLEAN },
			(dynamicContext) => {
				chai.assert.isOk(dynamicContext, 'A dynamic context has not been passed');
				chai.assert.isOk(dynamicContext.domFacade, 'A domFacade has not been passed');
				chai.assert.equal(dynamicContext.currentContext.nodeId, '123456789');

				return true;
			}
		);
		const options = {
			currentContext: {
				nodeId: '123456789',
			},
		};
		chai.assert.isTrue(
			evaluateXPathToBoolean(`Q{${namespaceURI}}test()`, null, null, null, options),
			'Attempt to access the function using the namespace uri'
		);
	});

	it('disallows registering in the default namespace', () => {
		chai.assert.throws(
			() =>
				registerCustomXPathFunction(
					'custom-function-in-no-ns',
					[],
					{ kind: BaseType.XSBOOLEAN },
					() => true
				),
			'Do not register custom functions in the default function namespace'
		);
	});

	it('disallows attributes as parameters', () => {
		chai.assert.throws(
			() =>
				evaluateXPathToString('test:custom-function3(//@*)', documentNode, null, null, {
					namespaceResolver: identityNamespaceResolver,
				}),
			'Cannot pass attribute nodes'
		);
	});

	it('the registered function can be used in an XPath selector with return value array', () => {
		chai.assert.deepEqual(
			evaluateXPathToStrings(
				'test:custom-function4(("abc", "123", "XYZ"))',
				documentNode,
				null,
				null,
				{ namespaceResolver: identityNamespaceResolver }
			),
			['abc-test', '123-test', 'XYZ-test']
		);
		// Returns ['abc-test'], but does get atomized by the evaluateXPath function
		chai.assert.deepEqual(
			evaluateXPathToString('test:custom-function4(("abc"))', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			}),
			'abc-test'
		);
		chai.assert.deepEqual(
			evaluateXPathToStrings('test:custom-function4(())', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			}),
			[]
		);
	});

	it('the registered function can return a null value', () => {
		chai.assert.equal(
			evaluateXPathToString('test:custom-function5("returnNull")', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			}),
			''
		);
	});

	it('the registered function can return a value constructed with a typeValueConstructor', () => {
		chai.assert.equal(
			evaluateXPathToString('test:custom-function5("abc")', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			}),
			'test'
		);
	});

	it('the registered function accepts a null value', () => {
		chai.assert.equal(
			evaluateXPathToString(
				'test:custom-function5($str)',
				documentNode,
				null,
				{
					str: null,
				},
				{
					namespaceResolver: identityNamespaceResolver,
				}
			),
			'nullIsPassed'
		);
	});

	it('the registered function accepts a value constructed with a typeValueConstructor', () => {
		chai.assert.equal(
			evaluateXPathToString(
				'test:custom-function5($str)',
				documentNode,
				null,
				{
					str: stringValueFactory('returnNull', documentNode),
				},
				{
					namespaceResolver: identityNamespaceResolver,
				}
			),
			''
		);
	});

	it('the registered function can be used in a xPath selector with return value date', () => {
		chai.assert.equal(
			evaluateXPathToString('test:custom-date-function()', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			}),
			'2018-06-22Z'
		);
	});

	it('the registered function can be used in a xPath selector with return value time', () => {
		chai.assert.equal(
			evaluateXPathToString('test:custom-time-function()', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			}),
			'10:25:30Z'
		);
	});

	it('the registered function can be used in a xPath selector with return value dateTime', () => {
		chai.assert.equal(
			evaluateXPathToString('test:custom-dateTime-function()', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			}),
			'2018-06-22T10:25:30Z'
		);
	});

	it('the registered function can be used in a xPath selector with return value gYearMonth', () => {
		chai.assert.equal(
			evaluateXPathToString('test:custom-gYearMonth-function()', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			}),
			'2018-06Z'
		);
	});

	it('the registered function can be used in a xPath selector with return value gYear', () => {
		chai.assert.equal(
			evaluateXPathToString('test:custom-gYear-function()', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			}),
			'2018Z'
		);
	});

	it('the registered function can be used in a xPath selector with return value gMonthDay', () => {
		chai.assert.equal(
			evaluateXPathToString('test:custom-gMonthDay-function()', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			}),
			'--06-22Z'
		);
	});

	it('the registered function can be used in a xPath selector with return value gMonth', () => {
		chai.assert.equal(
			evaluateXPathToString('test:custom-gMonth-function()', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			}),
			'--06Z'
		);
	});

	it('the registered function can be used in a xPath selector with return value gDay', () => {
		chai.assert.equal(
			evaluateXPathToString('test:custom-gDay-function()', documentNode, null, null, {
				namespaceResolver: identityNamespaceResolver,
			}),
			'---22Z'
		);
	});

	it('keeps domFacades intact', () => {
		const outerDomFacade = ({ 'this-is-the-outer-one': true } as unknown) as IDomFacade;
		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'custom-function-keeps-the-dom-facade' },
			[],
			{ kind: BaseType.XSBOOLEAN },
			(dynamicContext) => {
				chai.assert.equal(outerDomFacade, dynamicContext.domFacade);
				return true;
			}
		);
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'test:custom-function-keeps-the-dom-facade()',
				documentNode,
				outerDomFacade,
				null,
				{ namespaceResolver: identityNamespaceResolver }
			)
		);
	});

	it('Throws the correct error when registering a function with a uri', () => {
		chai.assert.throws(
			() =>
				registerCustomXPathFunction(
					{ namespaceURI: '', localName: 'empty-uri' },
					[],
					{ kind: BaseType.XSBOOLEAN },
					(dynamicContext) => true
				),
			'XQST0060'
		);
		chai.assert.throws(
			() =>
				registerCustomXPathFunction(
					{ namespaceURI: null, localName: 'empty-uri' },
					[],
					{ kind: BaseType.XSBOOLEAN },
					(dynamicContext) => true
				),
			'XQST0060'
		);
	});

	it('can get node without wrapping by pointers', () => {
		const myNode = evaluateXPathToFirstNode<slimdom.Element>(
			`<myNode myAttribute="myValue"/>`,
			documentNode,
			undefined,
			{},
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);
		const blueprint = ({
			getAttribute(element, attrName) {
				const attr = element.attributes.find(
					(attribute) => attribute.localName === attrName
				);
				return attr.value;
			},
			getParentNode(element) {
				return element.parentNode;
			},
		} as unknown) as IDomFacade;
		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'my-custom-func-msc' },
			[{ kind: BaseType.NODE }],
			{ kind: BaseType.NODE },
			(dynamicContext, node) => {
				chai.assert.equal(
					dynamicContext.domFacade.getAttribute(node, 'myAttribute'),
					'myValue'
				);
				chai.assert.equal(myNode, node);
				return node;
			}
		);

		/*
				  Another test case
				  `<xml><a/></xml>`
				  `let $a := xml/a
				  return xml/a/parent::* ne <b>{$a}</b>/parent::*`;
				*/

		const myNodeAfterFunction = evaluateXPathToFirstNode<slimdom.Element>(
			'test:my-custom-func-msc(.)',
			myNode,
			blueprint,
			null,
			{ namespaceResolver: identityNamespaceResolver }
		);
		chai.assert.equal(myNodeAfterFunction.outerHTML, myNode.outerHTML);
	});

	describe('Custom functions are given the correct javascript type', () => {
		before(() => {
			registerCustomXPathFunction(
				{ namespaceURI: 'test', localName: 'custom-date-function-param' },
				[{ kind: BaseType.XSDATE }],
				{ kind: BaseType.XSDATE },
				(dynamicContext, date) => {
					chai.assert.isTrue(
						date instanceof Date,
						'Parameter is not of type javascript date'
					);
					return date;
				}
			);

			registerCustomXPathFunction(
				{ namespaceURI: 'test', localName: 'custom-date-function-optional-param' },
				[{ kind: BaseType.XSDATE, occurrence: OccurrenceIndicator.NULLABLE }],
				{ kind: BaseType.XSDATE, occurrence: OccurrenceIndicator.NULLABLE },
				(dynamicContext, date) => {
					chai.assert.isTrue(
						date === null || date instanceof Date,
						'Parameter is not null or of type javascript date'
					);
					return date;
				}
			);

			registerCustomXPathFunction(
				{ namespaceURI: 'test', localName: 'custom-date-function-zero-to-many-param' },
				[{ kind: BaseType.ANY, item: { kind: BaseType.XSDATE } }],
				{ kind: BaseType.ANY, item: { kind: BaseType.XSDATE } },
				(dynamicContext, dates) => {
					chai.assert.isTrue(Array.isArray(dates), 'Parameter is not an array');

					for (const date of dates) {
						chai.assert.isTrue(
							date instanceof Date,
							'Parameter is not of type javascript date'
						);
					}
					return dates;
				}
			);

			registerCustomXPathFunction(
				{ namespaceURI: 'test', localName: 'custom-date-function-one-to-many-param' },
				[{ kind: BaseType.SOME, item: { kind: BaseType.XSDATE } }],
				{ kind: BaseType.ANY, item: { kind: BaseType.XSDATE } },
				(dynamicContext, dates) => {
					chai.assert.isTrue(Array.isArray(dates), 'Parameter is not an array');

					for (const date of dates) {
						chai.assert.isTrue(
							date instanceof Date,
							'Parameter is not of type javascript date'
						);
					}
					return dates;
				}
			);

			registerCustomXPathFunction(
				{ namespaceURI: 'test', localName: 'custom-time-param-function' },
				[{ kind: BaseType.XSTIME }],
				{ kind: BaseType.XSTIME },
				(dynamicContext, time) => {
					chai.assert.isTrue(
						time instanceof Date,
						'Parameter is not of type javascript date'
					);
					return time;
				}
			);

			registerCustomXPathFunction(
				{ namespaceURI: 'test', localName: 'custom-dateTime-param-function' },
				[{ kind: BaseType.XSDATETIME }],
				{ kind: BaseType.XSDATETIME },
				(dynamicContext, dateTime) => {
					chai.assert.isTrue(
						dateTime instanceof Date,
						'Parameter is not of type javascript date'
					);
					return dateTime;
				}
			);

			registerCustomXPathFunction(
				{ namespaceURI: 'test', localName: 'custom-gYearMonth-param-function' },
				[{ kind: BaseType.XSGYEARMONTH }],
				{ kind: BaseType.XSGYEARMONTH },
				(dynamicContext, gYearMonth) => {
					chai.assert.isTrue(
						gYearMonth instanceof Date,
						'Parameter is not of type javascript date'
					);
					return gYearMonth;
				}
			);

			registerCustomXPathFunction(
				{ namespaceURI: 'test', localName: 'custom-gYear-param-function' },
				[{ kind: BaseType.XSGYEAR }],
				{ kind: BaseType.XSGYEAR },
				(dynamicContext, gYear) => {
					chai.assert.isTrue(
						gYear instanceof Date,
						'Parameter is not of type javascript date'
					);
					return gYear;
				}
			);

			registerCustomXPathFunction(
				{ namespaceURI: 'test', localName: 'custom-gMonthDay-param-function' },
				[{ kind: BaseType.XSGMONTHDAY }],
				{ kind: BaseType.XSGMONTHDAY },
				(dynamicContext, gMonthDay) => {
					chai.assert.isTrue(
						gMonthDay instanceof Date,
						'Parameter is not of type javascript date'
					);
					return gMonthDay;
				}
			);

			registerCustomXPathFunction(
				{ namespaceURI: 'test', localName: 'custom-gMonth-param-function' },
				[{ kind: BaseType.XSGMONTH }],
				{ kind: BaseType.XSGMONTH },
				(dynamicContext, gMonth) => {
					chai.assert.isTrue(
						gMonth instanceof Date,
						'Parameter is not of type javascript date'
					);
					return gMonth;
				}
			);

			registerCustomXPathFunction(
				{ namespaceURI: 'test', localName: 'custom-gDay-param-function' },
				[{ kind: BaseType.XSGDAY }],
				{ kind: BaseType.XSGDAY },
				(dynamicContext, gDay) => {
					chai.assert.isTrue(
						gDay instanceof Date,
						'Parameter is not of type javascript date'
					);
					return gDay;
				}
			);
		});
		it('Passes xs:date as a javascript date when the param cardinality is 1', () => {
			evaluateXPath(
				'test:custom-date-function-param(xs:date("2019-08-29"))',
				null,
				null,
				null,
				null,
				{ namespaceResolver: identityNamespaceResolver }
			);
		});
		it('Passes xs:date as a javascript date when the param cardinality is 0-1', () => {
			evaluateXPath(
				'test:custom-date-function-optional-param(xs:date("2019-08-29"))',
				null,
				null,
				null,
				null,
				{ namespaceResolver: identityNamespaceResolver }
			);
		});
		it('Passes an array of xs:date as a javascript array of date when the param cardinality is 0 to many', () => {
			evaluateXPath(
				'test:custom-date-function-zero-to-many-param((xs:date("2019-08-29"), xs:date("2019-08-31")))',
				null,
				null,
				null,
				null,
				{ namespaceResolver: identityNamespaceResolver }
			);
		});
		it('Passes an array of xs:date as a javascript array of date when the param cardinality is 1 to many', () => {
			evaluateXPath(
				'test:custom-date-function-one-to-many-param((xs:date("2019-08-29"), xs:date("2019-08-31")))',
				null,
				null,
				null,
				null,
				{ namespaceResolver: identityNamespaceResolver }
			);
		});
		it('Passes xs:time as a javascript date', () => {
			evaluateXPath(
				'test:custom-time-param-function(xs:time("12:00:00"))',
				null,
				null,
				null,
				null,
				{ namespaceResolver: identityNamespaceResolver }
			);
		});
		it('Passes xs:dateTime as a javascript date', () => {
			evaluateXPath(
				'test:custom-dateTime-param-function(xs:dateTime("2019-08-29T12:00:00"))',
				null,
				null,
				null,
				null,
				{ namespaceResolver: identityNamespaceResolver }
			);
		});
		it('Passes xs:gYearMonth as a javascript date', () => {
			evaluateXPath(
				'test:custom-gYearMonth-param-function(xs:gYearMonth("2019-08"))',
				null,
				null,
				null,
				null,
				{ namespaceResolver: identityNamespaceResolver }
			);
		});
		it('Passes xs:gYear as a javascript date', () => {
			evaluateXPath(
				'test:custom-gYear-param-function(xs:gYear("2019"))',
				null,
				null,
				null,
				null,
				{
					namespaceResolver: identityNamespaceResolver,
				}
			);
		});
		it('Passes xs:gMonthDay as a javascript date', () => {
			evaluateXPath(
				'test:custom-gMonthDay-param-function(xs:gMonthDay("--08-29"))',
				null,
				null,
				null,
				null,
				{ namespaceResolver: identityNamespaceResolver }
			);
		});
		it('Passes xs:gMonth as a javascript date', () => {
			evaluateXPath(
				'test:custom-gMonth-param-function(xs:gMonth("--08"))',
				null,
				null,
				null,
				null,
				{ namespaceResolver: identityNamespaceResolver }
			);
		});
		it('Passes xs:gDay as a javascript date', () => {
			evaluateXPath(
				'test:custom-gDay-param-function(xs:gDay("---29"))',
				null,
				null,
				null,
				null,
				{
					namespaceResolver: identityNamespaceResolver,
				}
			);
		});
	});
});

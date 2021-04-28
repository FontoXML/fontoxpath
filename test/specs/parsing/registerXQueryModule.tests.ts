import * as chai from 'chai';
import {
	evaluateXPath,
	evaluateXPathToString,
	registerCustomXPathFunction,
	registerXQueryModule,
} from 'fontoxpath';

describe('registerXQueryModule', () => {
	it('Can declare a function in a module and use the module from an XPath', () => {
		registerXQueryModule(`
module namespace test = "https://www.example.org/test1";

declare %public function test:hello($a) {
   "Hello " || $a
};
`);

		const result = evaluateXPath('test:hello("World")', null, null, null, null, {
			moduleImports: {
				test: 'https://www.example.org/test1',
			},
		});

		chai.assert.equal(result, 'Hello World');
	});

	it('Can declare a mutually recursive function in a module and use the module from an XPath', () => {
		registerXQueryModule(`
module namespace test = "https://www.example.org/test2";

declare %public function test:is-even ($n) {
  if ($n = 0) then true() else test:is-odd($n - 1)
};

declare %public function test:is-odd ($n) {
  test:is-even($n - 1)
};`);

		const result = evaluateXPath('test:is-odd(5)', null, null, null, null, {
			moduleImports: {
				test: 'https://www.example.org/test2',
			},
		});

		chai.assert.equal(result, true);
	});

	it('Can import a registered module', () => {
		registerXQueryModule(`
module namespace test = "https://www.example.org/test3/submodule";
declare %public function test:hello ($a) {
  "Hello " || $a
};
`);
		registerXQueryModule(`
module namespace test = "https://www.example.org/test3/mainModule";
import module namespace submodule = "https://www.example.org/test3/submodule";

declare %public function test:hello ($a) {
  submodule:hello($a) || "!!!"
};
`);

		const result = evaluateXPath('test:hello("World")', null, null, null, null, {
			moduleImports: {
				test: 'https://www.example.org/test3/mainModule',
			},
		});

		chai.assert.equal(result, 'Hello World!!!');
	});

	it('Can declare a function without body', () => {
		const result = evaluateXPath(
			'declare %public function local:my-func(){};local:my-func()',
			null,
			null,
			null,
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);

		chai.assert.deepEqual(result, []);
	});

	it('can register a module with an external function declaration', () => {
		registerXQueryModule(`
module namespace x = 'http://www.example.com';


declare function x:fn () external;`);
	});

	it('can register a module with an external declaration for a function that is registered later', () => {
		// Should not throw because x:external-1 could be registered later
		registerXQueryModule(`
			module namespace x = 'http://www.example.com';

			declare function x:external-1 () as item() external;

			declare %public function x:uses-external-1() as item() {
				x:external-1()
			};
		`);

		// Should throw because x:external-1 is not yet registered
		chai.expect(() =>
			evaluateXPathToString(
				`import module namespace x = "http://www.example.com";
				x:uses-external-1()`,
				null,
				undefined,
				undefined,
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		).to.throw('XPST0017');

		// Now register it
		registerCustomXPathFunction(
			{
				namespaceURI: 'http://www.example.com',
				localName: 'external-1',
			},
			[],
			'item()',
			() => 'meep'
		);

		chai.expect(
			evaluateXPathToString(
				`import module namespace x = "http://www.example.com";
				x:uses-external-1()`,
				null,
				undefined,
				undefined,
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		).to.equal('meep');
	});

	it('will not allow the custom function and its external declaration to have a mismatching return type', () => {
		// Should not throw because x:external-1 could be registered later
		registerXQueryModule(`
			module namespace x = 'http://www.example.com';

			declare function x:external-2 () as xs:decimal external;

			declare %public function x:uses-external-2() as xs:decimal {
				x:external-2()
			};
		`);

		registerCustomXPathFunction(
			{
				namespaceURI: 'http://www.example.com',
				localName: 'external-2',
			},
			[],
			'xs:string',
			() => 'meep'
		);

		chai.expect(() =>
			evaluateXPathToString(
				`import module namespace x = "http://www.example.com";
				x:uses-external-2()`,
				null,
				undefined,
				undefined,
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		).to.throw('External function declaration types do not match actual function');
	});

	it('will not allow the custom function and its external declaration to have mismatching argument types', () => {
		// Should not throw because x:external-1 could be registered later
		registerXQueryModule(`
			module namespace x = 'http://www.example.com';

			declare function x:external-3 ($a as xs:decimal) as item() external;

			declare %public function x:uses-external-3() as item() {
				x:external-3(1.0)
			};
		`);

		registerCustomXPathFunction(
			{
				namespaceURI: 'http://www.example.com',
				localName: 'external-3',
			},
			['xs:string'],
			'item()',
			() => 'meep'
		);

		chai.expect(() =>
			evaluateXPathToString(
				`import module namespace x = "http://www.example.com";
				x:uses-external-3()`,
				null,
				undefined,
				undefined,
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		).to.throw('External function declaration types do not match actual function');
	});

	it('does not support external function declarations for updating functions', () => {
		chai.expect(() =>
			registerXQueryModule(
				`module namespace x = 'http://www.example.com';
				declare %updating function x:updating-fn () external;`
			)
		).to.throw('Updating external function declarations are not supported');
	});

	it('throws if the module declares a non-external function that already exists', () => {
		registerCustomXPathFunction(
			{
				namespaceURI: 'http://www.example.com',
				localName: 'duplicate-fn',
			},
			[],
			'item()',
			() => 'meep'
		);

		chai.expect(() =>
			registerXQueryModule(
				`module namespace x = 'http://www.example.com';
				declare function x:duplicate-fn () {
					'maap'
				};`
			)
		).to.throw(
			'XQST0049: The function Q{http://www.example.com}duplicate-fn#0 has already been declared.'
		);
	});

	it('allows declaring an external function that already exists', () => {
		registerCustomXPathFunction(
			{
				namespaceURI: 'http://www.example.com',
				localName: 'pre-registered-fn',
			},
			[],
			'item()',
			() => 'meep'
		);

		registerXQueryModule(
			`module namespace x = 'http://www.example.com';
			declare function x:pre-registered-fn () external;`
		);

		chai.expect(
			evaluateXPathToString(
				`import module namespace x = "http://www.example.com";
				x:pre-registered-fn()`,
				null,
				undefined,
				undefined,
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		).to.equal('meep');
	});
});

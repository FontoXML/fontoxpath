import * as chai from 'chai';
import { registerXQueryModule, evaluateXPath } from 'fontoxpath';

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
				test: 'https://www.example.org/test1'
			}
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
				test: 'https://www.example.org/test2'
			}
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
				test: 'https://www.example.org/test3/mainModule'
			}
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
});

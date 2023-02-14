import * as chai from 'chai';
import { evaluateXPath, finalizeModuleRegistration, registerXQueryModule } from 'fontoxpath';

describe('Main modules', () => {
	it('Can import from a mainmodule', () => {
		registerXQueryModule(`
module namespace test = "http://www.example.org/mainmodules.tests#1";

declare %public function test:hello($a) {
   "Hello " || $a
};
`);

		const result = evaluateXPath(
			`
import module namespace test = "http://www.example.org/mainmodules.tests#1";

test:hello("World")
`,
			null,
			null,
			null,
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);

		chai.assert.equal(result, 'Hello World');
	});

	it('crashes correctly when importing the same module twice', () => {
		registerXQueryModule(`
module namespace test = "http://www.example.org/mainmodules.tests#2";

declare %public function test:hello($a) {
   "Hello " || $a
};
`);

		chai.assert.throws(
			() =>
				evaluateXPath(
					`
import module namespace test = "http://www.example.org/mainmodules.tests#2";
import module namespace test = "http://www.example.org/mainmodules.tests#2";

test:hello("World")
`,
					null,
					null,
					null,
					null,
					{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
				),
			'XQST0047'
		);
	});

	it('crashes correctly when declaring the same variable twice', () => {
		registerXQueryModule(`
module namespace test = "http://www.example.org/mainmodules.tests#2";

declare %public function test:hello($a) {
   "Hello " || $a
};

`);
		registerXQueryModule(`
module namespace test = "http://www.example.org/mainmodules.tests#2";

declare %public function test:hello($a) {
   "Second Hello" || $a
};

`);

		chai.assert.throws(
			() =>
				evaluateXPath(
					`
import module namespace test = "http://www.example.org/mainmodules.tests#2";

test:hello("World")
`,
					null,
					null,
					null,
					null,
					{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
				),
			'XQST0049'
		);
	});

	it('can declare a namespace', () => {
		const result = evaluateXPath(
			`
declare namespace prrt = "http://www.w3.org/2005/xpath-functions";

prrt:true()
`,
			null,
			null,
			null,
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);

		chai.assert.equal(result, true);
	});

	it('Throws the correct error when registering functions in no namespace', () => {
		chai.assert.throws(
			() =>
				evaluateXPath(
					`
declare function fn () external; 1`,
					null,
					null,
					null,
					null,
					{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
				),
			'XQST0045'
		);
	});

	it('Can do circular imports', () => {
		registerXQueryModule(`
module namespace test = "http://www.example.org/mainmodules.tests#3";

declare %public function test:AAA($a as xs:integer) as xs:string {
   if ($a < 0) then "" else "Hello " || test:BBB($a - 1)
};
`);

		registerXQueryModule(`
module namespace test = "http://www.example.org/mainmodules.tests#3";

declare %public function test:BBB($a as xs:integer) as xs:string  {
   if ($a < 0) then "" else test:AAA($a - 1) || " World"
};
`);

		finalizeModuleRegistration();

		const result = evaluateXPath(
			`
import module namespace test = "http://www.example.org/mainmodules.tests#3";

test:AAA(5)
`,
			null,
			null,
			null,
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);

		chai.assert.equal(result, 'Hello Hello Hello  World World World');
	});

	it('Can do circular imports without manually finalizing module registration', () => {
		registerXQueryModule(`
module namespace test = "http://www.example.org/mainmodules.tests#4";

declare %public function test:hello() as xs:string  {
   "Hello world!"
};
`);

		const result = evaluateXPath(
			`
import module namespace test = "http://www.example.org/mainmodules.tests#4";

test:hello()
`,
			null,
			null,
			null,
			null,
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);

		chai.assert.equal(result, 'Hello world!');
	});

	it('Hides private declarations in the same namespace', () => {
		registerXQueryModule(`
module namespace test = "http://www.example.org/mainmodules.tests#4";

declare %private function test:AAA($a as xs:integer) as xs:string {
   if ($a < 0) then "" else "Hello " || test:BBB($a - 1)
};
`);

		registerXQueryModule(`
module namespace test = "http://www.example.org/mainmodules.tests#4";

declare %public function test:BBB($a as xs:integer) as xs:string  {
   if ($a < 0) then "" else test:AAA($a - 1) || " World"
};
`);

		chai.assert.throws(() => finalizeModuleRegistration(), 'XPST0017');
	});
});

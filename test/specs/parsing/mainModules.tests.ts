import * as chai from 'chai';
import { evaluateXPath, registerXQueryModule } from 'fontoxpath';

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
});

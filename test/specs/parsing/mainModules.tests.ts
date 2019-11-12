import * as chai from 'chai';
import { registerXQueryModule, evaluateXPath } from 'fontoxpath';

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
});

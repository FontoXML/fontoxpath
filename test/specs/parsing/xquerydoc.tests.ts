import * as chai from 'chai';
import * as fs from 'fs';

import { evaluateXPath, evaluateXPathToString, registerXQueryModule } from 'fontoxpath';
import * as slimdom from 'slimdom';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe.only('xquerydoc', () => {
	it('run xQueryDoc file', () => {
		// xQueryML30
		registerXQueryModule(
			fs.readFileSync('test/specs/parsing/xquerydocument/XQueryML30.xq', 'utf8')
		);

		// XQueryParser
		registerXQueryModule(
			fs.readFileSync('test/specs/parsing/xquerydocument/xqueryparser.xq', 'utf8')
		);

		// Comments
		registerXQueryModule(
			fs.readFileSync('test/specs/parsing/xquerydocument/XQDocComments.xq', 'utf8')
		);

		// Utils
		registerXQueryModule(
			fs.readFileSync('test/specs/parsing/xquerydocument/utils.xq', 'utf8')
		);

		// XQueryDoc
		registerXQueryModule(
			fs.readFileSync('test/specs/parsing/xquerydocument/xquerydoc.xq', 'utf8')
		);

		evaluateXPath(
			`
			import module namespace xqd="http://github.com/xquery/xquerydoc";
			xqd:generate-docs("xqdoc", "let $a := 4 return $a")
			`,
			null,
			null,
			null,
			null,
			{
				debug: true,
				language: evaluateXPath.XQUERY_3_1_LANGUAGE
			}
		);
	}).timeout(60000);

	it('run xQueryDoc file without imports', () => {
		evaluateXPath(
			`
			import module namespace xqd="http://github.com/xquery/xquerydoc";
			xqd:generate-docs("xqdoc", "let $a := 4 return $a")
			`,
			null,
			null,
			null,
			null,
			{
				debug: true,
				language: evaluateXPath.XQUERY_3_1_LANGUAGE
			}
		);
	});

	it('run xQueryDoc file without imports 2', () => {
		evaluateXPath(
			`
			import module namespace xqd="http://github.com/xquery/xquerydoc";
			xqd:generate-docs("xqdoc", "let $a := 4 return $a")
			`,
			null,
			null,
			null,
			null,
			{
				debug: true,
				language: evaluateXPath.XQUERY_3_1_LANGUAGE
			}
		);
	});

	it('run xQueryDoc file without imports 3', () => {
		chai.assert.equal(
			evaluateXPathToString(
				`
				import module namespace xqd="http://github.com/xquery/xquerydoc";
				import module namespace xqp="http://github.com/jpcs/xqueryparser.xq";
		
				(: Call the documentation generator somehow. :)
				
				xqd:generate-docs("xqdoc", "let $a := 4 return $a")

				`,
				null,
				null,
				null,
				{
					debug: true,
					language: evaluateXPath.XQUERY_3_1_LANGUAGE
				}
			), "aa"
		);
	});
});

import * as chai from 'chai';
import * as fs from 'fs';

import { evaluateXPath, evaluateXPathToString, evaluateXPathToNodes, registerXQueryModule } from 'fontoxpath';
import { sync } from 'slimdom-sax-parser'
import * as slimdom from 'slimdom';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe.only('xquerydoc', () => {
	before(function () {
		this.timeout(60000);

		// xQueryML30
		registerXQueryModule(
			fs.readFileSync('test/specs/parsing/xquerydocument/XQueryML30.xq', 'utf8'), { debug: true }
		);

		// XQueryParser
		// The error is from here. Removing the debug flag here changes the deepest part from the callstack
		registerXQueryModule(
			fs.readFileSync('test/specs/parsing/xquerydocument/xqueryparser.xq', 'utf8'), { debug: true }
		);

		// Comments
		registerXQueryModule(
			fs.readFileSync('test/specs/parsing/xquerydocument/XQDocComments.xq', 'utf8'), { debug: true }
		);

		// Utils
		registerXQueryModule(
			fs.readFileSync('test/specs/parsing/xquerydocument/utils.xq', 'utf8'), { debug: true }
		);

		// XQueryDoc
		registerXQueryModule(
			fs.readFileSync('test/specs/parsing/xquerydocument/xquerydoc.xq', 'utf8'), { debug: true }
		);
	})
	it('run xQueryDoc file', () => {

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
	})

	it('run xQueryDoc file without imports 1', () => {
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

	it('run xQueryDoc file without imports, comparing output', () => {
		chai.assert.equal(
			evaluateXPathToString(
				`
				xquery version "1.0" encoding "UTF-8";

				import module namespace xqdoc="http://github.com/xquery/xquerydoc" at "xquerydoc.xq";

				xqdoc:parse("let $a := 4 return $a") 

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

	it('can create a variable', () => {
		// This seems to be the minimal repro!
		registerXQueryModule(
			`
			module namespace p="123";
			declare variable $p:x := 'a';
			declare function p:xxx(){$p:x};
			`, { debug: true }
		);
		const result = evaluateXPathToString('import module namespace p="123"; p:xxx()', null, null, null, { language: evaluateXPath.XQUERY_3_1_LANGUAGE });
		chai.assert.equal(result, 'a');
	});

	it.only('can parse the example from the existDB docs', () => {
		const example = `xquery version "1.0";

		(:~
		: This is a simple module which contains a single function
		: @author Dan McCreary
		: @version 1.0
		: @see http://xqdoc.org
		:
		:)
		module namespace simple = "http://simple.example.com";
		
		(:~
		 : this function accepts  two integers and returns the sum
		 :
		 : @param $first - the first number 
		 : @param $second - the second number
		 : @return the sum of $first and $second
		 : @author Dan McCreary
		 : @since 1.1
		 : 
		:)
		declare function simple:add($first as xs:integer, $second as xs:integer) as xs:integer {
		   $first + $second
		};`;

		const result = evaluateXPathToNodes(
			`
				xquery version "1.0" encoding "UTF-8";

				import module namespace xqdoc="http://github.com/xquery/xquerydoc" at "xquerydoc.xq";
				xqdoc:parse($module) 

				`,
			new slimdom.Document(),
			null,
			{ module: example },
			{
				debug: true,
				language: evaluateXPath.XQUERY_3_1_LANGUAGE
			}
		);

		console.log(result);

		chai.assert.equal((result[0] as slimdom.Element).outerHTML, `<xqdoc:xqdoc xmlns:xqdoc="http://www.xqdoc.org/1.0">
		<xqdoc:control>
			<xqdoc:date>Mon Mar 15 22:34:08 GMT 2010</xqdoc:date>
			<xqdoc:version>1.0</xqdoc:version>
		</xqdoc:control>
		<xqdoc:module type="library">
			<xqdoc:uri>http://simple.example.com</xqdoc:uri>
			<xqdoc:name>/db/Wiki/eXist/xqdoc/test.xqm</xqdoc:name>
	
			<xqdoc:comment>
				<xqdoc:description> This is a simple module which contains a single function</xqdoc:description>
				<xqdoc:author> Dan McCreary</xqdoc:author>
				<xqdoc:version> 1.0</xqdoc:version>
				<xqdoc:see> http://xqdoc.org</xqdoc:see>
	
			</xqdoc:comment>
			<xqdoc:body xml:space="preserve">xquery version "1.0";
	
	(:~
	: This is a simple module which contains a single function
	: @author Dan McCreary
	: @version 1.0
	: @see http://xqdoc.org
	:
	:)
	module namespace simple = "http://simple.example.com";
	
	(:~
	 : this function accepts  two integers and returns the sum
	 :
	 : @param $first - the first number 
	 : @param $second - the second number
	 : @return the sum of $first and $second
	 : @author Dan McCreary
	 : @since 1.1
	 : 
	:)
	declare function simple:add($first as xs:integer, $second as xs:integer) as xs:integer {
	   $first + $second
	};
	</xqdoc:body>
		</xqdoc:module>
		<xqdoc:functions>
			<xqdoc:function>
				<xqdoc:comment>
					<xqdoc:description> this function accepts  two integers and returns the sum</xqdoc:description>
	
					<xqdoc:author> Dan McCreary</xqdoc:author>
					<xqdoc:param> $first - the first number </xqdoc:param>
					<xqdoc:param> $second - the second number</xqdoc:param>
					<xqdoc:return> the sum of $first and $second</xqdoc:return>
					<xqdoc:since> 1.1 </xqdoc:since>
	
				</xqdoc:comment>
				<xqdoc:name>add</xqdoc:name>
				<xqdoc:signature>add($first as xs:integer, $second as xs:integer) as xs:integer</xqdoc:signature>
				<xqdoc:body xml:space="preserve">declare function simple:add($first as xs:integer, $second as xs:integer) as xs:integer{
	   $first + $second
	};</xqdoc:body>
			</xqdoc:function>
		</xqdoc:functions>
	</xqdoc:xqdoc>`);
	});
});

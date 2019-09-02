import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateXPath, evaluateXPathToNumber, evaluateXPathToString, registerXQueryModule } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('Typeswitch', () => {
	it('runs typeswitch and returns an integer', () => chai.assert.equal(
		evaluateXPathToNumber(
			`typeswitch((1,2)) 
			case xs:integer return 1
			case xs:string+ return 42
			case xs:float | xs:string return 27
			case xs:integer* return 2828
			default return 2`,
			null,
			null,
			null,
			{ debug: true, language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		), 2828));

	it('runs typeswitch and returns a string', () => chai.assert.equal(
		evaluateXPathToString(
			`typeswitch(("Hello", "Hi")) 
			case xs:integer? return "Hey"
			case xs:string+ return "Good morning"
			case xs:float return "Good afternoon"
			case xs:integer* return "Good evening"
			default return "Bye"`,
			null,
			null,
			null,
			{ debug: true, language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		), "Good morning"));


	it.only('Doing stuff', () => {

		// Hey Jos
		// Hello o/

		// So basically we're not importing these module correctly, because the functions contained
		// in them are not registered

		// The error we're getting is "Error: XQST0051: No modules found with the namespace uri XQDocComments"
		registerXQueryModule(`
			module namespace xqp="http://github.com/jpcs/xqueryparser.xq";
		`);

		// This one should regsiter the same right?
		// Can we debug this test and break on the exception? I'd like to see what is loaded in
		// globalModuleCache in the loadedModulesByNamespaceURI.

		// Not really sure, because imports from an external URL aren't used anywhere. We've seen no
		// documentation on that

		// Sure. Can you use the debugger? I don't know if you have permissions

		// The host doesn’t allow starting the debugger. If needed, ask them to enable it.
		// Option should be under settings -> liveshare: alow guest debug control

		// Marked. Try again, please. 
		// Doesn't want to start :c
		// Is this on a feature branch?
		// Can you otherwise create a feature branch and push on that? Than I run my debugger on my
		// machine.  Seems easier to get working ;)

		// Ok, will do. 

		// No, it's on master


		registerXQueryModule(`
			module namespace xqdc="http://github.com/xquery/xquerydoc";
		`);

		registerXQueryModule(`
			module namespace util="https://github.com/xquery/xquerydoc";
		`);

		registerXQueryModule(
			`
			xquery version "1.0" encoding "UTF-8";

			(:~ 
			:  This library module controls the parsing of XQuery xqdoc comments
			:  using the xquerydoc xquery library
			:
			:
			:  the following code snippet illustrates how to invoke processing to genereate xqdoc
			:
			:  xquery version "1.0" encoding "UTF-8";
			:
			:  import module namespace xqdoc="http://github.com/xquery/xquerydoc" at "/xquery/xquerydoc.xq";
			:
			:  xqp:parse-XQuery(fn:collection('/some/xquery/?select=file.xqy;unparsed=yes')) 
			:
			:  you would then transform the resultant xqdoc xml with one of the supplied stylesheets in src/lib
			:  directory
			:
			:  @author Jim Fuller, John Snelson
			:  @since Sept 18, 2011
			:  @version 0.1
			:)

			module namespace xqd="http://github.com/xquery/xquerydoc";
			declare default function namespace "http://github.com/xquery/xquerydoc";
			declare namespace doc="http://www.xqdoc.org/1.0";

			(: We're not sure if these imports are done properly :)

			import module namespace xqp="http://github.com/jpcs/xqueryparser.xq" at "https://github.com/xquery/xquerydoc/blob/master/src/xquery/parsers/xqueryparser.xq";
			import module namespace xqdc="XQDocComments" at "https://github.com/xquery/xquerydoc/blob/master/src/xquery/parsers/XQDocComments.xq";
			import module namespace util="http://github.com/xquery/xquerydoc/utils" at "https://github.com/xquery/xquerydoc/blob/master/src/xquery/utils.xq";

			declare (: private :) function _name($qname as element())
			{
			element doc:name {
				$qname/@*, fn:normalize-space($qname)
			}
			};
			declare (: private :) function _type($t as element(SequenceType)?)
			{
			if(fn:empty($t)) then () else
			element doc:type {
				if($t/OccurrenceIndicator) then
				attribute occurrence { $t/OccurrenceIndicator/TOKEN/fn:string() } else (),
				$t/(node() except OccurrenceIndicator)/descendant-or-self::text()
			}
			};
			declare (: private :) function _private($annotations as element()*)
			{
			let $names := $annotations/(URIQualifiedName|QName)
			where $names[@uri = "http://www.w3.org/2012/xquery"][@localname = "private"]
			return attribute private { "true" }
			};
			declare (: private :) function _commentContents($e)
			{
			typeswitch($e)
			case element(Char) return $e/node()
			case element(Trim) return text { "&#xa;" }
			case element(ElementContentChar) return $e/node()
			case element(QuotAttrContentChar) return $e/node()
			case element(AposAttrContentChar) return $e/node()
			case element(DirElemConstructor) return element { $e/Tag[1] } {
				for $c in $e/* return Q{http://github.com/xquery/xquerydoc}_commentContents($c)
			}
			case element(DirAttrConstructor) return attribute { $e/Tag } {
				fn:string-join(for $c in $e/* return Q{http://github.com/xquery/xquerydoc}_commentContents($c)/fn:string(), "")
			}
			default return for $c in $e/* return Q{http://github.com/xquery/xquerydoc}_commentContents($c)
			};
			declare (: private :) function _comment($e as element()+)
			{
			for $text in $e/(node()[1]/self::text()|preceding-sibling::text()[1])
			let $markup := xqdc:parse-Comments($text)
			for $comment in ($markup/XQDocComment)[fn:last()]
			return element doc:comment {
				if($comment/Contents) then element doc:description {
				_commentContents($comment/Contents)
				} else (),
				for $tag in $comment/TaggedContents
				let $name := $tag/Tag/fn:string()
				return if($name = ("author", "version", "param", "return", "error", "deprecated", "see", "since"))
				then element { fn:QName("http://www.xqdoc.org/1.0", fn:concat("doc:", $name)) } {
					_commentContents($tag/Contents)
				} else element doc:custom {
					attribute tag { $name },
					_commentContents($tag/Contents)
				}
			}
			};
			(:~ 
			: main entrypoint into xquerydoc
			:
			: @param xquery parsed as string
			: 
			: @returns element(doc:xqdoc)
			:)
			declare function parse($module as xs:string) as element(doc:xqdoc)
			{
			parse($module,'')
			};
			(:~ 
			:  main entrypoint into xquerydoc
			:
			: @param xquery parsed as string
			: 
			: @returns element(doc:xqdoc)
			:)
			declare function parse($module as xs:string, $mode as xs:string) as element(doc:xqdoc)
			{
			let $markup := xqp:parse($module)
			let $module := $markup/Module/(MainModuleSequence/MainModule | MainModule | LibraryModule)
			return element doc:xqdoc {
				element doc:control {
				comment { "Generated by xquerydoc: http://github.com/xquery/xquerydoc" },
				element doc:date { if($mode eq 'test') then () else fn:current-dateTime() },
				element doc:version { "N/A" }
				},
				element doc:module {
				attribute type { if($module/self::MainModule) then "main" else if($module/self::LibraryModule) then "library" else "error" },
				element doc:uri { $module/ModuleDecl/URILiteral/@value/fn:string() },
				if($module/(ModuleDecl | self::MainModule/Prolog/Import/ModuleImport|self::LibraryModule)) 
				then _comment($module/(ModuleDecl | self::MainModule/Prolog/Import/ModuleImport|self::LibraryModule)) 
				else ()
				(: TBD name and body - jpcs :)
				},
				(: TBD imports - jpcs :)
				element doc:variables {
				for $v in $module/Prolog/AnnotatedDecl/VarDecl
				return element doc:variable {
					_private($v/../Annotation),
					_name($v/VarName/(URIQualifiedName|QName)),
					_type($v/TypeDeclaration/SequenceType),
					_comment($v/..)
				}
				},
				element doc:functions {
				for $f in $module/Prolog/AnnotatedDecl/FunctionDecl
				return element doc:function {
					attribute arity { fn:count($f/ParamList/Param) },
					_private($f/../Annotation),
					_comment($f/..),
					_name($f/(URIQualifiedName|QName)),
					element doc:signature {
					fn:string-join(("(", $f/ParamList/fn:string(), "&#10;)",
						if($f/SequenceType) then (" as ", $f/SequenceType/fn:string()) else ()
						), "")
					},
					if($f/ParamList) then element doc:parameters {
					for $p in $f/ParamList/Param
					return element doc:parameter {
						_name($p/(URIQualifiedName|QName)),
						_type($p/TypeDeclaration/SequenceType)
					}
					} else (),
					if($f/SequenceType) then element doc:return {
					_type($f/SequenceType)
					} else ()
					(: TBD invoked and ref-variable - jpcs :)
					(: TBD body - jpcs :)
				}
				}
			(: element doc:body {
			}:)
			}
			};
			(:~ 
			:  example function for generating html from within XQuery, will need to employ processor specific method of invoking XSLT 
			:
			: @param type determining xquery main or library module  
			: @param xquery parsed as xqdoc
			: 
			: @returns element(html:html)
			:)
			declare function generate-docs($format,$xqdoc ){
			util:generate-html-module($xqdoc)
			};
			`
		);

		evaluateXPath(
			`generate-docs("let $a := 4;")`,
			null,
			null,
			null,
			null,
			{ debug: true, language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);
	});
});

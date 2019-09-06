xquery version "1.0";

(:
 : Licensed under the Apache License, Version 2.0 (the "License");
 : you may not use this file except in compliance with the License.
 : You may obtain a copy of the License at
 :
 :     http://www.apache.org/licenses/LICENSE-2.0
 :
 : Unless required by applicable law or agreed to in writing, software
 : distributed under the License is distributed on an "AS IS" BASIS,
 : WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 : See the License for the specific language governing permissions and
 : limitations under the License.
 :)

(:~
 : <h1>xqueryparser.xq</h1>
 : <p>A parser for XQuery 3.0, XQuery Update, XQuery Full Text, and MarkLogic XQuery extensions.</p>
 :
 :  @author John Snelson
 :  @since Feb 17, 2012
 :  @version 0.2
 :)
module namespace xqp="http://github.com/jpcs/xqueryparser.xq";
declare default function namespace "http://github.com/jpcs/xqueryparser.xq";

import module namespace p="XQueryML30" at "XQueryML30.xq";

(:~
 : Parses the XQuery module in the string argument. The module string
 : is returned marked up in elements, with attributes adding statically
 : analysed values like unescaped string values, and lexical QNames
 : resolved to expanded QNames.
 :
 : @param $module: XQuery module passed as a string
 :
 : @return A marked up copy of the XQuery module, or an error element
 : detailing the parse error encountered.
 :)
declare function parse($module as xs:string) as element()
{
  let $markup := p:parse-XQuery($module)
  let $markup := _simplify($markup)
  (: let $markup := _combine($markup,()) :) (: Causes stack overflow - jpcs :)
  let $ns := _build_namespaces($markup)
  let $markup := _analyze($markup,$ns)
  return $markup
};

(:~ Simplify the markup to remove unneeded elements :)
declare (: private :) function _simplify($nodes)
{
  for $n in $nodes
  return typeswitch($n)
    case element() return
      typeswitch($n)
      case element(EOF) return ()
      case element(MainModuleSequence) return _process_skip($n)
      case element(Setter) return _process_skip($n)
      case element(Import) return _process_skip($n)
      case element(QueryBody) return _process_skip($n)
      case element(Expr) return _process_skip($n)
      case element(ExprSingle) return _process_skip($n)
      case element(EnclosedExprExtended) return _process_skip($n)
      case element(InitialClause) return _process_skip($n)
      case element(IntermediateClause) return _process_skip($n)
      case element(OrExpr) return _process_skip($n)
      case element(AndExpr) return _process_skip($n)
      case element(ComparisonExpr) return _process_skip($n)
      case element(StringConcatExpr) return _process_skip($n)
      case element(RangeExpr) return _process_skip($n)
      case element(AdditiveExpr) return _process_skip($n)
      case element(MultiplicativeExpr) return _process_skip($n)
      case element(UnionExpr) return _process_skip($n)
      case element(IntersectExceptExpr) return _process_skip($n)
      case element(InstanceofExpr) return _process_skip($n)
      case element(TreatExpr) return _process_skip($n)
      case element(CastableExpr) return _process_skip($n)
      case element(CastExpr) return _process_skip($n)
      case element(UnaryExpr) return _process_skip($n)
      case element(ValueExpr) return _process_skip($n)
      case element(PathExpr) return _process_skip($n)
      case element(RelativePathExpr) return _process_skip($n)
      case element(StepExpr) return _process_skip($n)
      case element(NodeTest) return _process_skip($n)
      case element(PostfixExpr) return _process_skip($n)
      case element(PredicateList) return _process_skip($n)
      case element(PrimaryExpr) return _process_skip($n)
      case element(Literal) return _process_skip($n)
      case element(NumericLiteral) return _process_skip($n)
      case element(Argument) return _process_skip($n)
      case element(Constructor) return _process_skip($n)
      case element(DirectConstructor) return _process_skip($n)
      case element(QuotAttrValueContent) return _process_skip($n)
      case element(AposAttrValueContent) return _process_skip($n)
      case element(DirElemContent) return _process_skip($n)
      case element(CommonContent) return _process_skip($n)
      case element(ComputedConstructor) return _process_skip($n)
      case element(ItemType) return _process_skip($n)
      case element(KindTest) return _process_skip($n)

      case element(FTContainsExpr) return _process_skip($n)
      case element(FTSelection) return _process_skip($n)
      case element(FTOr) return _process_skip($n)
      case element(FTAnd) return _process_skip($n)
      case element(FTMildNot) return _process_skip($n)
      case element(FTUnaryNot) return _process_skip($n)
      case element(FTPrimaryWithOptions) return _process_skip($n)
      case element(FTPrimary) return _process_skip($n)
      case element(FTWords) return _process_skip($n)
      case element(FTPosFilter) return _process_skip($n)
      case element(FTMatchOption) return _process_skip($n)

      case element(EQName) return _process_skip($n)
      case element(FunctionName) return _process_skip($n)

      case element(PredefinedEntityRef) return
        element { fn:node-name($n) } {
          attribute value { _unescape_helper($n,"") },
          $n/node()
        }
      case element(CharRef) return
        element { fn:node-name($n) } {
          attribute value { _unescape_helper($n,"") },
          $n/node()
        }
      case element(StringLiteral) return
        element { fn:node-name($n) } {
          attribute value { _unescape_string($n) },
          $n/node()
        }
      case element(URILiteral) return
        element { fn:node-name($n) } {
          attribute value { fn:normalize-space(_unescape_string($n)) },
          $n/node()
        }

      default return _process_copy($n)
    default return $n
};

declare (: private :) function _process_skip($n)
{
  if(fn:empty($n/*[2])) then _simplify($n/*)
  else _process_copy($n)
};

declare (: private :) function _process_copy($n)
{
  element { fn:node-name($n) } {
    $n/@*,
    _simplify($n/node())
  }
};

(:~ Combine QuotAttrContentChar, AposAttrContentChar, and ElementContentChar into usable values :)
declare (: private :) function _combine($node, $group)
{
  typeswitch($node)
    case element() return typeswitch($node)
      case element(QuotAttrContentChar) return
        _combine($node/following-sibling::node()[1],($group,$node))
      case element(AposAttrContentChar) return
        _combine($node/following-sibling::node()[1],($group,$node))
      case element(ElementContentChar) return
        _combine($node/following-sibling::node()[1],($group,$node))
      default return (
        _combine_group($group),
        element { fn:node-name($node) } {
          $node/@*,
          _combine($node/node()[1],())
        },
        _combine($node/following-sibling::node()[1],())
      )
    case node() return (
      _combine_group($group),
      $node,
      _combine($node/following-sibling::node()[1],())
    )
    default return
      _combine_group($group)
};

declare (: private :) function _combine_group($group)
{
  typeswitch($group)
    case element()+ return element Content { for $g in $group return $g/text() }
    default return $group
};

(:~ Build the namespace map :)
declare (: private :) function _build_namespaces($n)
{
  let $marklogic := fn:false()
  let $ns := (
    (: Pre-declared bindings :)
    <ns prefix="xml" uri="http://www.w3.org/XML/1998/namespace"/>,
    <ns prefix="xs" uri="http://www.w3.org/2001/XMLSchema"/>,
    <ns prefix="xsi" uri="http://www.w3.org/2001/XMLSchema-instance"/>,
    <ns prefix="fn" uri="http://www.w3.org/2005/xpath-functions"/>,
    <ns prefix="local" uri="http://www.w3.org/2005/xquery-local-functions"/>,
    if($marklogic) then (
      <ns prefix="err" uri="http://www.w3.org/2005/xqt-errors"/>,
      <ns prefix="xdmp" uri="http://marklogic.com/xdmp"/>,
      <ns prefix="cts" uri="http://marklogic.com/cts"/>,
      <ns prefix="sec" uri="http://marklogic.com/xdmp/security"/>,
      <ns prefix="error" uri="http://marklogic.com/xdmp/error"/>,
      <ns prefix="dir" uri="http://marklogic.com/xdmp/directory"/>,
      <ns prefix="dav" uri="DAV:"/>,
      <ns prefix="lock" uri="http://marklogic.com/xdmp/lock"/>,
      <ns prefix="prop" uri="http://marklogic.com/xdmp/property"/>,
      <ns prefix="spell" uri="http://marklogic.com/xdmp/spell"/>,
      <ns prefix="math" uri="http://marklogic.com/xdmp/math"/>,
      <ns prefix="dbg" uri="http://marklogic.com/xdmp/debug"/>,
      <ns prefix="prof" uri="http://marklogic.com/xdmp/profile"/>,
      <ns prefix="map" uri="http://marklogic.com/xdmp/map"/>
    ) else ()
  )
  let $ns := (
    for $d in $n/Module/LibraryModule/ModuleDecl
    return (<ns prefix="{ $d/NCName/NCName }"
                uri="{ $d/URILiteral/@value }"/>,
            if($marklogic) then <function uri="{ $d/URILiteral/@value }"/> else ()),
    $ns
  )
  let $ns := (
    for $d in $n/Module/LibraryModule/Prolog/NamespaceDecl
    return <ns prefix="{ $d/NCName/NCName }"
               uri="{ $d/URILiteral/@value }"/>,
    $ns
  )
  let $ns := (
    for $d in $n/Module/LibraryModule/Prolog/SchemaImport[SchemaPrefix]
    return
      if($d/SchemaPrefix/NCName) then
        <ns prefix="{ $d/SchemaPrefix/NCName/NCName }"
            uri="{ $d/URILiteral[1]/@value }"/>
      else <element uri="{ $d/URILiteral[1]/@value }"/>,
    $ns
  )
  let $ns := (
    for $d in $n/Module/LibraryModule/Prolog/ModuleImport[NCName]
    return <ns prefix="{ $d/NCName/NCName }"
               uri="{ $d/URILiteral[1]/@value }"/>,
    $ns
  )
  let $ns := (
    for $d in $n/Module/LibraryModule/Prolog/DefaultNamespaceDecl
    return
      if($d/TOKEN[3] eq "function") then
        <function uri="{ $d/URILiteral/@value }"/>
      else <element uri="{ $d/URILiteral/@value }"/>,
    $ns
  )
  return $ns
};

declare (: private :) function _unescape_string($s as xs:string)
{
  let $quot := fn:substring($s,1,1)
  let $s := fn:substring($s,2,fn:string-length($s) - 2)
  return fn:string-join(_unescape_helper($s,$quot),"")
};

declare (: private :) function _unescape_helper(
  $s as xs:string,
  $quot as xs:string
)
{
  if(fn:string-length($s) = 0) then (
    (: Do nothing :)
  ) else if($quot != "" and fn:starts-with($s,$quot)) then (
    fn:substring($s,2,1),
    _unescape_helper(fn:substring($s,3),$quot)
  ) else if(fn:starts-with($s,"&amp;lt;")) then (
    "&lt;",
    _unescape_helper(fn:substring($s,5),$quot)
  ) else if(fn:starts-with($s,"&amp;gt;")) then (
    "&gt;",
    _unescape_helper(fn:substring($s,5),$quot)
  ) else if(fn:starts-with($s,"&amp;amp;")) then (
    "&amp;",
    _unescape_helper(fn:substring($s,6),$quot)
  ) else if(fn:starts-with($s,"&amp;apos;")) then (
    "&apos;",
    _unescape_helper(fn:substring($s,7),$quot)
  ) else if(fn:starts-with($s,"&amp;quot;")) then (
    "&quot;",
    _unescape_helper(fn:substring($s,7),$quot)
  ) else if(fn:starts-with($s,"&amp;#x")) then (
    fn:codepoints-to-string(_decodeHexString(fn:substring-before(fn:substring($s,4), ";"))),
    _unescape_helper(fn:substring-after($s,";"),$quot)
  ) else if(fn:starts-with($s,"&amp;#")) then (
    fn:codepoints-to-string(xs:integer(fn:substring-before(fn:substring($s,3), ";"))),
    _unescape_helper(fn:substring-after($s,";"),$quot)
  ) else (
    fn:substring($s,1,1),
    _unescape_helper(fn:substring($s,2),$quot)
  )
};

declare (:private:) function _decodeHexChar($val as xs:integer)
  as xs:integer
{
  let $tmp := $val - 48 (: '0' :)
  let $tmp := if($tmp <= 9) then $tmp else $tmp - (65-48-10) (: 'A'-'0'-10 :)
  let $tmp := if($tmp <= 15) then $tmp else $tmp - (97-65) (: 'a'-'A' :)
  return $tmp
};

declare (:private:) function _decodeHexStringHelper($chars as xs:integer*, $acc as xs:integer)
  as xs:integer
{
  if(fn:empty($chars)) then $acc
  else _decodeHexStringHelper(fn:remove($chars,1), ($acc * 16) + _decodeHexChar($chars[1]))
};

declare (:private:) function _decodeHexString($val as xs:string)
  as xs:integer
{
  _decodeHexStringHelper(fn:string-to-codepoints($val), 0)
};

(:~ Perform namespace analysis and QName resolution :)
declare (: private :) function _analyze($nodes, $ns)
{
  for $n in $nodes
  return typeswitch($n)
    case element() return typeswitch($n)
      case element(QName) return
        element { fn:node-name($n) } {
          $n/@*, _resolve_qname($n,$ns), $n//text()
        }
      case element(FunctionQName) return
        element { fn:node-name($n) } {
          $n/@*, _resolve_qname($n,$ns), $n//text()
        }
      case element(URIQualifiedName) return
        element { fn:node-name($n) } {
          $n/@*,
          let $parts := fn:tokenize($n,":")
          let $localname := $parts[fn:last()]
          let $uri := _unescape_string(fn:string-join($parts[fn:position() < fn:last()],":"))
          return (
            attribute prefix { "" },
            attribute uri { $uri },
            attribute localname { $localname }
          ),
          $n//text()
        }
      (: TBD DirAttributeList namespace attrs - jpcs :)
      default return
        element { fn:node-name($n) } {
          $n/@*,
          _analyze($n/node(),$ns)
        }
    default return $n
};

declare (: private :) function _resolve_qname($n, $ns)
{
  let $qname := fn:string($n//(QName|TOKEN))
  let $prefix := fn:substring-before($qname,":")
  let $localname := fn:substring-after($qname,":")
  let $localname := if($localname="") then $qname else $localname
  let $uri :=
    if($prefix != "") then fn:string($ns[@prefix=$prefix][1]/@uri)
    else if($n/(parent::FunctionCall|
                parent::FunctionDecl|
                parent::LiteralFunctionItem))
      then fn:string(($ns/self::function)[1]/@uri)
    else if($n/(parent::DirElemConstructor|
                parent::CompElemConstructor|
                parent::AtomicOrUnionType|
                parent::ElementName|
                parent::TypeName))
      then fn:string(($ns/self::element)[1]/@uri)
    else if($n/(parent::OptionDecl|
                parent::Annotation))
      then "http://www.w3.org/2012/xquery"
    else if($n/(parent::NameTest) and fn:not(
        $n/../preceding-sibling::TOKEN = "@" or
        $n/../preceding-sibling::ForwardAxis/TOKEN = "attribute"
      ))
      then fn:string(($ns/self::element)[1]/@uri)
    else ""
  return (
    attribute prefix { $prefix },
    attribute uri { $uri },
    attribute localname { $localname }
  )
};

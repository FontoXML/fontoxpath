{
	function appendRest (arr, optionalArr) {
		if (!optionalArr) {
			return arr;
		}
		return arr.concat(optionalArr);
	}

	function accumulateDirContents (parts) {
		if (!parts.length) {
			return [];
		}
		var result = [parts[0]];
		for (var i = 1; i < parts.length; ++i) {
			if (typeof result[result.length-1] === "string" && typeof parts[i] === "string") {
				result[result.length-1] += parts[i];
				continue;
			}
			result.push(parts[i]);
		}
		return result;
	}
}

// 1
XPath
 = _ expr:Expr _ {return expr}

// 2
ParamList
 = start:Param rest:( _ "," _ param:Param {return param} )* {return appendRest([start], rest)}

// 3
Param
 = "$" name:EQName type:TypeDeclaration? {return [name, type || "item()"]}

// 4
FunctionBody
 = EnclosedExpr

// 5

EnclosedExpr
 = "{" _ e:Expr? _ "}" {return e || ["sequence"]}

// 6
Expr
 = first:ExprSingle rest:( _ "," _ expr:ExprSingle {return expr})* {return rest.length ? appendRest(["sequence", first], rest) : first}

// 7 (Note: ordering changed because of greediness)
ExprSingle
 = LetExpr
 / QuantifiedExpr
 / IfExpr
 / ForExpr
 / OrExpr

// 8
ForExpr = clauses:SimpleForClause S "return" AssertAdjacentOpeningTerminal _ returnExpr:ExprSingle {
	// The bindings part consists of the rangeVariable and the bindingSequence.
	// Multiple bindings are syntactic sugar for 'for $x in 1 return for $x in $y return $x * 2'
	return clauses.reduceRight(function (expression, clause) {
	    return ["forExpression"].concat(clause, [expression]);
	 }, returnExpr)
  }

// 9
SimpleForClause = "for" S first:SimpleForBinding rest:( _ "," _ b:SimpleForBinding {return b})* {return [first].concat(rest)}

// 10
SimpleForBinding = "$" varName:VarName S "in" S expr:ExprSingle {return [varName, expr]}

// 11
LetExpr
= bindings:SimpleLetClause _ "return" AssertAdjacentOpeningTerminal _ returnExpr:ExprSingle {
	// The bindings part consists of the rangeVariable and the bindingSequence.
	// Multiple bindings are syntactic sugar for 'let $x := 1 return let $y := $x * 2'
	return bindings.reduceRight(function (expression, binding) {
	    return ["let"].concat(binding, [expression]);
	 }, returnExpr)
  }

// 12
SimpleLetClause = "let" _ first:SimpleLetBinding rest:( _ "," _ binding:SimpleLetBinding {return binding})* {return appendRest([first], rest)}

// 13
SimpleLetBinding = "$" rangeVariable:VarName _ ":=" _ bindingSequence:ExprSingle {return [rangeVariable, bindingSequence]}

// 14
QuantifiedExpr
 = kind:("some" / "every") S "$" varName:VarName S "in" S exprSingle:ExprSingle restExpr:("," _ "$" name:VarName S "in" S expr:ExprSingle {return [name, expr]})* S "satisfies" S satisfiesExpr:ExprSingle {return ["quantified", kind, [[varName, exprSingle]].concat(restExpr), satisfiesExpr]}

// 15
IfExpr
 = "if" _ "(" _ testExpr:Expr _ ")" _ "then" AssertAdjacentOpeningTerminal _ thenExpr:ExprSingle _ "else" AssertAdjacentOpeningTerminal _ elseExpr:ExprSingle {return ["conditional", testExpr, thenExpr, elseExpr]}

// 16
OrExpr
 = first:AndExpr rest:( _ "or" AssertAdjacentOpeningTerminal _ expr:AndExpr {return expr})* {return rest.length ? appendRest(["or", first], rest) : first}

// 17
AndExpr
 = first:ComparisonExpr rest:( _ "and" AssertAdjacentOpeningTerminal _ expr:ComparisonExpr {return expr})* {return rest.length ? appendRest(["and", first], rest) : first}

// 18
ComparisonExpr
 = lhs:StringConcatExpr _ op:(ValueComp / GeneralComp / NodeComp) _ rhs:StringConcatExpr {return ["compare", op, lhs, rhs]} // Note: the whole 1<2<3 shenanigan is removed from 3.1
 / StringConcatExpr

// 19
StringConcatExpr
 = first:RangeExpr rest:( _ "||" _ expr:RangeExpr {return expr})* {
     if (!rest.length) return first;
	 var args = [first].concat(rest);
     return appendRest(["functionCall", ["namedFunctionRef", [null, null, "concat"], args.length], args])
   }

// 20
RangeExpr
 = lhs:AdditiveExpr rhs:( _ "to" AssertAdjacentOpeningTerminal _ rhs:AdditiveExpr {return rhs})? {return rhs === null ? lhs : ["functionCall", ["namedFunctionRef", ["op", null, "to"], 2], [lhs, rhs]]}

// 21
AdditiveExpr
 = lhs:MultiplicativeExpr _ op:("-" / "+") _ rhs:AdditiveExpr {return ["binaryOperator", op, lhs, rhs]}
 / MultiplicativeExpr

// 22
multiplicativeExprOp
 = op:("*" / ( op:("div" / "idiv" / "mod") AssertAdjacentOpeningTerminal {return op}))
MultiplicativeExpr
 = lhs:UnionExpr rest:( _ op:multiplicativeExprOp _ rhs:UnionExpr {return {op: op, rhs: rhs}})* {
		return rest.length === 0 ? lhs : rest.reduce(function (inner, nesting) {
			return ["binaryOperator", nesting.op, inner, nesting.rhs]
		}, lhs)
	}

// 23
UnionExpr
 = first:IntersectExpr rest:( _ ("|"/("union" AssertAdjacentOpeningTerminal)) _ expr:IntersectExpr {return expr})+ {return appendRest(["union", first], rest)}
 / IntersectExpr

// 24 Note: was InstanceofExpr ("intersect"/"except" InstanceofExpr)*, but this does not work out with () intersect () except ().
IntersectExpr
 = lhs:InstanceofExpr rhs:(_ type:("intersect" / "except") AssertAdjacentOpeningTerminal _ rhs:IntersectExpr {return [type, rhs]})? {
     return rhs === null ? lhs : ["intersectExcept", rhs[0], lhs, rhs[1]]
   }

// 25
InstanceofExpr
 = lhs:TreatExpr rhs:(_ "instance" S "of" AssertAdjacentOpeningTerminal _ rhs:SequenceType {return rhs})? {return rhs ? ["instance of", lhs, rhs] : lhs}
 / TreatExpr

// 26
TreatExpr
// = lhs:CastableExpr _ "treat" S "as" AssertAdjacentOpeningTerminal _ rhs:SequenceType {return ["treat as", lhs, rhs]}
 = CastableExpr

// 27
CastableExpr
 = lhs:CastExpr rhs:(_ "castable" S "as" AssertAdjacentOpeningTerminal _ rhs:SingleType {return rhs})? {return rhs ? ["castable as", lhs, rhs] : lhs}

// 28
CastExpr
 = lhs:ArrowExpr rhs:(_ "cast" S "as" AssertAdjacentOpeningTerminal _ rhs:SingleType {return rhs})? {return rhs ? ["cast as", lhs, rhs] : lhs}

// 29
ArrowExpr
 = lhs:UnaryExpr functionParts:( _ "=>" _ functionName:ArrowFunctionSpecifier _ argumentList:ArgumentList _ {return [functionName, argumentList]})* {
     if (!functionParts.length) return lhs;
     return functionParts.reduce(function (previousFunction, functionPart) {
       var args = [previousFunction].concat(functionPart[1]);
       return ["functionCall", ["namedFunctionRef", functionPart[0], args.length], args];
     }, lhs);
   }

// 30
UnaryExpr
 = "-" expr:UnaryExpr {return ["unaryMinus", expr]}
 / "+" expr:UnaryExpr {return ["unaryPlus", expr]}
 / ValueExpr

// 31
ValueExpr = SimpleMapExpr

// 32
GeneralComp = op:("=" / "!=" / "<=" / "<" / ">=" / ">") {return ["generalCompare", op]}

// 33
ValueComp = op:("eq" / "ne" / "lt" / "le" / "gt" / "ge") AssertAdjacentOpeningTerminal {return ["valueCompare", op]}

// 34
NodeComp = op:((op:"is" AssertAdjacentOpeningTerminal {return op}) / "<<" / ">>") {return ["nodeCompare", op]}

// 35
SimpleMapExpr
 = lhs:PathExpr parts:( _ "!" _ expr:PathExpr {return expr})* {
     if (!parts.length) return lhs;
     return parts.reduce(function (previousMap, expression) {
         return ["simpleMap", previousMap, expression]
     }, lhs);
   }

// 36-46 (simplified)
PathExpr
 = RelativePathExpr
 / AbsoluteLocationPath

// 37
RelativePathExpr
 = lhs:StepExpr _ abbrev:LocationPathAbbreviation _ rhs:RelativePathExpr {return ["path", lhs, abbrev].concat(rhs[0] === "path" ? rhs.slice(1) : [rhs])}
 / lhs:StepExpr _ "/" _ rhs:RelativePathExpr {return ["path", lhs].concat(rhs[0] === "path" ? rhs.slice(1) : [rhs])}
 / StepExpr

// 38
StepExpr
 = PostfixExpr
 / AxisStep

AbsoluteLocationPath
 = "/" _ path:RelativePathExpr { return ["absolutePath", path] }
 / abbrev:LocationPathAbbreviation _ path: RelativePathExpr { return ["absolutePath", ["path", abbrev].concat(path[0] === "path" ? path.slice(1) : [path])] }
 / "/" { return ["absolutePath", ["path", ["self", ["kindTest", "document-node()"]]]] }

LocationPathAbbreviation
 = "//" {return ["descendant-or-self", ["kindTest", "node()"]]}

// 39
AxisStep
 = axis:Axis test:NodeTest predicates:Predicate* {
     if (!predicates.length) {
       return [axis, test];
     }
     return predicates.reduce(function (accumulator, current) {return ["filter", accumulator, current]}, [axis, test])
   }
 / AbbreviatedStep

Axis
 = name:AxisName "::" {return name}
 / "@" {return "attribute"}
 / "" {return "child"}

AxisName
 = "ancestor-or-self"
 / "ancestor"
 / "attribute"
 / "child"
 / "decendant"
 / "following-sibling"
 / "descendant-or-self"
 / "descendant"
 / "following"
 / "parent"
 / "preceding-sibling"
 / "self"

AbbreviatedStep
 = ".." {return ["parent", ["kindTest", "node()"]]}

// 46
NodeTest = KindTest / nameTest:NameTest {return ["nameTest", nameTest]}

// 47
NameTest = WildCard / EQName

// 48
WildCard =  "*:" name:NCName {return ['*', null, name]}
 / "*" {return ['*', null, '*']}
 / uri:BracedURILiteral "*" {return [null, uri, name]}
 / prefix:NCName ":*" {return [prefix, null, '*']}

// 49
PostfixExpr
 = expr:PrimaryExpr postfixExpr:(
   (_ filter:Predicate {return ["filter", filter]}) /
   (_ argList:ArgumentList {return ["functionCall", argList]}) /
   (_ lookup:Lookup {return ["lookup", lookup]})
   )* {return postfixExpr.length ? postfixExpr.reduce(function (accumulator, currentExpr) { currentExpr.splice(1, 0, accumulator); return currentExpr}, expr) : expr}

// 50
ArgumentList
 = "(" _ args:(first:Argument rest:( _ "," _ arg:Argument {return arg})* {return appendRest([first], rest)})? _ ")" {return args||[]}

// 51 (Not implemented)
// PredicateList ::= Predicate*

// 52
Predicate
 = "[" _ e:Expr _ "]" {return e};

// 53
Lookup = "?" key:KeySpecifier {return key}

// 54
KeySpecifier = NCName / VarRef / ParenthesizedExpr / "*"

// 55
ArrowFunctionSpecifier = EQName / VarRef / ParenthesizedExpr

// 56
PrimaryExpr
 = Literal
 / VarRef
 / ParenthesizedExpr
 / ContextItemExpr
 / FunctionCall
 / NodeConstructor
 / FunctionItemExpr
 / MapConstructor
 / ArrayConstructor
// / UnaryLookup

// 57
Literal = NumericLiteral / StringLiteral

// 58 Note: changes because double accepts less than decimal, accepts less than integer
NumericLiteral = literal:(DoubleLiteral / DecimalLiteral / IntegerLiteral) ![a-zA-Z] {return literal}

// 59
VarRef
 = "$" varName:VarName {return ["varRef", varName]}

// 60
VarName
 = EQName

// 61
ParenthesizedExpr
 = "(" _ expr:Expr _ ")" {return expr}
 / "(" _ ")" {return ["sequence"]}

// 62
// Do not match '..'
ContextItemExpr
 = "." !"." {return ["self", ["typeTest", [null, null, "item()"]]]}

// 63
FunctionCall
// Do not match reserved function names as function names, they should be tests or other built-ins.
// Match the '(' because 'elementWhatever' IS a valid function name
 = !(ReservedFunctionNames _ "(") name:EQName _ args:ArgumentList {return ["functionCall", ["namedFunctionRef", name, args.length], args]}

// 64
Argument
 = ArgumentPlaceholder
 / ExprSingle

// 65
ArgumentPlaceholder
 = "?" {return "argumentPlaceholder"}

// 66
FunctionItemExpr
 = NamedFunctionRef
 / InlineFunctionExpr

// 67
NamedFunctionRef
 = name:EQName "#" integer:IntegerLiteral {return ["namedFunctionRef", name, integer[1]]}

// 68
InlineFunctionExpr
 = "function" _ "(" _ params:ParamList? _ ")" _ returnType:( "as" S t:$SequenceType _ {return t})? body:FunctionBody {return ["inlineFunction", params || [], returnType || "item()*", body]}

// 69
MapConstructor
 = "map" _ "{" _ entries:(first:MapConstructorEntry rest:(_ "," _ e:MapConstructorEntry {return e})*{return appendRest([first], rest)})? _ "}" {return appendRest(["mapConstructor"], entries)}

// 70
MapConstructorEntry
 = k:MapKeyExpr _ ":" _ v:MapValueExpr {return [k, v]}

// 71
MapKeyExpr
 = ExprSingle

// 72
MapValueExpr
 = ExprSingle

// 73
ArrayConstructor
 = SquareArrayConstructor
 / CurlyArrayConstructor

// 74
SquareArrayConstructor
 = "[" _ entries:(first:ExprSingle _ rest:("," _ e:ExprSingle _ {return e})* {return appendRest([first], rest)})? "]" {return ["arrayConstructor", "square"].concat(entries || [])}

// 75
CurlyArrayConstructor
 = "array" _ e:EnclosedExpr {return ["arrayConstructor", "curly", e]}

// 76 (Not implemented)
// UnaryLookup ::= "?" KeySpecifier

// 77
SingleType
 = typeName:SimpleTypeName multiplicity:"?"? {return [typeName, !!multiplicity]}

// 78
TypeDeclaration
 = S "as" S st:$SequenceType {return st}

// 79
SequenceType
 = "empty-sequence()" {return ["empty-sequence()", "0"]}
 / type:ItemType _ occurence:OccurenceIndicator? {return [type, occurence]}

// 80
OccurenceIndicator = "?" / "*" / "+"

// 81
ItemType
 = KindTest
 / "item()" {return ["typeTest", [null, null, "item()"]]}
 / FunctionTest
 / MapTest
 / ArrayTest
 / AtomicOrUnionType
 / ParenthesizedItemType

// 82
AtomicOrUnionType = typeName:EQName {return ["typeTest", typeName]}

// 83
KindTest
 = DocumentTest
 / ElementTest
 / AttributeTest
 / SchemaElementTest {return "unsupported"}
 / SchemaAttributeTest {return "unsupported"}
 / PITest
 / CommentTest
 / TextTest
 / NamespaceNodeTest {return "unsupported"}
 / AnyKindTest

// 84
AnyKindTest
 = "node()" {return ["kindTest", "node()"]}

// 85
DocumentTest
 = "document-node(" _ innerTest:(ElementTest / SchemaElementTest)? _ ")" {return ["kindTest", "document-node()", innerTest]}
 / "document-node()" {return ["kindTest", "document-node()"]}

// 86
TextTest
 = "text()" {return ["kindTest", "text()"]}

// 87
CommentTest
 = "comment()" {return ["kindTest", "comment()"]}

// 88
NamespaceNodeTest
 = "namespace-node()" {return ["kindTest", "namespace-node()"]}

// 89
// Let's keep it simple: only accept NCNames, optionally quoted, since quoted non-ncnames should throw a typeError later anyway
PITest
 = "processing-instruction(" _ target:NCName _ ")" {return ["kindTest", "processing-instruction()", target]}
 / "processing-instruction(" _ literal:StringLiteral _ ")" {return ["kindTest", "processing-instruction()", literal[1]]}
 / "processing-instruction()" {return ["kindTest", "processing-instruction()"]}

// 90
AttributeTest
 = "attribute(" _ name:AttribNameOrWildCard _ "," _ type:TypeName _ ")" {return ["kindTest", "attribute()", name, type]}
 / "attribute(" _ name:AttribNameOrWildCard _ ")" {return ["kindTest", "attribute()", name]}
 / "attribute()" {return ["kindTest", "attribute()"]}

// 91
AttribNameOrWildCard = AttributeName / ("*" {return ["*", null, "*"]})

// 92
SchemaAttributeTest
 = "schema-attribute(" _ decl:AttributeDeclaration _ ")" {return ["kindTest", "schema-attribute()", decl]}

// 93
AttributeDeclaration = AttributeName

// 94
ElementTest
 = "element" _ "(" _ name:ElementNameOrWildCard _ "," _ type:TypeName _ ")" {return ["kindTest", "element()", name, type]}
 / "element" _ "(" _ name:ElementNameOrWildCard _ ")" {return ["kindTest", "element()", name]}
 / "element" _ "(" _ ")" {return ["kindTest", "element()"]}

// 95
ElementNameOrWildCard = ElementName / ("*" {return ["*", null, "*"]})

// 96
SchemaElementTest = "schema-element(" ElementDeclaration ")"

// 97
ElementDeclaration = ElementName

// 98
AttributeName = EQName

// 99
ElementName = EQName

// 100
SimpleTypeName = TypeName

// 101
TypeName = EQName

// 102
FunctionTest = AnyFunctionTest / TypedFunctionTest

// 103
AnyFunctionTest = "function" _ "(" _ "*" _ ")" {return ["anyFunctionTest"]}

// 104
TypedFunctionTest
 = "function" _ "(" _ types:(first:SequenceType rest:("," _ t:SequenceType {return t})* {return appendRest(first, rest)})? _ ")" S "as" S SequenceType {return ["functionTest", types]}

// 105
MapTest = AnyMapTest / TypedMapTest

// 106
AnyMapTest = "map" _ "(" _ "*" _ ")" {return ["typeTest", [null, null, "map(*)"]]}

// 107
TypedMapTest = "map" _ "(" _ keyType:AtomicOrUnionType _ "," _ valueType:SequenceType _ ")" {return ["typedMapTest", keyType, valueType]}

// 108
ArrayTest = AnyArrayTest / TypedArrayTest

// 109
AnyArrayTest = "array" _ "(" _ "*" _ ")" {return ["anyArrayTest"]}

// 110
TypedArrayTest = "array" _ "(" _ type:SequenceType _ ")" {return ["typedArrayTest", type]}

// 111
ParenthesizedItemType = "(" _ ItemType _ ")"

// 112
EQName = uri:URIQualifiedName {return [null, uri[0], uri[1]]}
 / name:QName {return [name[0], null, name[1]]}

// 113
IntegerLiteral = digits:Digits {return ["literal", digits, "xs:integer"]}

// 114
DecimalLiteral
 = "." digits:Digits {return ["literal", parseFloat("." + digits, 10), "xs:decimal"]}
 / decimal:$(Digits "." Digits?) {return ["literal", parseFloat(decimal, 10), "xs:decimal"]}

// 115
DoubleLiteral
 = double:$((("." Digits) / (Digits ("." [0-9]*)?)) [eE] [+-]? Digits) {return ["literal", parseFloat(double, 10), "xs:double"]}

// 116
StringLiteral
 = '\"' contents:(EscapeQuot / [^\"])* '\"' {return ["literal", contents.join(""), "xs:string"]}
 / "\'" contents:(EscapeApos / [^\'])* "\'" {return ["literal", contents.join(""), "xs:string"]}

// 117
URIQualifiedName = uri:BracedURILiteral name:NCName {return [uri, name]}

// 118
BracedURILiteral = "Q" _ "{" uri:[^{}]* "}" {return uri.join('').trim()}

// 119
// 226 in XQuery
EscapeQuot
 = "\"\"" {return "\""}

// 120
// 227 in XQuery
EscapeApos
 = "''" {return "'"}

// 121
Comment
 = "(:" (CommentContents / Comment)* ":)"

// 122 Note: https://www.w3.org/TR/REC-xml-names/#NT-QName
QName = PrefixedName / UnprefixedName

// 123 Note: https://www.w3.org/TR/REC-xml-names/#NT-NCName
NCName = start:NCNameStartChar rest:(NCNameChar*) {return start + rest.join("")}

// 124 Note: https://www.w3.org/TR/REC-xml/#NT-Char
Char = [\t\n\r -\uD7FF\uE000\uFFFD] / [\uD800-\uDBFF][\uDC00-\uDFFF]	/* any Unicode character, excluding the surrogate blocks, FFFE, and FFFF. */

// 125
Digits
 = digits:[0-9]+ {return parseInt(digits.join(""), 10)}

// 126
CommentContents
 = !"(:" !":)" Char



// XQuery part starts here

// 140
NodeConstructor
 = DirectConstructor
// / ComputedConstructor

// 141
DirectConstructor
 = DirElemConstructor
 / DirCommentConstructor
 / DirPIConstructor

// 142
DirElemConstructor
 = "<" name:QName attList:DirAttributeList endPart:(
   ("/>" {return null}) /
   (">" contents:DirElemContent* "</" closingname:QName ExplicitWhitespace? ">" {return [contents, closingname]} ))
 {return ['DirElementConstructor', name, endPart && endPart[1], attList || [], endPart && accumulateDirContents(endPart[0]) || []]}

// 147
// Note: changed the order around to prevent CDATA to be parsed as element content
DirElemContent
 =  CDataSection
 /  DirectConstructor
 /  CommonContent
 /  $ElementContentChar

// 228
ElementContentChar = ![{}<&] Char

// 148
CommonContent
= char:PredefinedEntityRef
 / ref:CharRef
 / "{{" { return "\u007b" } // PegJS does not like unbalanced curly braces in JS context
 / "}}"  { return "\u007d" } // PegJS does not like unbalanced curly braces in JS context
 / EnclosedExpr

// 153
CDataSection = "<![CDATA[" contents:$CDataSectionContents "]]>" {return ["CDataSection", contents]}

// 154
CDataSectionContents = (!"]]>" Char)*

// 143
DirAttributeList = attrs:(ExplicitWhitespace attr:(name:QName ExplicitWhitespace? "=" ExplicitWhitespace? value:DirAttributeValue {return [name, value]})?{return attr})* {return attrs.filter(Boolean) || []}

// 144
DirAttributeValue
 = '"' chars:(EscapeQuot / QuotAttrValueContent)* '"' {return accumulateDirContents(chars)}
 / "'" chars:(EscapeApos / AposAttrValueContent)* "'" {return accumulateDirContents(chars)}

// 145
QuotAttrValueContent = char:QuotAttrValueContentChar / CommonContent

// 146
AposAttrValueContent = char:AposAttrValueContentChar / CommonContent

// 149
DirCommentConstructor = "<!--" contents:$DirCommentContents "-->" {return ["DirCommentConstructor", contents]}

// 150
DirCommentContents = ((!"-" Char) / ("-" (!"-" Char)))*

// 151
DirPIConstructor = "<?" target:$PITarget contents:(ExplicitWhitespace contents:$DirPIContents {return contents})? "?>" {return ["DirPIConstructor", target, contents || ""]}

// 152
DirPIContents = (!"?>" Char)*

// 229
QuotAttrValueContentChar = ![\"{}<&] ch:Char {return ch}

// 230
AposAttrValueContentChar = ![\'{}<&] ch:Char {return ch}

// 233
CharRef
 = $("&#x" codePoint:([0-9a-fA-F]+) ";")
 / $("&#" codePoint:([0-9]+) ";")

// 225
PredefinedEntityRef
 = $("&" ("lt"/"gt"/"amp"/"quot"/"apos") ";")

// 232
PITarget = !(("X"/"x")("M"/"m")("L"/"l")) Name

// XML types
PrefixedName = prefix:Prefix ":" local:LocalPart {return [prefix, local]}

UnprefixedName = local:LocalPart {return [null, local]}

LocalPart = NCName

Prefix = NCName

NCNameStartChar = [A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD] / [\uD800-\uDB7F][\uDC00-\uDFFF]

NCNameChar = NCNameStartChar / [\-\.0-9\xB7\u0300-\u036F\u203F\u2040]

NameChar = NCNameChar / ":"

NameStartChar = NCNameStartChar / ":"

Name = $(NameStartChar (NameChar)*)

// Whitespace Note: https://www.w3.org/TR/REC-xml/#NT-S
_
 = WhitespaceCharacter*

S
 = WhitespaceCharacter+

ExplicitWhitespace
 = ("\u0020" / "\u0009" / "\u000D" / "\u000A")+

WhitespaceCharacter
 = "\u0020" / "\u0009" / "\u000D" / "\u000A"
 / Comment // Note: comments can occur anywhere where whitespace is allowed: https://www.w3.org/TR/xpath-3/#DefaultWhitespaceHandling

ReservedFunctionNames
 = "array"
 / "attribute"
 / "comment"
 / "document-node"
 / "element"
 / "empty-sequence"
 / "function"
 / "if"
 / "item"
 / "map"
 / "namespace-node"
 / "node"
 / "processing-instruction"
 / "schema-attribute"
 / "schema-element"
 / "switch"
 / "text"
 / "typeswitch"

AssertAdjacentOpeningTerminal
 = &("(" / '"' / "'" / WhitespaceCharacter)

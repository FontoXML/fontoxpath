{
	function appendRest (arr, optionalArr) {
		if (!optionalArr) {
	   	 	return arr;
		}
		return arr.concat(optionalArr);
	}
}

// 1
XPath
 = Expr

// 2
ParamList
 = start:Param rest:( _ "," _ param:Param {return param} ) _ {return appendRest(["param", start], rest)}

// 3
Param
 = "$" name:EQName _ type:TypeDeclaration? {return ["param", name, type]}

// 4
FunctionBody
 = EnclosedExpr

// 5
EnclosedExpr
 = "{" _ Expr _ "}"

// 6
Expr
 = first:ExprSingle rest:( _ "," _ expr:ExprSingle {return expr})* _ {return rest.length ? appendRest(["sequence", first], rest) : first}

// 7
ExprSingle
 = OrExpr
// / ForExpr
// / LetExpr
// / QuantifiedExpr
// / IfExpr

// 16
OrExpr
 = first:AndExpr rest:( _ "or" _  expr:AndExpr {return expr})* {return rest.length ? appendRest(['or', first], rest) : first}

// 17
AndExpr
 = first:ComparisonExpr rest:( _ "and" _ expr:ComparisonExpr {return expr})* {return rest.length ? appendRest(["and", first], rest) : first}

// 18
ComparisonExpr
 = lhs:StringConcatExpr _ op:(ValueComp / GeneralComp / NodeComp) _ rhs:StringConcatExpr {return ["compare", op, lhs, rhs]} // Note: the whole 1<2<3 shenanigan is removed from 3.1
 / StringConcatExpr


// 19
StringConcatExpr
 = first:RangeExpr rest:( _ "||" _ expr:RangeExpr {return expr})* _ {
     if (!rest.length) return first;
     return appendRest(['functionCall', 'concat', first].concat(rest))
   }

// 20
RangeExpr
 = lhs:AdditiveExpr rhs:( _ "to" _ rhs:AdditiveExpr {return rhs})? {return rhs === null ? lhs : ["functionCall", "range", lhs, rhs]}

// 21
AdditiveExpr
 = lhs:MultiplicativeExpr _ op:("-" / "+") _ rhs:AdditiveExpr {return ["binaryOperator", op, lhs, rhs]}
 / MultiplicativeExpr

// 22
MultiplicativeExpr
 = lhs:UnionExpr " " op:("*"/"div"/"idiv"/"mod") " " rhs:MultiplicativeExpr {return ["binaryOperator", op, lhs, rhs]}
 / UnionExpr

// 23
UnionExpr
 = first:IntersectExpr rest:( _ ("|"/"union") _ expr:IntersectExpr {return expr})+ {return appendRest(["union", first], rest)}
 / IntersectExpr

// 24
IntersectExpr
// = lhs:InstanceofExpr _ "intersect" _ rhs:IntersectExpr {return ["intersect", lhs, rhs]}
// / lhs:InstanceofExpr _ "except" _ rhs:IntersectExpr {return ["except", lhs, rhs]}
 = InstanceofExpr

// 25
InstanceofExpr
// = lhs:TreatExpr _ "instance of" _ rhs:SequenceType {return ["instance of", lhs, rhs]}
 = TreatExpr

// 26
TreatExpr
// = lhs:CastableExpr _ "treat as" _ rhs:SequenceType {return ["treat as", lhs, rhs]}
 = CastableExpr

// 27
CastableExpr
 = lhs:CastExpr rhs:(_ "castable as" _ rhs:SingleType {return rhs})? {return rhs ? ["castable as", lhs, rhs] : lhs}

// 28
CastExpr
 = lhs:ArrowExpr rhs:(_ "cast as" _ rhs:SingleType {return rhs})? {return rhs ? ["cast as", lhs, rhs] : lhs}

// 29
ArrowExpr
 = lhs:UnaryExpr functionParts:( _ "=>" _ functionName:ArrowFunctionSpecifier argumentList:ArgumentList _ { return [functionName, argumentList]})* {
     if (!functionParts.length) return lhs;
     return functionParts.reduce(function (previousFunction, functionPart) {
       return ["functionCall", functionPart[0], previousFunction].concat(functionPart[1]);
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
GeneralComp = op:("=" / "!=" / "<"  / "<=" / ">" / ">=") {return ["generalCompare", op]}

// 33
ValueComp = op:("eq" / "ne" / "lt" / "le" / "gt" / "ge") {return ["valueCompare", op]}

// 34
NodeComp = op:("is" / "<<" / ">>") {return ["nodeCompare", op]}

// 35
SimpleMapExpr
// = lhs:PathExpr _ '!' _ rhs:SimpleMapExpr {return "unsupported"}
 = PathExpr

// 36-45 (simplified)
PathExpr
 = RelativeLocationPath
 / AbsoluteLocationPath

RelativeLocationPath
 = lhs:StepExpr abbrev:LocationPathAbbreviation rhs:RelativeLocationPath {return ["path",  lhs, ["path", abbrev, rhs]]}
 / first:StepExpr rest:("/" step:StepExpr {return step})+ {return (rest && rest.length) ? appendRest(["path", first], rest) : first}
 / StepExpr

StepExpr
 = PostfixExpr
 / AxisStep

AbsoluteLocationPath
 = "/" path:RelativeLocationPath { return ["absolutePath", path] }
 / abbrev:LocationPathAbbreviation path: RelativeLocationPath { return ["absolutePath", ["path", abbrev, path]] }

LocationPathAbbreviation
 = "//" {return ["descendant-or-self", ["kindTest", "node"]]}

AxisStep
 = axis:Axis test:NodeTest predicates:Predicate* {
   	  if (!predicates.length) {
     	return [axis, test];
  	   }
       return ["filter", [axis, test], predicates]
  	}
 / AbbreviatedStep

Axis
 = name:AxisName '::' { return name }
 / "@" {return "attribute"}
 / "" { return "child" }

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
 = ".." { return ["parent", ["kindTest", "node"]] }

// 46
NodeTest = KindTest / nameTest:NameTest {return ["nameTest", nameTest]}

// 47
NameTest = EQName / "*"

// 49
PostfixExpr
 = expr:PrimaryExpr filters:(Predicate / ArgumentList / Lookup)* {return filters.length ? ["filter", expr, filters] : expr}

// 50
ArgumentList
 = "(" args:(first:Argument rest:( _ "," _ arg:Argument {return arg})* {return appendRest([first], rest)})? ")" {return args||[]}

// 52
Predicate
 = "[" e:Expr "]" {return e};

// 53
Lookup = "?" KeySpecifier

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
// / FunctionItemExpr
// / MapConstructor
// / ArrayConstructor
// / UnaryLookup

// 57
Literal = NumericLiteral / StringLiteral

// 58 Note: changes because double accepts less than decimal, accepts less than integer
NumericLiteral = DoubleLiteral / DecimalLiteral / IntegerLiteral

// 59
VarRef
 = "$" varName:VarName {return ["varName", varName]}

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
 = "." !"." { return ["self", ["kindTest", "node"]] }

// 63
FunctionCall
 = !ReservedFunctionNames name:EQName _ args:ArgumentList {return ["functionCall", name].concat(args)}

// 64
Argument
 = ExprSingle
 / ArgumentPlaceholder

// 65
ArgumentPlaceholder
 = "?" {return "placeholder"}

// 66
FunctionItemExpr
 = NamedFunctionRef
 / InlineFunctionRef

// 67
NamedFunctionRef
 = name:EQName "#" integer:IntegerLiteral {return ["namedFunctionRef", name, integer]}

// 68
InlineFunctionRef
 = "function" _ "(" _ params:ParamList _ ")" _ body:FunctionBody {return ["inlineFunction", params, [], body]}
 / "function" _ "(" _ params:ParamList _ ") as " type:SequenceType  _ body:FunctionBody {return ["inlineFunction", params, type, body]}

// Note: 69 - 77 are not implemented, they are the map / array constructors and operators

// 77
SingleType
 = typeName:SimpleTypeName multiplicity:"?"? {return ["type", typeName, !!multiplicity]}

// 78
TypeDeclaration
 = " as " SequenceType

// 79
SequenceType
 = "empty-sequence()"
 / ItemType  _ OccurenceIndicator

// 80
OccurenceIndicator = "?" / "*" / "+"

// 81
ItemType
 = KindTest
// / "item()" { return "unsupported"}
// / FunctionTest { return "unsupported"}
// / MapTest { return "unsupported"}
// / ArrayTest { return "unsupported"}
// / AtomicOrUnionType
 / ParenthesizedItemType

//82
AtomicOrUnionType = EQName

// 83
KindTest
 = DocumentTest
 / ElementTest
 / AttributeTest
 / SchemaElementTest { return "unsupported"}
 / SchemaAttributeTest { return "unsupported"}
 / PITest
 / CommentTest
 / TextTest
 / NamespaceNodeTest { return "unsupported"}
 / AnyKindTest
 / FunctionCall // Because of legacy reasons


// 84
AnyKindTest
 = "node()" {return ["kindTest", "node"]}

// 85
DocumentTest
 = "document(" _ innerTest:(ElementTest / SchemaElementTest)? _ ")" {return ["kindTest", "document", innerTest]}
 / "document()" {return ["kindTest", "document"]}

// 86
TextTest
 = "text()" {return ["kindTest", "text"]}

// 87
CommentTest
 = "comment()" {return ["kindTest", "comment"]}

// 88
NamespaceNodeTest
 = "namespace-node()" {return ["kindTest", "namespace-node"]}

// 89
// Let's keep it simple: only accept NCNames, optionally quoted, since quoted non-ncnames should throw a typeError later anyway
PITest
 = "processing-instruction(" _ target:NCName _ ")" {return ["kindTest", "processing-instruction", target]}
 / "processing-instruction(" _ literal:StringLiteral _ ")" {return ["kindTest", "processing-instruction", literal[1]]}
 / "processing-instruction()" {return ["kindTest", "processing-instruction"]}

// 90
AttributeTest
 = "attribute(" _ name:AttribNameOrWildCard _ "," _ type:TypeName _ ")" {return ["kindTest", "attribute", name, type]}
 / "attribute(" _ name:AttribNameOrWildCard _ ")" {return ["kindTest", "attribute", name]}
 / "attribute()" {return ["kindTest", "attribute"]}

// 91
AttribNameOrWildCard = AttributeName / "*"

// 92
SchemaAttributeTest
 = "schema-attribute(" _ decl:AttributeDeclaration _ ")" {return ["kindTest", "schema-attribute", decl]}

// 93
AttributeDeclaration = AttributeName

// 94
ElementTest
 = "element(" _ name:ElementNameOrWildCard _ "," _ type:TypeName _ ")" {return ["kindTest", "element", name, type]}
 / "element(" _ name:ElementNameOrWildCard _ ")" {return ["kindTest", "element", name]}
 / "element()" {return ["kindTest", "element"]}

// 95
ElementNameOrWildCard = ElementName / "*"

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
AnyFunctionTest = "function (*)"

// 104
TypedFunctionTest
 = "function (" _ (SequenceType ("," _ SequenceType)*)? _ ") as " SequenceType

// 105
MapTest = AnyMapTest / TypedMapTest

// 106
AnyMapTest = "map(*)"

// 107
TypedMapTest = "map("_ (SequenceType ( _ "," _ SequenceType)*)? _ ")"

// 108
ArrayTest = AnyArrayTest / TypedArrayTest

// 109
AnyArrayTest = "array(*)"

// 110
TypedArrayTest = "array(" _ SequenceType _ ")"

// 111
ParenthesizedItemType = "(" _ ItemType _ ")"

// 112
EQName = QName / URIQualifiedName

// 113
IntegerLiteral = digits:Digits {return ["literal", digits, "xs:integer"]}

// 114
DecimalLiteral
 = "." digits:Digits {return ["literal", parseInt("." + digits, 10), "xs:decimal"]}
 / decimal:$(Digits "." Digits?) {return ["literal", parseInt(decimal, 10), "xs:decimal"]}

// 115
DoubleLiteral
 = double:$((("." Digits) / (Digits ("." [0-9]*)?)) [eE] [+-]? Digits) {return ["literal", parseFloat(double, 10), "xs:double"]}

// 116
StringLiteral
 = '\"' contents:(EscapeQuot / [^\"])* '\"' {return ["literal", contents.join(""), "xs:string"]}
 / "\'" contents:(EscapeApos / [^\'])* "\'" {return ["literal", contents.join(""), "xs:string"]}

// 117
URIQualifiedName = BracedURILiteral / NCName

// 118
BracedURILiteral = "Q" _ "{" [^{}]* "}"

// 119
EscapeQuot
 = "\"\"" {return "\""}

// 120
EscapeApos
 = "''" {return "'"}

// 121
Comment
 = "(:" (CommentContents / Comment)* ":)"

// 122 Note: https://www.w3.org/TR/REC-xml-names/#NT-QName
QName = PrefixedName / UnprefixedName

// 123 Note: https://www.w3.org/TR/REC-xml-names/#NT-NCName
NCName = start:NCNameStartChar rest:(NCNameChar*) {return start+rest.join('')}

// 124 Note: https://www.w3.org/TR/REC-xml/#NT-Char
Char = "\u0009" / "\u000A" / "\u000D" / [\u0020-\uD7FF] / [\uE000-\uFFFD] / [\u10000-\u10FFFF]	/* any Unicode character, excluding the surrogate blocks, FFFE, and FFFF. */

// 125
Digits
 = digits:[0-9]+ {return parseInt(digits.join(""), 10)}

// 126
CommentContents
 = !"(:" !":)" Char

// XML types
PrefixedName = $(Prefix ":" LocalPart)

UnprefixedName = LocalPart

LocalPart = NCName

Prefix = NCName

NCNameStartChar = [A-Z] / "_" / [a-z]

NCNameChar = NCNameStartChar / [-.0-9]

// Whitespace Note: https://www.w3.org/TR/REC-xml/#NT-S
_
 = WhitespaceCharacter*

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

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
 = _ expr:Expr _ {return expr}

// 2
ParamList
 = start:Param rest:( _ "," _ param:Param {return param} ) {return appendRest(["param", start], rest)}

// 3
Param
 = "$" name:EQName _ type:TypeDeclaration? {return ["param", name, type]}

// 4
FunctionBody
 = EnclosedExpr

// 5
EnclosedExpr
 = "{" _ e:Expr _ "}" { return e }

// 6
Expr
 = first:ExprSingle rest:( _ "," _ expr:ExprSingle {return expr})* {return rest.length ? appendRest(["sequence", first], rest) : first}

// 7 (Note: ordering changed because of greediness)
ExprSingle
 = LetExpr
 / QuantifiedExpr
 / IfExpr
// / ForExpr
 / OrExpr

// 8 (Not implemented)
// ForExpr ::= SimpleForClause "return" ExprSingle

// 9 (Not implemented)
// SimpleForClause ::= "for" SimpleForBinding ("," SimpleForBinding)*

// 10 (Not implemented)
// SimpleForBinding ::= "$" VarName "in" ExprSingle

// 11
LetExpr
= bindings:SimpleLetClause _ "return" AssertAdjacentOpeningTerminal _ returnExpr:ExprSingle {
	// The bindings part consists of the rangeVariable and the bindingSequence.
	// Multiple bindings are syntactic sugar for 'let $x := 1 return let $y := $x * 2'
	if (bindings.length === 1) return ["let"].concat(bindings[0], [returnExpr]);
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
 = first:AndExpr rest:( _ "or" AssertAdjacentOpeningTerminal _ expr:AndExpr {return expr})* {return rest.length ? appendRest(['or', first], rest) : first}

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
     return appendRest(["functionCall", ["namedFunctionRef", "concat", args.length], args])
   }

// 20
RangeExpr
 = lhs:AdditiveExpr rhs:( _ "to" AssertAdjacentOpeningTerminal _ rhs:AdditiveExpr {return rhs})? {return rhs === null ? lhs : ["functionCall", ["namedFunctionRef", "op:to", 2], [lhs, rhs]]}

// 21
AdditiveExpr
 = lhs:MultiplicativeExpr _ op:("-" / "+") _ rhs:AdditiveExpr {return ["binaryOperator", op, lhs, rhs]}
 / MultiplicativeExpr

// 22
MultiplicativeExpr
 = lhs:UnionExpr _ op:("*" / ( op:("div" / "idiv" / "mod") AssertAdjacentOpeningTerminal {return op})) _ rhs:MultiplicativeExpr {return ["binaryOperator", op, lhs, rhs]}
 / UnionExpr

// 23
UnionExpr
 = first:IntersectExpr rest:( _ ("|"/("union" AssertAdjacentOpeningTerminal)) _ expr:IntersectExpr {return expr})+ {return appendRest(["union", first], rest)}
 / IntersectExpr

// 24 Note: was InstanceofExpr ("intersect"/"except" InstanceofExpr)*, but this does not work out with () intersect () except ().
IntersectExpr
 = lhs:InstanceofExpr rhs:(_ type:("intersect" / "except") AssertAdjacentOpeningTerminal _ rhs:IntersectExpr {return ["op:"+type, rhs] })? {
     return rhs === null ? lhs : ["functionCall", ["namedFunctionRef", rhs[0], 2], [lhs, rhs[1]]]
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
 = lhs:UnaryExpr functionParts:( _ "=>" _ functionName:ArrowFunctionSpecifier _ argumentList:ArgumentList _ { return [functionName, argumentList]})* {
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
 = lhs:PathExpr parts:( _ "!" _ expr:PathExpr { return expr })* {
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
 = lhs:StepExpr abbrev:LocationPathAbbreviation rhs:RelativePathExpr {return ["path",  lhs, ["path", abbrev, rhs]]}
 / lhs:StepExpr "/" rhs:RelativePathExpr {return ["path", lhs, rhs]}
 / StepExpr

// 38
StepExpr
 = PostfixExpr
 / AxisStep

AbsoluteLocationPath
 = "/" path:RelativePathExpr { return ["absolutePath", path] }
 / abbrev:LocationPathAbbreviation path: RelativePathExpr { return ["absolutePath", ["path", abbrev, path]] }

LocationPathAbbreviation
 = "//" {return ["descendant-or-self", ["kindTest", "node()"]]}

// 39
AxisStep
 = axis:Axis test:NodeTest predicates:Predicate* {
     if (!predicates.length) {
       return [axis, test];
     }
     return predicates.reduce(function (accumulator, current) { return ["filter", accumulator, current] }, [axis, test])
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
 = ".." { return ["parent", ["kindTest", "node()"]] }

// 46
NodeTest = KindTest / nameTest:NameTest {return ["nameTest", nameTest]}

// 47
NameTest = EQName / "*"

// 49
PostfixExpr
 = expr:PrimaryExpr postfixExpr:(
     filter:Predicate {return ["filter", filter]} /
     argList:ArgumentList {return ["functionCall", argList]} /
     lookup:Lookup {return ["lookup", lookup]}
   )* {return postfixExpr.length ? postfixExpr.reduce(function (accumulator, currentExpr) { currentExpr.splice(1, 0, accumulator); return currentExpr; }, expr) : expr}

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
 = "." !"." { return ["self", ["kindTest", "item()"]] }

// 63
FunctionCall
// Do not match reserved function names as function names, they should be tests or other built-ins.
// Match the '(' becase 'elementWhatever' IS a valid function name
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
// / InlineFunctionExpr

// 67
NamedFunctionRef
 = name:EQName "#" integer:IntegerLiteral {return ["namedFunctionRef", name, integer[1]]}

// 68
InlineFunctionExpr
 = "function" _ "(" _ params:ParamList _ ")" _ body:FunctionBody {return ["inlineFunction", params, [], body]}
 / "function" _ "(" _ params:ParamList _ ")" _ "as" S type:SequenceType  _ body:FunctionBody {return ["inlineFunction", params, type, body]}

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
 = "[" _ entries:(first:ExprSingle _ rest:("," _ e:ExprSingle _ { return e })* { return appendRest([first], rest) })? "]" { return ["arrayConstructor", "square"].concat(entries || []) }

// 75
CurlyArrayConstructor
 = "array" _ e:EnclosedExpr { return ['arrayConstructor', "curly", e] }

// 76 (Not implemented)
// UnaryLookup ::= "?" KeySpecifier

// 77
SingleType
 = typeName:SimpleTypeName multiplicity:"?"? {return [typeName, !!multiplicity]}

// 78
TypeDeclaration
 = " as " SequenceType

// 79
SequenceType
 = "empty-sequence()"
 / type:ItemType _ occurence:OccurenceIndicator? { return [type, occurence] }

// 80
OccurenceIndicator = "?" / "*" / "+"

// 81
ItemType
 = KindTest
 / "item()"
// / FunctionTest { return "unsupported"}
 / MapTest
 / ArrayTest
 / AtomicOrUnionType
 / ParenthesizedItemType

// 82
AtomicOrUnionType = typeName:EQName { return ["typeTest", typeName] }

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
AttribNameOrWildCard = AttributeName / "*"

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
 = "function" _ "(" _ (SequenceType ("," _ SequenceType)*)? _ ")" S "as" S SequenceType

// 105
MapTest = AnyMapTest / TypedMapTest

// 106
AnyMapTest = "map" _ "(" _ "*" _ ")" {return ["typeTest", "map(*)"]}

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
EQName = QName / URIQualifiedName

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

S
 = WhitespaceCharacter+

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

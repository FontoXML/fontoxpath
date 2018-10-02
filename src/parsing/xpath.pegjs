{
  function parseCodePoint (codePoint) {
    // TODO: Assert not in XPath mode
  if ((codePoint >= 0x1 && codePoint <= 0xD7FF) ||
    (codePoint >= 0xE000 && codePoint <= 0xFFFD) ||
    (codePoint >= 0x10000 && codePoint <= 0x10FFFF)) {
        return String.fromCodePoint(codePoint);
  }
  throw new Error(`XQST0090: The character reference ${codePoint} (${codePoint.toString(16)}) does not reference a valid codePoint.`);
  }

  function makeBinaryOp (kind, lhs, rhs) {
      return rhs.reduce(function(lh, rh) {return [kind, ["firstOperator", lh], ["secondOperator", rh]]}, lhs);
  }
}

// 1
Module
 = _ versionDecl:VersionDeclaration? _ module:(LibraryModule / MainModule) {return ["module", versionDecl, module]}

// TODO Implement
MainModule
 = "main" {return 'main'}

// 2
VersionDeclaration
 = "xquery" _ versionAndEncoding:( 
    ("encoding" S e:StringLiteral {return ["encoding", e]})
    / ("version" S version:StringLiteral encoding:(S "encoding" S e:StringLiteral {return e})? {return [["version", version], ["encoding", encoding]]})
) _ Separator {return ["versionDecl"].concat(versionAndEncoding)}

// 4
LibraryModule
 = moduleDecl:ModuleDecl _ prolog:Prolog {return ["libraryModule", moduleDecl, prolog]}

// 5
ModuleDecl
 = "module" S "namespace" S prefix:$NCName _ "=" _ uri:URILiteral _ Separator {return ["moduleDecl", ["prefix", prefix], ["uri", uri]]}

// 6
Prolog
 = moduleSettings:(prologPart:(DefaultNamespaceDecl / Setter / NamespaceDecl / Import) _ Separator _ {return prologPart})*
   declarations:(prologPart:(ContextItemDecl / AnnotatedDecl / OptionDecl) _ Separator _{return prologPart})* 
   {return ["prolog"].concat(moduleSettings).concat(declarations)}

// 7
Separator = ";"

// 8
Setter
 = BoundarySpaceDecl / DefaultCollationDecl / BaseURIDecl / ConstructionDecl / OrderingModeDecl / EmptyOrderDecl / CopyNamespacesDecl / DecimalFormatDecl

// 9
BoundarySpaceDecl = "declare" S "boundary-space" S value:("preserve" / "strip") {return ['boundarySpaceDecl', value]}

// 10
DefaultCollationDecl = "declare" S "default" "collation" value:URILiteral {return ['defaultCollationDecl', value]}

// 11
BaseURIDecl = "declare" S "base-uri" S value:URILiteral {return ['baseUriDecl', value]}

// 12
ConstructionDecl = "declare" S "construction" S value:("strip" / "preserve") {return ['constructionDecl', value]}

// 13
OrderingModeDecl
 = "declare" S "ordering" S value:("ordered" / "unordered") {return ['orderingModeDecl', value]}

// 14
EmptyOrderDecl
 = "declare" S "default" S "order" S "empty" S value:("greatest" / "least") {return ['emptyOrderDecl', value]}

// 15
CopyNamespacesDecl
 = "declare" S "copy-namespaces" S preserveMode:PreserveMode _ "," _ inheritMode:InheritMode {return['copyNamespacesDecl', ['preserveMode', preserveMode], ['inheritMode', inheritMode]]}

// 16
PreserveMode
 = "preserve" / "no-preserve"

// 17
InheritMode
 = "inherit" / "no-inherit"

// 18
DecimalFormatDecl
 = "declare" S 
 decimalFormatName:(("decimal-format" S name:EQName {return ["decimalFormatName"].concat(name)}) / ("default" S "decimal-format" {return null}))
 decimalFormatParams:(S name:DFPropertyName S "=" S value:StringLiteral
    {return ["decimalFormatParam", ["decimalFormatParamName", name], ["decimalFormatParamValue", value]]}
 )*
 {return ['decimalFormatDecl'].concat(decimalFormatName ? [decimalFormatName] : []).concat(decimalFormatParams)}

// 19
DFPropertyName
 = "decimal-separator" / "grouping-separator" / "infinity" / "minus-sign" / "NaN" / "percent" / "per-mille" / "zero-digit" / "digit" / "pattern-separator" / "exponent-separator"

// 20
Import = SchemaImport / ModuleImport

// 21
SchemaImport
 = "import" S "schema" (S SchemaPrefix)? S URILiteral ( S "at" S URILiteral ( S ","  S URILiteral)*)? {return {type: 'schemaImportl'}}

// 22
SchemaPrefix
 = ("namespace" S NCName S "=") / ("default" S "element" S "namespace")

// 23
ModuleImport
 = "import" S "module"
   prefix:(S "namespace" S prefix:$NCName _ "=" {return prefix})?
  // TODO: The URILiteral should be preceded with whitespace if the no prefix is set
   _ uri:URILiteral (S "at" URILiteral (_ "," _ URILiteral)*)? {return ["moduleImport", ["namespacePrefix", prefix], ["targetNamespace", uri]]}

// 24
NamespaceDecl
 = "declare" S "namespace" S prefix:NCName _ "=" _ uri:URILiteral {return {type: 'namespaceDecl', prefix: prefix, namespaceURI: uri[1]}}

// 25
DefaultNamespaceDecl
 = "declare" S "default" S elementOrFunction:("element" / "function") S "namespace" S uri:URILiteral {return ["defaultNamespaceDecl", ["defaultNamespaceCategory", elementOrFunction], ["uri", uri]]}

// 26
AnnotatedDecl
 = "declare" S annotations:(a:Annotation S {return a})* decl:(VarDecl / FunctionDecl) {return [decl[0]].concat(annotations).concat(decl.slice(1))}

// 27
Annotation
 = "%" _ annotation:EQName params:(_ "(" _ lhs:Literal rhs:(_ "," _ part:Literal {return part})* _")" {return lhs.concat(rhs)})? { return ["annotation", ["annotationName", annotation]].concat(params ? ["arguments", params] : [])}

// 28
VarDecl
 = "variable" S "$" _ name:VarName varType:(_ t:TypeDeclaration {return type})? 
      value:((_ ":=" _ value:VarValue {return ["varValue", value]})
      / (S "external" defaultValue:(_ ":=" _ v:VarDefaultValue {return ["varValue", v]})? {return ["external"].concat(defaultValue ? [defaultValue] : [])})) 
  {return ["varDecl", ["varName"].concat(name), ["typeDeclaration", varType], value]}

// 29
VarValue
 = ExprSingle

// 30
VarDefaultValue
 = ExprSingle

// 31 TODO: Convert to XQueryX
ContextItemDecl
 = "declare" S "context" S "item" (S "as" ItemType)? ((_ ":=" _ VarValue) / (S "external" (_ ":=" _ VarDefaultValue)?)) {return {type: 'contextItemDecl'}}

// 32
FunctionDecl
 = "function" S (!ReservedFunctionNames) name:EQName _ "(" _ paramList:ParamList? _ ")" typeDeclaration:(S "as" S t:SequenceType {return t})? _ body:((body:FunctionBody {return ["functionBody", body]}) / ("external" {return ["externalDefinition"]}))
 {return ["functionDecl", ["functionName"].concat(name), ["paramList"].concat(paramList || [])].concat(typeDeclaration ? ["typeDeclaration", typeDeclaration] : []).concat([body])}

// 33
ParamList
 = lhs:Param rhs:(_ "," _ param:Param {return param})* {return lhs.concat(rhs)}

// 34
Param
 = "$" varName:EQName S typeDeclaration:TypeDeclaration? {return ["param", ["varName", varName], ["typeDeclaration", typeDeclaration]]}

// 35
FunctionBody
 = EnclosedExpr

// 36
EnclosedExpr
 = "{" _ e:Expr? _ "}" {return e}

// 37
OptionDecl
 = "declare" S  "option" S EQName S StringLiteral {return {type: 'optionDecl'}}

// 39
Expr
 = lhs:ExprSingle rhs:(_ "," _ part:ExprSingle {return part})* {return lhs.concat(rhs)}

// 40 TODO, fix proper
ExprSingle
 /*= FLWORExpr
 / QuantifiedExpr
 / SwitchExpr
 / TypeswitchExpr
 / IfExpr
 / TryCatchExpr*/
 = OrExpr

 // 83
 OrExpr
 = lhs:AndExpr rhs:( _ "or" AssertAdjacentOpeningTerminal _ expr:AndExpr {return expr})*
   {return makeBinaryOp("orOp", lhs, rhs)}

// 84
AndExpr
 = lhs:ComparisonExpr rhs:( _ "and" AssertAdjacentOpeningTerminal _ expr:ComparisonExpr {return expr})*
   {return makeBinaryOp("andOp", lhs, rhs)}

// 85
ComparisonExpr
 = lhs:StringConcatExpr rhs:(_ op:(ValueComp / NodeComp / GeneralComp) _ expr:StringConcatExpr {return [op, expr]})?
 {return rhs ? [rhs[0], ["firstOperator", lhs], ["secondOperator", rhs[1]]] : lhs}

// 86
StringConcatExpr
 = lhs:RangeExpr rhs:( _ "||" _ expr:RangeExpr {return expr})*
   {return makeBinaryOp("stringConcatenateOp", lhs, rhs)}

// 87
RangeExpr
 = lhs:AdditiveExpr rhs:( _ "to" AssertAdjacentOpeningTerminal _ rhs:AdditiveExpr {return rhs})?
  {return rhs === null ? lhs : ["rangeSequenceExpr", ["startExpr", lhs], ["endExpr", rhs]]}

// 88
AdditiveExpr
 = lhs:MultiplicativeExpr rhs:(_ op:("-" {return "subtractOp"}/ "+" {return "addOp"}) _ expr:MultiplicativeExpr {return [op, expr]})*
 {return rhs.reduce(function (lhs, additiveOp) {return [additiveOp[0], ["firstOperator", lhs], ["secondOperator", additiveOp[1]]]}, lhs)}

// 89
MultiplicativeExpr
 = lhs:UnionExpr rhs:( _ op:(
   "*" {return "multiplyOp"}
   / "div" AssertAdjacentOpeningTerminal {return "divOp"}
   / "idiv" AssertAdjacentOpeningTerminal {return "idivOp"}
   / "mod" AssertAdjacentOpeningTerminal {return "modOp"})
   _ expr:UnionExpr {return [op, expr]})*
 {return rhs.reduce(function (lhs, multiplicativeOp) {return [multiplicativeOp[0], ["firstOperator", lhs], ["secondOperator", multiplicativeOp[1]]]}, lhs)}

// 90
UnionExpr
 = lhs:IntersectExpr rhs:( _ ("|"/("union" AssertAdjacentOpeningTerminal)) _ expr:IntersectExpr {return expr})*
 {return makeBinaryOp("unionOp", lhs, rhs)}

// 91 Note: was InstanceofExpr ("intersect"/"except" InstanceofExpr)*, but this does not work out with () intersect () except ().
IntersectExpr
 = lhs:InstanceofExpr rhs:(_ op:("intersect" {return "intersectOp"} / "except" {return "exceptOp"}) AssertAdjacentOpeningTerminal _ expr:IntersectExpr {return [op, expr]})*
 {return rhs.reduce(function (lhs, intersectOp) {return [intersectOp[0], ["firstOperator", lhs], ["secondOperator", intersectOp[1]]]}, lhs)}

// 92
InstanceofExpr
 = lhs:TreatExpr rhs:(_ "instance" S "of" AssertAdjacentOpeningTerminal _ rhs:SequenceType {return rhs})? {return rhs ? ["instanceOfExpr", ["argExpr", lhs], ["sequenceType", rhs]] : lhs}
 / TreatExpr

// 93
TreatExpr
 = lhs:CastableExpr rhs:(_ "treat" S "as" AssertAdjacentOpeningTerminal _ rhs:SequenceType {return rhs})? {return rhs ? ["treatExpr", ["argExpr", lhs], ["sequenceType", rhs]] : lhs}

// 94
CastableExpr
 = lhs:CastExpr rhs:(_ "castable" S "as" AssertAdjacentOpeningTerminal _ rhs:SingleType {return rhs})? {return rhs ? ["castableExpr", ["argExpr", lhs], ["singleType", rhs]] : lhs}

// 95
CastExpr
 = lhs:ArrowExpr rhs:(_ "cast" S "as" AssertAdjacentOpeningTerminal _ rhs:SingleType {return rhs})? {return rhs ? ["castExpr", ["argExpr", lhs], ["singleType", rhs]] : lhs}

// 96 TODO: Implementation
ArrowExpr
 = UnaryExpr
 /* = lhs:UnaryExpr {return lhs} functionParts:( _ "=>" _ functionName:ArrowFunctionSpecifier _ argumentList:ArgumentList _ {return [functionName, argumentList]})* {
     return functionParts.reduce(function (previousFunction, functionPart) {
       var args = [previousFunction].concat(functionPart[1]);
       return [
         "functionCall",
         functionPart[0][0] === 'namedFunctionRef' ? functionPart[0].concat([args.length]) : functionPart[0],
         args
       ];
     }, lhs);
   }*/

// 97
UnaryExpr
 = "-" expr:UnaryExpr {return ["unaryMinusOp", ["operand", expr]]}
 / "+" expr:UnaryExpr {return ["unaryPlus", ["operand", expr]]}
 / ValueExpr

// 98 TODO: Should be: ValidateExpr | ExtensionExpr | SimpleMapExpr
ValueExpr = SimpleMapExpr

// 99
GeneralComp
 = "=" {return "equalOp"}
 / "!=" {return "notEqualOp"}
 / "<=" {return "lessThanOrEqualOp"}
 / "<" {return "lessThanOp"}
 / ">=" {return "greaterThanOrEqualOp"}
 / ">" {return "greaterThanOp"}

// 100
ValueComp
 = "eq" AssertAdjacentOpeningTerminal {return "eqOp"}
 / "ne" AssertAdjacentOpeningTerminal {return "neOp"}
 / "lt" AssertAdjacentOpeningTerminal {return "ltOp"}
 / "le" AssertAdjacentOpeningTerminal {return "leOp"}
 / "gt" AssertAdjacentOpeningTerminal {return "gtOp"}
 / "ge" AssertAdjacentOpeningTerminal {return "geOp"}

// 101
NodeComp
 = "is" AssertAdjacentOpeningTerminal {return "isOp"}
 / "<<" {return "nodeBeforeOp"}
 / ">>" {return "nodeAfterOp"}

// 107
SimpleMapExpr
 = lhs:PathExpr rhs:( _ "!" _ expr:PathExpr {return expr})* {return rhs.length ? ["simpleMapExpr", [lhs].concat(rhs)] : lhs}

// 108
PathExpr
 = "/" _ pathExpr:RelativePathExpr? {return ["pathExpr", ["rootExpr"].concat(pathExpr)]}
 / "//" _ pathExpr:RelativePathExpr {return ["pathExpr", ["rootExpr"], ["stepExpr", ["xpathAxis", "descendant-or-self"], ["kindTest", "node()"]].concat(pathExpr)]}
 / pathExpr:RelativePathExpr {return ["pathExpr", pathExpr]}

// 109
RelativePathExpr
 = "test"

// 112
EQName = uri:URIQualifiedName {return [{prefix: null, uri: uri[0]}, uri[1]]}
 / name:QName {return [{prefix: name[0], uri: null}, name[1]]}

// 129
Literal
 = NumericLiteral / StringLiteral

// 130
// Note: changes because double accepts less than decimal, accepts less than integer
NumericLiteral = literal:(DoubleLiteral / DecimalLiteral / IntegerLiteral) ![a-zA-Z] {return literal}

// 132
VarName
 = EQName

// 182
SingleType
 = typeName:SimpleTypeName optional:"?"? {return optional ? ["singleType", ["atomicType", typeName], ["optional"]] : ["singleType", ["atomicType", typeName]]}

// 183
TypeDeclaration
 = "as" S st:SequenceType {return st}

// 184
SequenceType
 = "empty-sequence()" {return [["voidSequenceType"]]}
 / type:ItemType occurence:(_ o:OccurenceIndicator {return o})? {return ["sequenceType", ["itemType", type]].concat(occurence ? [["occurenceIndicator", occurence]] : [])}

// 185
OccurenceIndicator = "?" / "*" / "+"

// 186
ItemType
 = KindTest
 / "item()" {return ["anyItemType"]}
 / FunctionTest
 / MapTest
 / ArrayTest
 / AtomicOrUnionType
 / ParenthesizedItemType

// 187
AtomicOrUnionType = typeName:EQName {return ["atomicType", typeName]}

// 188
KindTest
 = DocumentTest
 / ElementTest
 / AttributeTest
 / SchemaElementTest
 / SchemaAttributeTest
 / PITest
 / CommentTest
 / TextTest
 / NamespaceNodeTest
 / AnyKindTest

// 189
AnyKindTest
 = "node()" {return ["anyKindTest"]}

// 190
DocumentTest
 = "document-node(" _ innerTest:(ElementTest / SchemaElementTest)? _ ")" {return ["documentTest"].concat(innerTest ? [innerTest] : [])}

// 191
TextTest
 = "text()" {return ["textTest"]}

// 192
CommentTest
 = "comment()" {return ["commentTest"]}

// 193
NamespaceNodeTest
 = "namespace-node()" {return ["namespaceNodeTest"]}

// 194
// Let's keep it simple: only accept NCNames, optionally quoted, since quoted non-ncnames should throw a typeError later anyway
PITest
 = "processing-instruction(" _ target:NCName _ ")" {return ["piTest", ["piTarget", target]]}
 / "processing-instruction(" _ literal:StringLiteral _ ")" {return ["piTest", ["piTarget", literal]]}
 / "processing-instruction()" {return ["piTest"]}

// 195
AttributeTest
 = "attribute(" _ name:AttribNameOrWildCard _ "," _ type:TypeName _ ")" {return ["attributeTest", ["attributeName", name], ["typeName", type]]}
 / "attribute(" _ name:AttribNameOrWildCard _ ")" {return ["attributeTest", ["attributeName", name]]}
 / "attribute()" {return ["attributeTest"]}

// 196
AttribNameOrWildCard = name:AttributeName {return ["QName"].concat(name)} / ("*" {return ["star"]})

// 197
SchemaAttributeTest
 = "schema-attribute(" _ decl:AttributeDeclaration _ ")" {return ["schemaAttributeTest"].concat(decl)}

// 198
AttributeDeclaration = AttributeName

// 199
ElementTest
 = "element" _ "(" _ name:ElementNameOrWildCard _ "," _ type:TypeName _ ")" {return ["elementTest", ["elementName"].concat(name), ["typeName"].concat(type)]}
 / "element" _ "(" _ name:ElementNameOrWildCard _ ")" {return ["elementTest", ["elementName"].concat(name)]}
 / "element" _ "(" _ ")" {return ["anyElementTest"]}

// 200
ElementNameOrWildCard = name:ElementName {return ["QName"].concat(name)} / ("*" {return ["star"]})

// 201
SchemaElementTest = "schema-element" _ "(" decl:ElementDeclaration ")" {return ["schemaElementTest"].concat(decl)}

// 202
ElementDeclaration = ElementName

// 203
AttributeName = EQName

// 204
ElementName = EQName

// 205
SimpleTypeName = TypeName

// 206
TypeName = EQName

// 207
FunctionTest = annotations:Annotation* test:(AnyFunctionTest / TypedFunctionTest) {return [test[0]].concat(annotations).concat(test.slice(1))}

// 208
AnyFunctionTest = "function" _ "(" _ "*" _ ")" {return ["anyFunctionTest"]}

// 209
TypedFunctionTest
 = "function" _ "(" _ paramTypeList:(lhs:SequenceType rhs:("," _ t:SequenceType {return t})* {return lhs.concat.apply(lhs, rhs)})? _ ")" S "as" S returnType:SequenceType {return ["functionTest", ["paramTypeList", paramTypeList], returnType]}

// 210
MapTest = AnyMapTest / TypedMapTest

// 211
AnyMapTest = "map" _ "(" _ "*" _ ")" {return ["anyMapTest"]}

// 212
TypedMapTest = "map" _ "(" _ keyType:AtomicOrUnionType _ "," _ valueType:SequenceType _ ")" {return ["typedMapTest", keyType, valueType]}

// 213
ArrayTest = AnyArrayTest / TypedArrayTest

// 214
AnyArrayTest = "array" _ "(" _ "*" _ ")" {return ["anyArrayTest"]}

// 215
TypedArrayTest = "array" _ "(" _ type:SequenceType _ ")" {return ["typedArrayTest", type]}

// 216
ParenthesizedItemType = "(" _ type:ItemType _ ")" {return ["parenthesizedItemType", type]}

// 217
URILiteral = StringLiteral

// 219
IntegerLiteral = digits:Digits {return ["integerConstantExpr", digits]}

// 220
DecimalLiteral
 = "." digits:Digits {return ["decimalConstantExpr", parseFloat("." + digits)]}
 / decimal:$(Digits "." Digits?) {return ["decimalConstantExpr", parseFloat(decimal)]}

// 221
DoubleLiteral
 = double:$((("." Digits) / (Digits ("." [0-9]*)?)) [eE] [+-]? Digits) {return ["doubleConstantExpr", parseFloat(double)]}

// 222
StringLiteral
 = ('"' lit:(PredefinedEntityRef / CharRef / EscapeQuot / [^"&])* '"' {return lit.join('')})
 / ("'" lit:(PredefinedEntityRef / CharRef / EscapeApos / [^'&])* "'" {return lit.join('')})

// 223
URIQualifiedName = uri:BracedURILiteral localName:NCName {return [uri, localName]}

// 224
BracedURILiteral = "Q" _ "{" uri:[^{}]* "}" {return uri.join('').trim()}

// 225 TODO: Not in XPath mode
PredefinedEntityRef
 = "&" c:(
    "lt" {return "<"}
    / "gt" {return ">"}
    / "amp" {return "&"}
    / "quot" {return "&"}
    / "apos" {return "\'"}) ";" {return c}

// 226
EscapeQuot
 = "\"\"" {return "\""}

// 227
EscapeApos
 = "''" {return "'"}

// 231
Comment
 = "(:" (CommentContents / Comment)* ":)"

// 233
CharRef
 = ("&#x" codePoint:([0-9a-fA-F]+) ";") {return parseCodePoint(parseInt(charref, 16))}
 / ("&#" codePoint:([0-9]+) ";") {return parseCodePoint(parseInt(charref, 10))}

// 234 Note: https://www.w3.org/TR/REC-xml-names/#NT-QName
QName = PrefixedName / UnprefixedName

// 235 Note: https://www.w3.org/TR/REC-xml-names/#NT-NCName
NCName = start:NCNameStartChar rest:(NCNameChar*) {return start + rest.join("")}

// 237 Note: https://www.w3.org/TR/REC-xml/#NT-Char
Char = [\t\n\r -\uD7FF\uE000\uFFFD] / [\uD800-\uDBFF][\uDC00-\uDFFF] /* any Unicode character, excluding the surrogate blocks, FFFE, and FFFF. */

// 238
Digits
 = digits:[0-9]+ {return parseInt(digits.join(""), 10)}

// 239
CommentContents
 = !"(:" !":)" Char

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

// XML Types
PrefixedName = prefix:Prefix ":" local:LocalPart {return [prefix, local]}

UnprefixedName = local:LocalPart {return ['', local]}

LocalPart = NCName

Prefix = NCName

NCNameStartChar = [A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD] / [\uD800-\uDB7F][\uDC00-\uDFFF]

NCNameChar = NCNameStartChar / [\-\.0-9\xB7\u0300-\u036F\u203F\u2040]

NameChar = NCNameChar / ":"

NameStartChar = NCNameStartChar / ":"

Name = $(NameStartChar (NameChar)*)

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

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
      return rhs.reduce(function(lh, rh) {return [kind, ["firstOperand", lh], ["secondOperand", rh]]}, lhs);
  }

  function isAttributeTest (nodeTest) {
    return nodeTest[0] === "attributeTest" || nodeTest[0] === "schemaAttributeTest";
  }

  function accumulateDirContents (parts, expressionsOnly, normalizeWhitespace) {
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

		if (typeof result[0] === "string" && result.length === 0) {
		  return [];
		}

		if (normalizeWhitespace) {
		  result = result.filter(function (item, i) {
		    if (typeof item !== 'string') {
		      return true;
		    }
		    if (/^\s*$/.test(item)) {
		      return false;
		    }
		    return true;
		  });
		}

		if (result.length > 1 || expressionsOnly){
          for (var i = 0; i < result.length; i++) {
            if (typeof result[i] === "string") {
              result[i] = ["stringConstantExpr", ["value", result[i]]];
            }
          }
        }
        return result;
    }

    function wrapInSequenceExprIfNeeded(expr) {
      switch(expr[0]){
        // These expressions do not have to be wrapped (are allowed in a filterExpr)
        case "constantExpr":
        case "varRef":
        case "contextItemExpr":
        case "functionCallExpr":
        case "sequenceExpr":
        case "elementConstructor":
        case "computedElementConstructor":
        case "computedAttributeConstructor":
        case "computedDocumentConstructor":
        case "computedTextConstructor":
        case "computedCommentConstructor":
        case "computedNamespaceConstructor":
        case "computedPIConstructor":
        case "orderedExpr":
        case "unorderedExpr":
        case "namedFunctionRef":
        case "inlineFunctionExpr":
        case "dynamicFunctionInvocationExpr":
        case "mapConstructor":
        case "arrayConstructor":
        case "stringConstructor":
        case "unaryLookup":
          return expr;
      }
      return ["sequenceExpr", expr];
    }

	function throwError (code, cause) {
	  throw new Error(code + ": " + cause);
    }

	function getQName (qname) {
	  return qname.length === 1 ? qname[0] : qname[0].prefix + ':' + qname[1]
	}

	function assertEqualQNames (a, b) {
	   var nameA = getQName(a);
	   var nameB = getQName(b);
	   if (nameA !== nameB) {
	     throwError(
		   "XQST0118",
		   "The start and the end tag of an element constructor must be equal. \"" +
		     nameA +
			 "\" does not match \"" +
			 nameB +
			 "\"");
	   }
    }
}

// 1
Module
 = _ versionDecl:VersionDeclaration? _ module:(LibraryModule / MainModule) _
   {return ["module"].concat(versionDecl ? [versionDecl] : []).concat([module])}

// TODO Implement
MainModule
 = prolog:Prolog _ queryBody:QueryBody
   {return ["mainModule"].concat(prolog ? [prolog] : []).concat([queryBody])}

// 2
VersionDeclaration
 = "xquery" _ versionAndEncoding:(
    ("encoding" S e:StringLiteral {return ["encoding", e]})
    / ("version" S version:StringLiteral encoding:(S "encoding" S e:StringLiteral {return e})?
	  {return [["version", version]].concat(encoding ? [["encoding", encoding]] : [])}
	  )) _ Separator
  {return ["versionDecl"].concat(versionAndEncoding)}

// 4
LibraryModule
 = moduleDecl:ModuleDecl _ prolog:Prolog
   {return ["libraryModule", moduleDecl].concat(prolog ? [prolog] : [])}

// 5
ModuleDecl
 = "module" S "namespace" S prefix:$NCName _ "=" _ uri:URILiteral _ Separator
   {return ["moduleDecl", ["prefix", prefix], ["uri", uri]]}

// 6
Prolog
 = moduleSettings:(prologPart:(DefaultNamespaceDecl / Setter / NamespaceDecl / Import) _ Separator _ {return prologPart})*
   declarations:(prologPart:(ContextItemDecl / AnnotatedDecl / OptionDecl) _ Separator _{return prologPart})*
   {return moduleSettings.length === 0 && declarations.length === 0 ? null : ["prolog"].concat(moduleSettings).concat(declarations)}

// 7
Separator = ";"

// 8
Setter
 = BoundarySpaceDecl / DefaultCollationDecl / BaseURIDecl / ConstructionDecl / OrderingModeDecl / EmptyOrderDecl / CopyNamespacesDecl / DecimalFormatDecl

// 9
BoundarySpaceDecl
 = "declare" S "boundary-space" S value:("preserve" / "strip")
   {return ["boundarySpaceDecl", value]}

// 10
DefaultCollationDecl
 = "declare" S "default" "collation" value:URILiteral
   {return ["defaultCollationDecl", value]}

// 11
BaseURIDecl
 = "declare" S "base-uri" S value:URILiteral
   {return ["baseUriDecl", value]}

// 12
ConstructionDecl
 = "declare" S "construction" S value:("strip" / "preserve")
   {return ["constructionDecl", value]}

// 13
OrderingModeDecl
 = "declare" S "ordering" S value:("ordered" / "unordered")
   {return ["orderingModeDecl", value]}

// 14
EmptyOrderDecl
 = "declare" S "default" S "order" S "empty" S value:("greatest" / "least")
   {return ["emptyOrderDecl", value]}

// 15
CopyNamespacesDecl
 = "declare" S "copy-namespaces" S preserveMode:PreserveMode _ "," _ inheritMode:InheritMode
   {return["copyNamespacesDecl", ["preserveMode", preserveMode], ["inheritMode", inheritMode]]}

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
 = "import" S "schema"
   prefix:(S p:SchemaPrefix {return p})? _
   namespace:URILiteral
   targetLocations:( S "at" S first:URILiteral rest:( S ","  S uri:URILiteral {return uri})* {return [first].concat(rest)})?
   {
     return ["schemaImport"]
       .concat(prefix ? [prefix] : [])
       .concat([["targetNamespace", namespace]])
       .concat(targetLocations ? [targetLocations] : [])
    }

// 22
SchemaPrefix
 = "namespace" S prefix:NCName _ "=" {return ["namespacePrefix", prefix]}
 / ("default" S "element" S "namespace" AssertAdjacentOpeningTerminal) {return ["defaultElementNamespace"]}

// 23
ModuleImport
 = "import" S "module"
   prefix:(S "namespace" S prefix:$NCName _ "=" {return prefix})?
  // TODO: The URILiteral should be preceded with whitespace if the no prefix is set
   _ uri:URILiteral (S "at" URILiteral (_ "," _ URILiteral)*)?
   {return ["moduleImport", ["namespacePrefix", prefix], ["targetNamespace", uri]]}

// 24
NamespaceDecl
 = "declare" S "namespace" S prefix:NCName _ "=" _ uri:URILiteral
   {return ["namespaceDecl", ["prefix", prefix], ["uri", uri]]}

// 25
DefaultNamespaceDecl
 = "declare" S "default" S elementOrFunction:("element" / "function") S "namespace" S uri:URILiteral
   {return ["defaultNamespaceDecl", ["defaultNamespaceCategory", elementOrFunction], ["uri", uri]]}

// 26
AnnotatedDecl
 = "declare" S annotations:(a:Annotation S {return a})* decl:(VarDecl / FunctionDecl)
   {return [decl[0]].concat(annotations).concat(decl.slice(1))}

// 27
Annotation
 = "%" _ annotation:EQName params:(_ "(" _ lhs:Literal rhs:(_ "," _ part:Literal {return part})* _")" {return lhs.concat(rhs)})?
   {return ["annotation", ["annotationName"].concat(annotation)].concat(params ? ["arguments", params] : [])}

// 28
VarDecl
 = "variable" S "$" _ name:VarName varType:(_ t:TypeDeclaration {return t})?
      value:((_ ":=" _ value:VarValue {return ["varValue", value]})
      / (S "external" defaultValue:(_ ":=" _ v:VarDefaultValue {return ["varValue", v]})? {return ["external"].concat(defaultValue ? [defaultValue] : [])}))
  {return ["varDecl", ["varName"].concat(name)].concat(varType ? [varType] : []).concat([value])}

// 29
VarValue
 = ExprSingle

// 30
VarDefaultValue
 = ExprSingle

// 31 TODO: Convert to XQueryX
ContextItemDecl
 = "declare" S "context" S "item" (S "as" ItemType)? ((_ ":=" _ VarValue) / (S "external" (_ ":=" _ VarDefaultValue)?))
   {return {type: 'contextItemDecl'}}

// 32
FunctionDecl
 = "function" S (!ReservedFunctionNames) name:EQName _ "(" _ paramList:ParamList? _ ")" typeDeclaration:(S "as" S t:SequenceType {return t})? _ body:((body:FunctionBody {return ["functionBody", body]}) / ("external" {return ["externalDefinition"]}))
 {
   return [
   "functionDecl",
      ["functionName"].concat(name),
      ["paramList"].concat(paramList || [])
    ]
    .concat(typeDeclaration ? [["typeDeclaration"].concat(typeDeclaration)] : [])
    .concat([body])}

// 33
ParamList
 = lhs:Param rhs:(_ "," _ param:Param {return param})* {return [lhs].concat(rhs)}

// 34
Param
 = "$" varName:EQName typeDeclaration:(S t:TypeDeclaration {return t})?
 {return ["param", ["varName"].concat(varName)].concat(typeDeclaration ? [typeDeclaration] : [])}

// 35
FunctionBody
 = EnclosedExpr

// 36
EnclosedExpr
 = "{" _ e:Expr? _ "}" {return e || ["sequenceExpr"]}

// 37
OptionDecl
 = "declare" S  "option" S EQName S StringLiteral {return {type: 'optionDecl'}}

QueryBody
 = expr:Expr {return ["queryBody", expr]}

// 39
Expr
 = lhs:ExprSingle rhs:(_ "," _ expr:ExprSingle{return expr})*
   {return rhs.length === 0 ? lhs : ["sequenceExpr", lhs].concat(rhs)}

// 40 TODO, fix proper
ExprSingle
 = FLWORExpr
 / QuantifiedExpr
// / SwitchExpr
// / TypeswitchExpr
 / IfExpr
// / TryCatchExpr
 / OrExpr

// 41
FLWORExpr
 = initialClause:InitialClause intermediateClauses:(_ intermediateClause:IntermediateClause {return intermediateClause})* _ returnClause:ReturnClause
   {return ["flworExpr", initialClause].concat(intermediateClauses).concat([returnClause])}

// 42
InitialClause
 = ForClause
 / LetClause
// / WindowClause

// 43
IntermediateClause
 = InitialClause
 / WhereClause
 / GroupByClause
 / OrderByClause
// / CountClause

// 44
ForClause
 = "for" S first:ForBinding rest:(_ "," _ binding:ForBinding {return binding})*
   {return ["forClause", first].concat(rest)}

// 45
ForBinding
 = "$" varName:VarName _ typeDecl:TypeDeclaration? _ empty:AllowingEmpty? _ pos:PositionalVar? _ "in"_ expr:ExprSingle
   {
     return [
	   "forClauseItem",
	   ["typedVariableBinding", ["varName"].concat(varName).concat(typeDecl ? [typeDecl] : [])]]
	   .concat(empty ? [["allowingEmpty"]] : [])
	   .concat(pos ? [pos] : [])
	   .concat([["forExpr", expr]])}

// 46
AllowingEmpty
 = "allowing" S "empty"

// 47
PositionalVar
 = "at" S "$" varName:VarName {return ["positionalVariableBinding"].concat(varName)}

// 48
LetClause
 = "let" _ first:LetBinding _ rest:("," _ binding:LetBinding {return binding})*
   {return ["letClause", first].concat(rest)}

// 49
LetBinding
 = "$" varName:VarName _ typeDecl:TypeDeclaration? _ ":=" _ expr:ExprSingle
   {return ["letClauseItem", ["typedVariableBinding", ["varName"].concat(varName)].concat(typeDecl ? [typeDecl] : []), ["letExpr", expr]]}

// 60
WhereClause
 = "where" AssertAdjacentOpeningTerminal _ expr:ExprSingle {return ["whereClause", expr]}

// 61
GroupByClause
 = "group" S "by" _ groupingSpecList:GroupingSpecList {return ["groupByClause"].concat(groupingSpecList)}

// 62
GroupingSpecList
 = first:GroupingSpec rest:(_ "," _ gs:GroupingSpec {return gs})* {return [first].concat(rest)}

// 63
GroupingSpec
 = varName:GroupingVariable init:groupVarInitialize? col:(_ "collation" _ uri:URILiteral {return ["collation", uri]})?
   {return ["groupingSpec", varName].concat(init ? [init] : []).concat(col ? [col] : [])}

groupVarInitialize
 = _ t:TypeDeclaration? _ ":=" _ val:ExprSingle
   {
     return ["groupVarInitialize"]
       .concat(t ? [["typeDeclaration"].concat(t)] : [])
	   .concat([["varValue", val]])
   }

// 64
GroupingVariable
 = "$" varName:VarName {return ["varName"].concat(varName)}

// 65
OrderByClause
 = stable:(("order" S "by" {return false}) / ("stable" S "order" S "by" {return true})) _ specList:OrderSpecList
 {return ["orderByClause"].concat(stable ? [["stable"]] : []).concat(specList)}

// 66
OrderSpecList
 = first:OrderSpec rest:(_ "," _ os:OrderSpec {return os})*
   {return [first].concat(rest)}

// 67
OrderSpec
 = expr:ExprSingle _ modifier:OrderModifier
   {return ["orderBySpec", ["orderByExpr", expr]].concat(modifier ? [modifier] : [])}

// 68
OrderModifier
 = kind:("ascending" / "descending")? _ empty:("empty" _ ("greatest" {return "empty greatest"}/ "least" {return "empty least"}))? _ collation:("collation" URILiteral)?
   {
	 if (!kind && ! empty && !collation) {
	    return null;
	 }
     return ["orderModifier"]
	   .concat(kind ? [["orderingKind", kind]] : [])
	   .concat(empty ? [["emptyOrderingMode", empty]] : [])
	   .concat(collation ? [["collation", collation]] : [])
   }

// 69
ReturnClause
 = "return" _ expr:ExprSingle {return ["returnClause", expr]}

// 70
QuantifiedExpr
 = kind:("some" / "every") S quantifiedExprInClauses:(
   "$" varName:VarName S "in" S exprSingle:ExprSingle restExpr:("," _ "$" name:VarName S "in" S expr:ExprSingle
     {return [[varName, exprSingle]]
       .concat(rest)
       .map(function (inClause) {
           return ["quantifiedExprInClause", ["typedVariableBinding", ["varName"].concat(inClause[0])], ["sourceExpr", inClause[1]]]
         })
        }
 )*) S "satisfies" S predicateExpr:ExprSingle
 {return ["quantifiedExpr", ["quantifier", kind]].concat(quantifiedExprInClauses).concat([predicateExpr])}

// 77
IfExpr
 = "if" _ "(" _ ifClause:Expr _ ")" _ "then" AssertAdjacentOpeningTerminal _ thenClause:ExprSingle _ "else" AssertAdjacentOpeningTerminal _ elseClause:ExprSingle
   {return ["ifThenElseExpr", ["ifClause", ifClause], ["thenClause", thenClause], ["elseClause", elseClause]]}

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
 {return rhs ? [rhs[0], ["firstOperand", lhs], ["secondOperand", rhs[1]]] : lhs}

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
 {return rhs.reduce(function (lhs, additiveOp) {return [additiveOp[0], ["firstOperand", lhs], ["secondOperand", additiveOp[1]]]}, lhs)}

// 89
MultiplicativeExpr
 = lhs:UnionExpr rhs:( _ op:(
   "*" {return "multiplyOp"}
   / "div" AssertAdjacentOpeningTerminal {return "divOp"}
   / "idiv" AssertAdjacentOpeningTerminal {return "idivOp"}
   / "mod" AssertAdjacentOpeningTerminal {return "modOp"})
   _ expr:UnionExpr {return [op, expr]})*
 {return rhs.reduce(function (lhs, multiplicativeOp) {return [multiplicativeOp[0], ["firstOperand", lhs], ["secondOperand", multiplicativeOp[1]]]}, lhs)}

// 90
UnionExpr
 = lhs:IntersectExpr rhs:( _ ("|"/("union" AssertAdjacentOpeningTerminal)) _ expr:IntersectExpr {return expr})*
 {return makeBinaryOp("unionOp", lhs, rhs)}

// 91 Note: was InstanceofExpr ("intersect"/"except" InstanceofExpr)*, but this does not work out with () intersect () except ().
IntersectExpr
 = lhs:InstanceofExpr rhs:(_ op:("intersect" {return "intersectOp"} / "except" {return "exceptOp"}) AssertAdjacentOpeningTerminal _ expr:IntersectExpr {return [op, expr]})*
 {return rhs.reduce(function (lhs, intersectOp) {return [intersectOp[0], ["firstOperand", lhs], ["secondOperand", intersectOp[1]]]}, lhs)}

// 92
InstanceofExpr
 = lhs:TreatExpr rhs:(_ "instance" S "of" AssertAdjacentOpeningTerminal _ rhs:SequenceType {return rhs})? {return rhs ? ["instanceOfExpr", ["argExpr", lhs], ["sequenceType"].concat(rhs)] : lhs}
 / TreatExpr

// 93
TreatExpr
 = lhs:CastableExpr rhs:(_ "treat" S "as" AssertAdjacentOpeningTerminal _ rhs:SequenceType {return rhs})? {return rhs ? ["treatExpr", ["argExpr", lhs], ["sequenceType"].concat(rhs)] : lhs}

// 94
CastableExpr
 = lhs:CastExpr rhs:(_ "castable" S "as" AssertAdjacentOpeningTerminal _ rhs:SingleType {return rhs})? {return rhs ? ["castableExpr", ["argExpr", lhs], ["singleType", rhs]] : lhs}

// 95
CastExpr
 = lhs:ArrowExpr rhs:(_ "cast" S "as" AssertAdjacentOpeningTerminal _ rhs:SingleType {return rhs})? {return rhs ? ["castExpr", ["argExpr", lhs], ["singleType", rhs]] : lhs}

// 96
ArrowExpr
 = argExpr:UnaryExpr functionParts:( _ "=>" _ functionSpecifier:ArrowFunctionSpecifier _ argumentList:ArgumentList {return [functionSpecifier, argumentList]})* {
     return functionParts.reduce(function (argExpr, functionPart) {
       return ["arrowExpr", ["argExpr", argExpr], functionPart[0], ["arguments"].concat(functionPart[1])]
     }, argExpr);
   }

// 97
UnaryExpr
 = "-" expr:UnaryExpr {return ["unaryMinusOp", ["operand", expr]]}
 / "+" expr:UnaryExpr {return ["unaryPlus", ["operand", expr]]}
 / ValueExpr

// 98
ValueExpr
= ValidateExpr
 / ExtensionExpr
 / SimpleMapExpr

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

// 102
ValidateExpr
 = "validate" modeOrType:(_ mode:ValidationMode {return ["validationMode", mode]} / (_ "type" _ type:TypeName {return ["type"].concat(type)}))? _ "{" _ expr:Expr _ "}"
   {return ["validateExpr"].concat(modeOrType ? [modeOrType] : []).concat([["argExpr", expr]])}

// 103
ValidationMode
 = "lax" / "strict"

// 104
ExtensionExpr
 = pragma:Pragma+ _ "{" _ Expr? _ "}" {return ["extensionExpr"].concat(pragma)}

// 105
Pragma
 = "(#" S? name:EQName contents:(S contents:PragmaContents {return contents})? _ "#)" {return contents ? ["pragma", ["pragmaName", name], ["pragmaContents", contents]] : ["pragma", ["pragmaName", name]]}

// 106
PragmaContents
 = chars:(char:Char !'#)' {return char})* {return chars.join('')}

// 107
SimpleMapExpr
 = lhs:PathExpr rhs:( _ "!" _ expr:PathExpr {return expr})* {return rhs.length ? ["simpleMapExpr", [lhs].concat(rhs)] : lhs}

// === 108 - 110 (simplified for ease of parsing)
PathExpr
 = RelativePathExpr
 / AbsoluteLocationPath

RelativePathExpr
 = lhs:StepExprWithForcedStep _ abbrev:LocationPathAbbreviation _ rhs:RelativePathExprWithForcedStep
   {return ["pathExpr", lhs, abbrev].concat(rhs)}
  / lhs:StepExprWithForcedStep _ "/" _ rhs:RelativePathExprWithForcedStep
   {return ["pathExpr", lhs].concat(rhs)}
  / StepExprWithoutStep // Pass-through for normal stuff
  / step:StepExprWithForcedStep {return ["pathExpr", step]}

// Parses expressions, we already now we are in a path so each will be step expression
RelativePathExprWithForcedStep
 = lhs:StepExprWithForcedStep _ abbrev:LocationPathAbbreviation _ rhs:RelativePathExprWithForcedStep
   {return [lhs, abbrev].concat(rhs)}
 / lhs:StepExprWithForcedStep _ "/" _ rhs:RelativePathExprWithForcedStep
   {return [lhs].concat(rhs)}
 / step:StepExprWithForcedStep
    {return [step]}

// Parses expressions which are not in a path i.e. which are not step expressions
StepExprWithoutStep
 = PostfixExprWithoutStep

// Parses expressions in a path i.e. must be a step expression
StepExprWithForcedStep
 = expr:PostfixExprWithStep {return ["stepExpr"].concat(expr)}
 / AxisStep

AbsoluteLocationPath
 = "/" _ path:RelativePathExprWithForcedStep
   {return ["pathExpr", ["rootExpr"]].concat(path)}
 / abbrev:LocationPathAbbreviation _ path: RelativePathExprWithForcedStep
   {return ["pathExpr", ["rootExpr"], abbrev].concat(path)}
 / "/"
   {return ["pathExpr", ["rootExpr"]]}

LocationPathAbbreviation
 = "//" {return ["stepExpr", ["xpathAxis", "descendant-or-self"], ["anyKindTest"]]}

// 121 Expression must in a step expression, i.e. expression must be wrapped in a filterExpr
PostfixExprWithStep
 = expr:(expr:PrimaryExpr {return wrapInSequenceExprIfNeeded(expr)}) postfixExpr:(
     (_ filter:Predicate {return filter})
   / (_ argList:ArgumentList {return ["argumentList", argList]})
   / (_ lookup:Lookup {return lookup})
   )* {
let toWrap = expr;

let predicates = [];
postfixExpr.forEach(postFix => {
  if (postFix[0] === "predicate") {
    predicates.push(postFix);
  }
  else if (postFix[0] === "argumentList") {
    if (predicates.length) {
      // Wrap in pathExpr to fit the predicates
      toWrap = ["pathExpr", ["stepExpr", ["filterExpr", toWrap], ["predicates"].concat(predicates)]];
      predicates = [];
    }
    toWrap = ["dynamicFunctionInvocationExpr", ["functionItem", toWrap], ["arguments"].concat(postFix[1])];
  }
});

return predicates.length ?
  [["filterExpr", toWrap], ["predicates"].concat(predicates)] :
  [["filterExpr", toWrap]];
}

// Expression is not in a step expression, i.e. can not have predicates and does not need filterExpr wrapper
PostfixExprWithoutStep
 = expr:PrimaryExpr !(_ Predicate / _ ArgumentList) {return expr}


// === end of changes ===

// 111
AxisStep
 = stepExpr:(ReverseStep / ForwardStep) predicates:PredicateList {return predicates.length === 0 ? stepExpr : stepExpr.concat([predicates])}

// 112
ForwardStep
 = axis:ForwardAxis nodeTest:NodeTest {return ["stepExpr", ["xpathAxis", axis], nodeTest]}
 / AbbrevForwardStep

// 113
ForwardAxis
 = ("child" "::") {return "child"}
 / ("descendant" "::") {return "descendant"}
 / ("attribute" "::") {return "attribute"}
 / ("self" "::") {return "self"}
 / ("descendant-or-self" "::") {return "descendant-or-self"}
 / ("following-sibling" "::") {return "following-sibling"}
 / ("following" "::") {return "following"}

// 114
AbbrevForwardStep
 = attributeTest:"@"? nodeTest:NodeTest
   {return attributeTest || isAttributeTest(nodeTest) ? ["stepExpr", ["xpathAxis", "attribute"], nodeTest] : ["stepExpr", ["xpathAxis" , "child"], nodeTest]}

// 115
ReverseStep
 = step:(axis:ReverseAxis nodeTest:NodeTest {return ["stepExpr", ["xpathAxis", axis], nodeTest]}) / step:AbbrevReverseStep {return step}

// 116
 ReverseAxis
 = ("parent" "::") {return "parent"}
 / ("ancestor" "::") {return "ancestor"}
 / ("preceding-sibling" "::") {return "preceding-sibling"}
 / ("preceding" "::") {return "preceding"}
 / ("ancestor-or-self" "::") {return "ancestor-or-self"}

// 117
AbbrevReverseStep
 = ".." {return ["stepExpr", ["xpathAxis", "parent"], ["anyKindTest"]]}

// 118
NodeTest
 = KindTest / NameTest

// 119
NameTest
 = Wildcard / name:EQName {return ["nameTest"].concat(name)}

// 120
Wildcard
 = "*:" name:NCName {return ["Wildcard", ["star"], ["NCName", name]]}
 / "*" {return ["Wildcard"]}
 / uri:BracedURILiteral "*" {return ["Wildcard", ["uri", uri], ["star"]]}
 / prefix:NCName ":*" {return ["Wildcard", ["NCName", prefix], ["star"]]}

// 122
ArgumentList
 = "(" _ args:(first:Argument rest:( _ "," _ arg:Argument {return arg})* {return [first].concat(rest)})? _ ")" {return args||[]}

// 123
PredicateList
 = predicates:(_ predicate:Predicate {return predicate})* {return predicates.length ? ["predicates"].concat(predicates) : []}

// 124
Predicate
 = "[" _  expr:Expr _ "]" {return ["predicate", expr]}

// 125
Lookup
 = "?" _ KeySpecifier

KeySpecifier
 = NCName / IntegerLiteral / ParenthesizedExpr / "*"

// 127
ArrowFunctionSpecifier = name:EQName {return ["EQName"].concat(name)} / VarRef / ParenthesizedExpr

// 128
PrimaryExpr
 = Literal
 / VarRef
 / ParenthesizedExpr
 / ContextItemExpr
 / FunctionCall
// / OrderedExpr
// / UnorderedExpr
 / NodeConstructor
 / FunctionItemExpr
 / MapConstructor
 / ArrayConstructor
// / StringConstructor
// / UnaryLookup

// 129
Literal
 = NumericLiteral / lit:StringLiteral { return ["stringConstantExpr", ["value", lit]]}

// 130
// Note: changes because double accepts less than decimal, accepts less than integer
NumericLiteral = literal:(DoubleLiteral / DecimalLiteral / IntegerLiteral) ![a-zA-Z] {return literal}

// 131
VarRef
 = "$" varName:VarName {return ["varRef", ["name"].concat(varName)]}

// 132
VarName
 = EQName

// 133
ParenthesizedExpr
 = "(" _ expr:Expr _ ")" {return expr}
 / "(" _ ")" {return ["sequenceExpr"]}

// 134
ContextItemExpr
 = "." !"." {return ["contextItemExpr"]}

// 137
FunctionCall
// Do not match reserved function names as function names, they should be tests or other built-ins.
// Match the '(' because 'elementWhatever' IS a valid function name
 = !(ReservedFunctionNames _ "(") name:EQName _ args:ArgumentList {return ["functionCallExpr", ["functionName"].concat(name), ["arguments"].concat(args)]}

// 138
Argument
 = ArgumentPlaceholder
 / ExprSingle

// 139
ArgumentPlaceholder
 = "?" {return ["argumentPlaceholder"]}

// 140
NodeConstructor
 = DirectConstructor
 / ComputedConstructor

// 141
DirectConstructor
 = DirElemConstructor
 / DirCommentConstructor
 / DirPIConstructor

// 142
DirElemConstructor
 = "<" name:QName attList:DirAttributeList contents:(
   ("/>" {return null}) /
   (">"  contents:DirElemContent* _ "</" endName:QName ExplicitWhitespace? ">"
     {
	   assertEqualQNames(name, endName);
	   return accumulateDirContents(contents, true, true)
	 }))
 {
   return [
       'elementConstructor',
	   ["tagName"].concat(name)
	 ]
	 .concat(attList.length ? [["attributeList"].concat(attList)] : [])
	 .concat(contents && contents.length ? [["elementContent"].concat(contents)] : [])
  }

// 143
DirAttributeList
 = attrs:(ExplicitWhitespace attr:(attribute)? {return attr})*
   {
     return attrs
	   .filter(Boolean)
   }

attribute
 = name:QName ExplicitWhitespace? "=" ExplicitWhitespace? value:DirAttributeValue
   {
     if (name.length === 1 && name[0] === "xmlns") {
	   if (typeof value[0] !== "string") {
	     throwError("XQST0022", "A namespace declaration may not contain enclosed expressions");
       }
	   return ["namespaceDeclaration", ["uri", value[0]]]
	 }
	 if (name[0].prefix === "xmlns") {
	   if (typeof value[0] !== "string") {
	     throwError("XQST0022", "The namespace declaration for 'xmlns:" + name[1] + "' may not contain enclosed expressions");
       }
	   return ["namespaceDeclaration", ["prefix", name[1]], ["uri", value[0]]]
	 }
	 return [
	   "attributeConstructor",
	   ["attributeName"].concat(name),
	   value.length === 1 && typeof value[0] === "string" ? ["attributeValue", value[0]] : ["attributeValueExpr"].concat(value)]}

// 144
DirAttributeValue
 = '"' chars:(EscapeQuot / QuotAttrValueContent)* '"' {return accumulateDirContents(chars, false, false)}
 / "'" chars:(EscapeApos / AposAttrValueContent)* "'" {return accumulateDirContents(chars, false, false)}

// 145
QuotAttrValueContent = char:QuotAttrValueContentChar / CommonContent

// 146
AposAttrValueContent = char:AposAttrValueContentChar / CommonContent

// 147
// Note: changed the order around to prevent CDATA to be parsed as element content
DirElemContent
 = content:CDataSection {return content}
 / content:DirectConstructor {return content}
 / content:CommonContent {return content}
 / content:$ElementContentChar {return content}

// 148
CommonContent
= char:PredefinedEntityRef
 / ref:CharRef
 / "{{" { return "\u007b" } // PegJS does not like unbalanced curly braces in JS context
 / "}}"  { return "\u007d" } // PegJS does not like unbalanced curly braces in JS context
 / EnclosedExpr

// 149
DirCommentConstructor = "<!--" contents:$DirCommentContents "-->" {return ["computedCommentConstructor", ["argExpr", ["stringConstantExpr", ["value", contents]]]]}

// 150
DirCommentContents = ((!"-" Char) / ("-" (!"-" Char)))*

// 151
DirPIConstructor = "<?" target:$PITarget contents:(ExplicitWhitespace contents:$DirPIContents {return contents})? "?>" {return ["computedPIConstructor", ["piTarget", target], ["piTargetExpr", ["stringConstantExpr", ["value", contents]]]]}

// 152
DirPIContents = (!"?>" Char)*

// 153
CDataSection = "<![CDATA[" contents:$CDataSectionContents "]]>" {return ["CDataSection", contents]}

// 154
CDataSectionContents = (!"]]>" Char)*

// 155
ComputedConstructor
 = CompDocConstructor
// / CompElemConstructor
/ CompAttrConstructor
//  / CompNamespaceConstructor
//  / CompTextConstructor
//  / CompCommentConstructor
//  / CompPIConstructor

// 156
CompDocConstructor
 = "document" _ expr:EnclosedExpr {return expr; /*return ["computedDocumentConstructor", expr]*/}

// 159
CompAttrConstructor
 = "attribute" name:(AssertAdjacentOpeningTerminal _ name:EQName {return ["tagName"].concat(name)} / ( _ "{" _ nameExpr:Expr _ "}" {return ["tagNameExpr", nameExpr]})) _ expr:EnclosedExpr
 {return ["computedAttributeConstructor", name].concat(expr ? [["valueExpr", expr]] : [])}

// 167
FunctionItemExpr
 = NamedFunctionRef
 / InlineFunctionExpr

// 168
NamedFunctionRef
 = name:EQName "#" integer:IntegerLiteral {return ["namedFunctionRef", ["functionName"], name, integer]}

// 169
InlineFunctionExpr
 = annotations:Annotation* _ "function" _ "(" _ params:ParamList? _ ")" _ typeDeclaration:( "as" S t:SequenceType _ {return [t]})? body:FunctionBody
 {
   return ["inlineFunctionExpr"]
     .concat(annotations)
     .concat([["paramList"].concat(params || [])])
     .concat(typeDeclaration ? ["sequenceType"].concat(typeDeclaration) : [])
     .concat([["functionBody"].concat(body)])
 }

// 170
MapConstructor
 = "map" _ "{" _ entries:(first:MapConstructorEntry rest:(_ "," _ e:MapConstructorEntry {return e})*{return [first].concat(rest)})? _ "}" {return ["mapConstructor"].concat(entries)}

// 171
MapConstructorEntry
 = k:MapKeyExpr _ ":" _ v:MapValueExpr {return ["mapConstructorEntry", k, v]}

// 172
MapKeyExpr
 = expr:ExprSingle {return ["mapKeyExpr", expr]}

// 173
MapValueExpr
 = expr:ExprSingle {return ["mapValueExpr", expr]}

// 174
ArrayConstructor
 = con:SquareArrayConstructor {return ["arrayConstructor", con]}
 / con:CurlyArrayConstructor {return ["arrayConstructor",  con]}

// 175
SquareArrayConstructor
 = "[" _ entries:(
     first:ExprSingle _ rest:("," _ e:ExprSingle {return e})*
     {return [first].concat(rest).map(function (elem) {return ["arrayElem", elem]})}
   )? _ "]" {return ["squareArray"].concat(entries)}

// 176
CurlyArrayConstructor
 = "array" _ e:EnclosedExpr {return ["curlyArray"].concat(e ? [["arrayElem", e]] : [])}

// 182
SingleType
 = typeName:SimpleTypeName optional:"?"? {return optional ? ["singleType", ["atomicType", typeName], ["optional"]] : ["singleType", ["atomicType", typeName]]}

// 183
TypeDeclaration
 = "as" S st:SequenceType {return ["typeDeclaration"].concat(st)}

// 184
SequenceType
 = "empty-sequence()" {return [["voidSequenceType"]]}
 / type:ItemType occurrence:(_ o:OccurrenceIndicator {return o})? {return [type].concat(occurrence ? [["occurrenceIndicator", occurrence]] : [])}

// 185
OccurrenceIndicator = "?" / "*" / "+"

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
AtomicOrUnionType = typeName:EQName {return ["atomicType"].concat(typeName)}

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
 = "element" _ "(" _ name:ElementNameOrWildCard _ "," _ type:TypeName _ ")" {return ["elementTest", ["elementName", name], ["typeName"].concat(type)]}
 / "element" _ "(" _ name:ElementNameOrWildCard _ ")" {return ["elementTest", ["elementName", name]]}
 / "element" _ "(" _ ")" {return ["elementTest"]}

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
TypedMapTest = "map" _ "(" _ keyType:AtomicOrUnionType _ "," _ valueType:SequenceType _ ")" {return ["typedMapTest", keyType, ["sequenceType"].concat(valueType)]}

// 213
ArrayTest = AnyArrayTest / TypedArrayTest

// 214
AnyArrayTest = "array" _ "(" _ "*" _ ")" {return ["anyArrayTest"]}

// 215
TypedArrayTest = "array" _ "(" _ type:SequenceType _ ")" {return ["typedArrayTest", ["sequenceType"].concat(type)]}

// 216
ParenthesizedItemType = "(" _ type:ItemType _ ")" {return ["parenthesizedItemType", ["sequenceType"].concat(type)]}

// 217
URILiteral = StringLiteral

// 218
EQName = uri:URIQualifiedName {return [{prefix: null, URI: uri[0]}, uri[1]]}
 / QName

// 219
IntegerLiteral = digits:Digits {return ["integerConstantExpr", ["value", digits]]}

// 220
DecimalLiteral
 = "." digits:Digits {return ["decimalConstantExpr", ["value", digits]]}
 / decimal:$(Digits "." Digits?) {return ["decimalConstantExpr", ["value", decimal]]}

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

// 228
ElementContentChar = ![{}<&] Char

// 229
QuotAttrValueContentChar = ![\"{}<&] ch:Char {return ch}

// 230
AposAttrValueContentChar = ![\'{}<&] ch:Char {return ch}

// 231
Comment
 = "(:" (CommentContents / Comment)* ":)"

// 232
PITarget = !(("X"/"x")("M"/"m")("L"/"l")) Name

// 233
CharRef
 = codePoint:("&#x" codePoint:([0-9a-fA-F]+) ";" {return codePoint}) {return parseCodePoint(parseInt(codePoint, 16))}
 / codePoint:("&#" codePoint:([0-9]+) ";" {return codePoint}) {return parseCodePoint(parseInt(codePoint, 10))}

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
PrefixedName = prefix:Prefix ":" local:LocalPart {return [{prefix: prefix}, local]}

UnprefixedName = local:LocalPart {return [local]}

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

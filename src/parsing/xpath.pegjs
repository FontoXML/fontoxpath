start
 = Expression

Expression
 = lhs:Test " " op:Operator " " rhs:Expression {return [op, lhs, rhs]}
 / "(" lhs:Expression ") " op:Operator " " rhs:Expression {return [op, lhs, rhs]}
 / "(" ex:Expression ")" { return ex }
 / Test

Test
 = fn:FunctionName "(" ex:Expression  ")" { return [fn, ex] }
 / Path

Path
 = RelativeLocationPath
 / AbsoluteLocationPath

RelativeLocationPath
 = lhs:Step abbrev:LocationPathAbbreviation rhs:RelativeLocationPath {return ["path",  lhs, ["path", abbrev, rhs]]}
 / lhs:Step "/" rhs:RelativeLocationPath {return ["path", lhs, rhs]}
 / Step

AbsoluteLocationPath
 = "/" path:RelativeLocationPath { return ["absolutePath", path] }
 / abbrev:LocationPathAbbreviation path: RelativeLocationPath { return ["absolutePath", ["path", abbrev, path]] }

LocationPathAbbreviation
 = "//" {return ["descendant-or-self", ["nodeType", "node"]]}

Operator
 = OperatorName
 / "*"
 / "|" {return "union"}
 / "+"
 / "-"
 / "="
 / "!="
 / "<"
 / "<="
 / ">"
 / ">="

OperatorName
 = "and"
 / "or"
 / "mod"
 / "div"

FunctionName
 = "count"
 / "not"

Step
 = axis:AxisSpecifier test:NodeTest predicates:Predicate* {
     if (!predicates.length) {
	 	return [axis, test];
	 }
     return [
     	axis,
		[
			"and",
			test,
			predicates.reduceRight(function (accum, predicate) { return ["and", predicate, accum];})
		]];
	 }
 / "@" test:AttributeTest { return ["attribute", test] }
 / AbbreviatedStep

AxisSpecifier
 = name:AxisName '::' { return name }
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
 = ".." { return ["parent", ["nodeType", "node"]] }
 / "." { return ["self", ["nodeType", "node"]] }

NodeTest
 = nodeType:NodeType "()" { return ["nodeType", nodeType] }
 / "true()" { return ["true"] }
 / "false()" { return ["false"] }
 / fn:CustomNodeTestName "()" { return ["customTest", fn, []]}
 / fn:CustomNodeTestName "(" args:NodeTestArguments ")" { return ["customTest", fn, args] }
 / "processing-instruction(" target:literal ")" { return ["nodeType", "processing-instruction", target] }
 / nodeName:NameTest { return ["nameTest", nodeName] }

CustomNodeTestName
 = prefix:[a-z]+ ":" postfix:string { return prefix.join('')+':'+postfix }
 /* Note: deprecated, always force to the namespaced version */
 / prefix:"fonto-" postfix:string { return "fonto:"+postfix }

NodeTestArguments
 = first:literal "," " "? rest:NodeTestArguments { return [first].concat(rest) }
 / argument:literal { return [argument] }

NameTest
 = "*"
 / chars:([a-zA-Z0-9\-:]+) { return chars.join("") }

NodeType
 = "comment"
 / "text"
 / "processing-instruction"
 / "node"

Predicate
 = "[" index:integer "]" { return ["index", index] }
 / "[" ex:Expression "]" { return ex }

AttributeTest
 = name:string "=" value:literal { return ["nameTest", name, value] }
 / name:string { return ["nameTest", name] }

literal
 = "\"" value:[^\"]* "\"" { return value.join("") }
 / "'" value:[^\']* "'" { return value.join("") }

string
 = chars:[a-zA-Z0-9\-_:]+ { return chars.join("") }

integer
 = digits: [0-9]+ { return parseInt(digits.join(""), 10) }

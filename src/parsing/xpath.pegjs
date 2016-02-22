start
 = Expression

Expression
 = lhs:Test " " op:OperatorName " " rhs:Expression {return [op, lhs, rhs]}
 / "(" lhs:Expression ") " op:OperatorName " " rhs:Expression {return [op, lhs, rhs]}
 / "(" ex:Expression ")" { return ex }
 / Test

Test
 = fn:FunctionName "(" ex:Expression  ")" { return [fn, ex] }
 / Step

Operator
 = OperatorName
 / "*"
 / "|"
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
 = axis:AxisSpecifier test:NodeTest predicate:Predicate? {
     return predicate ?
       [axis, test.concat([predicate])] :
       [axis, test]
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
 / "//" { return ["ancestor-or-self", ["node"]] }
 / "." { return ["self", ["nodeType", "node"]] }

NodeTest
 = nodeType:NodeType "()" { return ["nodeType", nodeType] }
 / fn:CustomNodeTestName "()" { return ["customTest", fn]}
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
 / _:(string ":")? nodeName:string { return nodeName }

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
 = chars:[a-zA-Z0-9\-_]+ { return chars.join("") }

integer
 = digits: [0-9]+ { return parseInt(digits.join(""), 10) }

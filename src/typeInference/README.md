# Type Inference

## Annotation

The types of each node in the AST need to be determined to be used for optimisation purposes.

Annotation is done over any XPath or XQuery script that is parsed by FontoXPath. When a script is parsed the `annotateAST` function gets triggered, recursively performs a depth-first, pre-order traversal to annotate every subtree of the AST. Given the type of the sub-tree, the corresponding annotation function gets called. These functions perform the annotation by first determining the type and then inserting a `SequenceType` to the AST as an attribute called `type`.

-   Function references are being resolved by first extracting the `QName` out of the AST and then performing a lookup in the `StaticContext` (passed as an optional attribute of the `AnnotationContext` class) to determine the arity, function name and the return type of the function.

-   The variable references use the `AnnotationContext` that tracks different levels of scopes and manages variables in each of the scopes. It finds primary use in the `flwor` expressions and `varRef` nodes. Pushing and popping scopes primarily takes place in the `flwor` expressions.

- Prefixes are resolved using the namespaceResolver and the defaultFunctionNamespaceURI present in the call to `evaluateXPath` or `parseScript`. Furthermore, any namespaces defined in the `prolog` of an XQuery script are used to resolve prefixes.

However, some node types are indeterminate during the annotation process because the type only becomes concrete during runtime or because it is a function we cannot perform type inference on. In that case, we don't annotate the AST but just return the following `SequenceType`:

```
{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE } (or item()* for short)
```

The following nodes always get annotated with this `SequenceType`:

-   `ContextItemExpr`
-   `DynamicFunctionInvocationExpr`
-   `UnaryLookup`

The execution process will then take place as if there is no annotation module in the codebase.

## Optimisation

Using the type information introduced by the annotation process, the type of each node can be used to increase efficiency during the evaluation process.

### Early Returns

Where the types are known, type checks during runtime are not needed unless the type is more general than the expression requires and needs narrowing.

For instance: binary and unary operators can benefit from skipping the type checking. Once we know what the types of the operands are, we can also determine their result types. If the type information is insufficient, we fall back to using the original dynamic type inference.

## Optimizations

Right now the following aspects are being optimized:

    - Binary Operator
    - Unary Operator
    - Value Compare
    - General Compare
    - Node Compare

## Node annotations

Most nodes are annotated logically, for example, the `ArrayConstructor` is annotated as an array, the `IntegerExpression` is annotated as an Integer. But there are some special cases where it isn't as straightforward. In these cases, we either need to do some steps prior to annotation, need the types of children of the node we are annotating to determine the type or are just limited to our own implementation and need to find a workaround. Below is a list containing each of these special cases and how they are being annotated.

-   `Binary Operators`:
    The binary operator is annotated with the type of the result. That resultType is determined by looking up the combination of operands and operator in a map containing each combination of operands and operators.
-   `CastExpr`:
    Is annotated with the target type of the cast.
-   `FlworExpr`:
    The type this gets annotated with is, for the most part, determined by the return clause of the expression. The letClause and forClause add variables to the current `AnnotationContext`. When there is a forClause in the expression we annotate with the type of the returnClause, but the multiplicity is set to `ZERO_OR_MORE`. When we don't have a forClause we annotate with the type of the returnClause. The OrderByClause and WhereClause don't influence the type of the FlworExpression.
-   `FunctionCallExpr/NamedFunctionRef/ArrowExpr`:
    The functionCallExpr is annotated by the return type of the function itself. As explained in the annotation section of this ReadMe the function is looked up in the context to retrieve the returnType of the function.
-   `IfThenElseExpr`:
    This expression is only annotated when both the thenClause and elseClause have the exact same returnType, else we return item()\*.
-   `PathExpr`:
    The pathExpression is annotated with the type of the last step of the last stepExpr. Each kind of step results in a different type, these kinds are listed below with their respective resulting type.
    -   `filterExpr`:
        The type of the child of the expression.
    -   `Axis/test/wildcard`:
        `ZERO_OR_MORE` nodes.
    -   `predicate/lookup`: item()\*
-   `SequenceExpr`:
    If every element in the sequence has the exact same type we annotate the ast with `ZERO_OR_MORE` of that item. If there are different types present we annotate with item()\* and if the sequence is empty we annotate with 'ZERO_OR_MORE` nodes.
-   `SimpleMapOperator`:
    If the type of the left side of the operator is known we annotate with `ZERO_OR_MORE` of that type otherwise we return item()\*.
-   `TypeSwitchOperator`:
    If the type of the operand is known we return the type of the clause where the type matches. Otherwise, we return item()\*.
-   `Unary Operators`:
    If the operand's type is not known it gets annotated as a `ZERO_OR_MORE` numeric type. Otherwise, if the type of the operand is a subtype of numeric we annotate it with the type of the operand, if this is not the case we annotate it with the double type.
-   `VarRef`:
    Look up the type of the variable name in the annotationContext and annotate with that type.

The expressions listed in the table below are expressions that always get annotated with the same type.

| Expression          | type                 |
| ------------------- | -------------------- |
| Logical_Operators   | Exactly_one boolean  |
| Compare_Operators   | Exactly_one boolean  |
| InstanceOfExpr      | Exactly_one boolean  |
| QuantifiedExpr      | Exactly_one boolean  |
| RangeSequenceExpr   | One_or_more integers |
| Set Operators       | Zero_or_more nodes   |
| CastableExpr        | Exactly_one boolean  |
| stringConcatenateOp | Exactly_one string   |
| integerConstantExpr | Exactly_one integer  |
| doubleConstantExpr  | Exactly_one double   |
| decimalConstantExpr | Exactly_one decimal  |
| stringConstantExpr  | Exactly_one string   |

## Testing

The qt3 test suite has been adapted to allow for annotation. This can be enabled by passing an additional `--annotate` flag. All XPath queries will then use the annotation step at the start of their execution.

An additional CI/CD step has also been added to execute the qt3 test set with annotation enabled to make sure the GitHub pipeline also tests this feature.

## Debugging

We added an additional flag in the Options type which adds some logging capabilities. When the `logUnannotatedQueries` flag is turned on, at the end of each query, the annotation code checks if this query was annotated completely. If that is not the case, it logs this query using `console.error`. Logging to `console.error` allows for easy piping into a file. Example: `npm run test 2> output.txt`.

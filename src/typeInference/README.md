# Type Inference

## Annotation

The types of each node in the AST need to be determined so that they can later be used
 for optimisation purposes.

Annotation starts by enabling the `annotateAST` flags in the options parameter of the
 `evaluateXPath` functions. When the flag is enabled, the `annotateAST` function gets
 triggered and it will recursively perform a depth-first, pre-order traversal to
 annotate sub-tree of the AST. Given the type of the sub-tree, the corresponding
 annotation function gets called. These corresponding functions perform the annotation
 by first determine the type of the node and then inserting a `SequenceType` to the
 AST as an attribute called `type`. 

There are cases where the variable references and function references are being used.

- The functional references are being resolved by first extracting the `QName` out of
 the AST and then perform a lookup in the `StaticContext` (passed as an optional
 attribute of the `AnnotationContext` class) to determine the arity, function name and
 the return type of the function.

- The variable references makes use of the `AnnotationContext` that tracks different
 level of scopes and manages variables in each of the scopes. It is mostly used in the
 `flwor` expressions and `varRef` nodes. Pushing and popping scopes take place mostly
 in the `flwor` expressions.

However, some of the types cannot be determined during the annotation process. The
 following `SequenceType`:

 ```
 { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE }
 ```

 is returned. The execution process will then take place as if there is no annotation
 module in the code base.

## Optimisation

Using the type information introduced by the annotation process, the type of each node
 can be used to increase efficiency during the evaluation process.

### Early Returns

Once the types are known, certain checks can be skipped to increase the speed.

For instance: binary operators and unary operators can benefit from skipping the type
 checking once we know what is the types of the operands and operators. If the type
 information is insufficient, the type is the previous code of determining types is
 used to continue the evaluation.

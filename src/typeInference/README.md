# Type Inference

## Annotation

The types of each node in the AST need to be determined to be used for optimisation purposes.

Annotation starts by enabling the `annotateAST` flags in the options parameter of the `evaluateXPath` functions. When the flag is enabled, the `annotateAST` function gets triggered, recursively performs a depth-first, pre-order traversal to annotate every subtree of the AST. Given the type of the sub-tree, the corresponding annotation function gets called. These functions perform the annotation by first determining the type and then inserting a `SequenceType` to the AST as an attribute called `type`.

-   Function references are being resolved by first extracting the `QName` out of the AST and then performing a lookup in the `StaticContext` (passed as an optional attribute of the `AnnotationContext` class) to determine the arity, function name and the return type of the function.

-   The variable references uses the `AnnotationContext` that tracks different levels of scopes and manages variables in each of the scopes. It finds primary use in the `flwor` expressions and `varRef` nodes. Pushing and popping scopes primarily takes place in the `flwor` expressions.

However, some node types are indeterminate during the annotation process because the type only becomes concrete during runtime or because it is a function we cannot perform type inference on. In that case, we denote it with the following `SequenceType`:

```
{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE }
```

The execution process will then take place as if there is no annotation module in the codebase.

## Optimisation

Using the type information introduced by the annotation process, the type of each node can be used to increase efficiency during the evaluation process.

### Early Returns

Where the types are known, type checks during runtime are not needed unless the type is more general than the expression requires and needs narrowing.

For instance: binary and unary operators can benefit from skipping the type checking. Once we know what the types of the operands are, we can also determine their result types. If the type information is insufficient, we fall back to using the original dynamic type inference.

## Testing

The qt3 test suite has been adapted to allow for annotation. This can be enabled by passing an additional `--annotate` flag. All xpath queries will then use the annotation step at the start of their execution.

An additional CI/CD step has also been added to execute the qt3 test set with annotation enabled to make sure the GitHub pipeline also tests this feature.

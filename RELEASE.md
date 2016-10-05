# Release notes for fontoxml-selectors

## next (1.6.1)

Fix fn:concat not accepting empty sequences.

## 1.6.0

Implement XPath 3.1.
Add XPath precompiling.
Add a persistent cache for compiled XPaths.

## 1.5.3

Fix equals function and add tests for it.
Fix predicates not working for anything other than name tests.

## 1.5.2

Fix selectors crashing with non-elements on `*[@..]`

## 1.5.1

Remove the restriction of using an or selector across multiple buckets.

## 1.5.0

Implement true / false.

## 1.4.0

Deprecate the `fonto-` syntax in favour of `fonto*` due to namespaces.
Introduce sibling axes.
Allow using namespaces in both nodeName tests and attribute tests.

## 1.3.0

Fix regex for detecting xpath vs nodeNames.
Add extra unrelated test.
Expose or combinator in XPath and fluent API.

## 1.2.0

Allow a subset of XPath (predicates, mainly) to be used as nodeSpecs:
`someElement[@someAttribute and @someOtherAttribute="someValue" and ancestor::someAncestor]`.

## 1.1.0

Add a requireNot method to all selectors: `matchNodeName('my-node').requireNot(someOtherSelectorOrNodeSpec)`.

## 1.0.1

Use semver ranges for dependency versions.

## 1.0.0

Initial release.

# Release notes for fontoxml-selectors

## next (1.2.1)

Fix regex for detecting xpath vs nodeNames.
Add extra unrelated test.

## 1.2.0

Allow a subset of XPath (predicates, mainly) to be used as nodeSpecs:
`someElement[@someAttribute and @someOtherAttribute="someValue" and ancestor::someAncestor]`.

## 1.1.0

Add a requireNot method to all selectors: `matchNodeName('my-node').requireNot(someOtherSelectorOrNodeSpec)`.

## 1.0.1

Use semver ranges for dependency versions.

## 1.0.0

Initial release.

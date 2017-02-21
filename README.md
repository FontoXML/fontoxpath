# fontoxpath

A minimalistic [XPath 3.1](https://www.w3.org/TR/xpath-31/) selector engine for (XML) nodes.

[Demo page](http://xpath.labs.fontoxml.com)

## How to use

```JavaScript
let { evaluateXPathToBoolean, domFacade } = require('fontoxpath');
let documentNode = ...;
console.log(evaluateXPathToBoolean('true()', documentNode, domFacade)); // => true
```

FontoXPath supplies a number of API functions:

* domFacade: A wrapper to the DOM. All DOM accesses should go through here
* A number of evaluateXPath.* functions:
  * `evaluateXPath(xpath: string, contextNode: Node, domFacade: DomFacade?, variables: Object={}, returnType: number) => *`
  * `evaluateXPathToNodes(xpath: string, contextNode: Node, domFacade: DomFacade?, variables: Object={}) => Node[]`
  * `evaluateXPathToFirstNode(xpath: string, contextNode: Node, domFacade: DomFacade?, variables: Object={}) => Node`
  * `evaluateXPathToBoolean(xpath: string, contextNode: Node, domFacade: DomFacade?, variables: Object={}) => boolean`
  * `evaluateXPathToNumber(xpath: string, contextNode: Node, domFacade: DomFacade?, variables: Object={}) => number`
  * `evaluateXPathToNumbers(xpath: string, contextNode: Node, domFacade: DomFacade?, variables: Object={}) => number[]`
* `precompileXPath(xpath: string) => Promise<string>`
  * A no-op on systems without indexedDB
* `registerCustomXPathFunction(name: string, signature: string[], returnType: string, callback: function)`
  * Can be used to register custom functions

## Features

Note that this engine assumes [XPath 1.0 compatibility mode](https://www.w3.org/TR/xpath-31/#id-backwards-compatibility) turned off.

Not all [XPath 3.1 functions](https://www.w3.org/TR/xpath-functions-31/) are implemented yet. We accept pull requests for missing features.

The following features are unavailable, but will be implemented at some point in time (and even sooner if you can help!):

* The math namespace (`math:pi()`, `math:exp()`, etc)
* DateTime related functions, and the datetime type in general
* Collation related functions (`fn:compare#3`)
* The binary types, and their related functions are not implemented yet
* Inline functions
* The `for` expression
* The `?` lookup operator for maps and arrays
* XML parsing

The following features are available:

* maps / arrays
* variables using `let`
* The `!` bang operator

For all available features, see the unit tests.

## Contribution

To recompile the parser, run the following

```
npm install
npm run build [--skip_parser] [--skip_closure]
```

Note: Rebuilding the closure build depends on Java.

To run the tests, run

```
npm run test [--ci_mode] [--integration_tests]
```

The integration tests run all tests only using the externally public API, using the closure build.

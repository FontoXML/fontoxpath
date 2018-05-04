# fontoxpath [![Build Status](https://travis-ci.org/FontoXML/fontoxpath.svg?branch=master)](https://travis-ci.org/FontoXML/fontoxpath) [![devDependency Status](https://david-dm.org/FontoXML/fontoxpath/dev-status.svg)](https://david-dm.org/FontoXML/fontoxpath#info=devDependencies) [![NPM version](https://badge.fury.io/js/fontoxpath.svg)](http://badge.fury.io/js/fontoxpath)

A minimalistic [XPath 3.1](https://www.w3.org/TR/xpath-31/) selector engine for (XML) nodes.

[Demo page](http://xpath.labs.fontoxml.com)

## How to use

```JavaScript
const { evaluateXPathToBoolean } = require('fontoxpath');
const documentNode = new DOMParser().parseFromString('<xml/>', 'text/xml');
console.log(evaluateXPathToBoolean('/xml => exists()', documentNode)); // => true
```

FontoXPath supplies a number of API functions:

* A number of `evaluateXPath.*` functions:
  * `evaluateXPath(xpath: string, contextNode: Node, domFacade: ?DomFacade=, variables: Object={},
    returnType: number) => *`
  * `evaluateXPathToNodes(xpath: string, contextNode: Node, domFacade: ?DomFacade=, variables:
    Object={}, options: {namespaceResolver: function(string):string?}) => Node[]`
  * `evaluateXPathToFirstNode(xpath: string, contextNode: Node, domFacade: ?DomFacade=, variables:
    Object={}, options: {namespaceResolver: function(string):string?}) => Node`
  * `evaluateXPathToBoolean(xpath: string, contextNode: Node, domFacade: ?DomFacade=, variables:
    Object={}, options: {namespaceResolver: function(string):string?}) => boolean`
  * `evaluateXPathToNumber(xpath: string, contextNode: Node, domFacade: ?DomFacade=, variables:
    Object={}, options: {namespaceResolver: function(string):string?}) => number`
  * `evaluateXPathToNumbers(xpath: string, contextNode: Node, domFacade: ?DomFacade=, variables:
    Object={}, options: {namespaceResolver: function(string):string?}) => number[]`
  * `evaluateXPathToString(xpath: string, contextNode: Node, domFacade: ?DomFacade=, variables:
    Object={}, options: {namespaceResolver: function(string):string?}) => string`
* `precompileXPath(xpath: string) => Promise<string>`
  * Precompile an XPath expression for future use. This uses a webworker to populate an IndexedDB
    database so that the XPath is available for future use. This is a no-op on systems without
    indexedDB.
* `registerCustomXPathFunction(name: string, signature: string[], returnType: string, callback:
  function)`
  * Can be used to register custom functions. They are registered globally.

## Features

Note that this engine assumes [XPath 1.0 compatibility
mode](https://www.w3.org/TR/xpath-31/#id-backwards-compatibility) turned off.

Not all [XPath 3.1 functions](https://www.w3.org/TR/xpath-functions-31/) are implemented yet. We
accept pull requests for missing features.

The following features are unavailable at this moment, but will be implemented at some point in time ([and even
sooner if you can help!](./CONTRIBUTING.md)):

* Some DateTime related functions
* Collation related functions (`fn:compare#3`)
* functions using patterns
* Some other miscellaneous functions
* The `?` lookup operator for maps and arrays
* XML parsing
* The `treat as` operator
* The `>>` and `<<` operators

For all available features, see the unit tests.

## Compatibility

This engine is pretty DOM-agnostic, it has a good track record with the browser DOM implementations
and [slimdom.js](https://github.com/bwrrp/slimdom.js). There are a number of known issues with
[xmldom](https://github.com/jindw/xmldom) because it does not follow the DOM spec on some features
including namespaces.

## Contribution

Please refer to the [Contribution Guide](./CONTRIBUTING.md).

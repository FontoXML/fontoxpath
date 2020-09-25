# fontoxpath [![Build Status](https://travis-ci.org/FontoXML/fontoxpath.svg?branch=master)](https://travis-ci.org/FontoXML/fontoxpath) [![devDependency Status](https://david-dm.org/FontoXML/fontoxpath/dev-status.svg)](https://david-dm.org/FontoXML/fontoxpath#info=devDependencies) [![NPM version](https://badge.fury.io/js/fontoxpath.svg)](http://badge.fury.io/js/fontoxpath) [![install size](https://packagephobia.now.sh/badge?p=fontoxpath)](https://packagephobia.now.sh/result?p=fontoxpath) [![Coverage Status](https://coveralls.io/repos/github/FontoXML/fontoxpath/badge.svg?branch=master)](https://coveralls.io/github/FontoXML/fontoxpath?branch=master) [![Known Vulnerabilities](https://snyk.io/test/github/FontoXML/fontoxpath/badge.svg?targetFile=package.json)](https://snyk.io/test/github/FontoXML/fontoxpath?targetFile=package.json) [![CodeFactor](https://www.codefactor.io/repository/github/fontoxml/fontoxpath/badge)](https://www.codefactor.io/repository/github/fontoxml/fontoxpath)

A minimalistic [XPath 3.1](https://www.w3.org/TR/xpath-31/) and [XQuery
3.1](https://www.w3.org/TR/xquery-31/) engine for (XML) nodes with [XQuery Update Facility
3.0](https://www.w3.org/TR/xquery-update-30/#id-update-primitives) support.

[Demo page](https://xpath.playground.fontoxml.com)

## How to use

### Querying XML

```js
evaluateXPath(xpathExpression, contextNode, domFacade, variables, returnType, options);
```

The following are convenience functions for a specific returnType.

```js
evaluateXPathToArray(xpathExpression, contextNode, domFacade, variables, options);
evaluateXPathToAsyncIterator(xpathExpression, contextNode, domFacade, variables, options);
evaluateXPathToBoolean(xpathExpression, contextNode, domFacade, variables, options);
evaluateXPathToFirstNode(xpathExpression, contextNode, domFacade, variables, options);
evaluateXPathToMap(xpathExpression, contextNode, domFacade, variables, options);
evaluateXPathToNodes(xpathExpression, contextNode, domFacade, variables, options);
evaluateXPathToNumber(xpathExpression, contextNode, domFacade, variables, options);
evaluateXPathToNumbers(xpathExpression, contextNode, domFacade, variables, options);
evaluateXPathToString(xpathExpression, contextNode, domFacade, variables, options);
evaluateXPathToStrings(xpathExpression, contextNode, domFacade, variables, options);
```

* `xpathExpression` `<String>` The query to evaluate.
* `contextNode` `<Node>` The node in which context the `xpathExpression` will be evaluated. Defaults
  to `null`.
* `domFacade` `<IDomFacade>` An [IDomFacade](src/domFacade/IDomFacade.ts) implementation which will
  be used for querying the DOM. Defaults to an implementation which uses properties and methods on
  the `contextNode` as described in the [DOM spec](https://dom.spec.whatwg.org/).
* `variables` `<Object>` The properties of `variables` are available variables within the
  `xpathExpression`. Defaults to an empty `Object`.
* `returnType` `<number>` Determines the type of the result. Defaults to
  `evaluateXPath.ANY_TYPE`. Possible values:
  * `evaluateXPath.ANY_TYPE` Returns the result of the query, can be anything depending on the
    query. Note that the return type is determined dynamically, not statically: XPaths returning
    empty sequences will return empty arrays and not null, like one might expect.
  * `evaluateXPath.NUMBER_TYPE` Resolve to a `number`, like count((1,2,3)) resolves to 3.
  * `evaluateXPath.STRING_TYPE` Resolve to a `string`, like //someElement[1] resolves to the text
    content of the first someElement.
  * `evaluateXPath.BOOLEAN_TYPE` Resolves to a `boolean` true or false, uses the effective boolean
    value to determine the result. count(1) resolves to true, count(()) resolves to false.
  * `evaluateXPath.NODES_TYPE` Resolve to all nodes `Node[]` the XPath resolves to. Returns nodes in
    the order the XPath would. Meaning (//a, //b) resolves to all A nodes, followed by all B
    nodes. //*[self::a or self::b] resolves to A and B nodes in document order.
  * `evaluateXPath.FIRST_NODE_TYPE` Resolves to the first `Node` node.NODES_TYPE would have resolved
    to.
  * `evaluateXPath.STRINGS_TYPE` Resolve to an array of strings `string[]`.
  * `evaluateXPath.MAP_TYPE` Resolve to an `Object`, as a map.
  * `evaluateXPath.ARRAY_TYPE` Resolve to an array `[]`.
  * `evaluateXPath.ASYNC_ITERATOR_TYPE`
  * `evaluateXPath.NUMBERS_TYPE` Resolve to an array of numbers `number[]`.
* `options` `<Object>` Options used to modify the behavior. The following options are available:
  * `namespaceResolver` `<function(string):string?>` By default, the namespaces in scope of the
    context item (if it is a node) are used. This is fine for most queries if you can assume how
    your XML uses prefixes. Use this function to override those namespaces to remove that
    assumption. This function will be called with a prefix (the empty string for the default
    namespaceURI) and should return a namespaceURI (or null for the null namespace).
  * `nodesFactory` `INodesFactory` A [INodesFactory](src/nodesFactory/INodesFactory.ts)
    implementation which will be used for creating nodes.
  * `language` `string` The query language to use. Defaults to
    `evaluateXPath.XPATH_3_1_LANGUAGE`. Possible values:
    * `evaluateXPath.XPATH_3_1_LANGUAGE` Evaluate `xpathExpression` according the [XPath
      spec](https://www.w3.org/TR/xpath-31/).
    * `evaluateXPath.XQUERY_3_1_LANGUAGE` Evaluate `xpathExpression` according the [XQuery
      spec](https://www.w3.org/TR/xquery-31/).
  * `moduleImports` `<Object<string, string>`
  * `debug` `<boolean>` If a debug trace should be tracked, see [debugging](#debugging) for more
    information.
  * `logger` `<Object>` Object with functions used to override the standard logger.
    * `trace: <function(string):void>` The logger for the `trace()` function. The argument is the
      string of the original message.
  * `defaultFunctionNamespaceURI` `<string>` To modify or change the default function namespaceURI. Defaults to `http://www.w3.org/2005/xpath-functions`. Defining the default function namespaceURI in the xpath expression overwrites this option.

### Example

```js
const {
	evaluateXPath,
	evaluateXPathToBoolean,
	evaluateXPathToString,
	evaluateXPathToFirstNode,
	evaluateXPathToNumber,
} = require('fontoxpath');

const documentNode = new DOMParser().parseFromString('<xml/>', 'text/xml');

console.log(evaluateXPathToBoolean('/xml => exists()', documentNode));
// Outputs: true

console.log(evaluateXPathToString('$foo', null, null, {'foo': 'bar'}));
// Outputs: "bar"

// We pass the documentNode so the default INodesFactory can be used.
console.log(evaluateXPathToFirstNode('<foo>bar</foo>', documentNode, null, null, {language: evaluateXPath.XQUERY_3_1_LANGUAGE}).outerHTML);
// Outputs: "<foo>bar</foo>"

// We pass the Math namespaceURI for the pi() function to be used
console.log(evaluateXPathToNumber('pi()', documentNode, undefined, {}, { language: evaluateXPath.XQUERY_3_1_LANGUAGE, defaultFunctionNamespaceURI: 'http://www.w3.org/2005/xpath-functions/math'}));
// Outputs: Math.PI (3.14...)
```

### Debugging

FontoXPath can output a basic trace for an error if the `debug` option is set to `true`. This is
disabled by default because of performance reasons.

```js
evaluateXPathToBoolean(`
if (true()) then
  zero-or-one((1, 2))
else
  (1, 2, 3)
`, null, null, null, {debug: true});

// Throws:
1: if (true()) then
2:   zero-or-one((1, 2))
     ^^^^^^^^^^^^^^^^^^^
3: else
4:   (1, 2, 3)

Error: FORG0003: The argument passed to fn:zero-or-one contained more than one item.
  at <functionCallExpr>:2:3 - 2:22
  at <ifThenElseExpr>:1:1 - 4:12
```

Besides errors, the `fn:trace` function can be used to output information to the developer console.

### Modifying XML

To modify XML you can use [XQuery Update Facility 3.0](https://www.w3.org/TR/xquery-update-30/) as
following

```js
evaluateUpdatingExpression(xpathExpression, contextNode, domFacade, variables, options);
```

The arguments are the same as `evaluateXPath`. This returns a `Promise<Object>`, the object has a
`xdmValue` and `pendingUpdateList`. The `xdmValue` is the result of query as if it was run using
`evaluateXPath` with `evaluateXPath.ANY_TYPE` as `returnType`. The `pendingUpdateList` is an
`<Object[]>` in which each entry represents an [update
primitive](https://www.w3.org/TR/xquery-update-30/#id-update-primitives) where the `type` identifies
the update primitive.

The pending update list can be executed using

```js
executePendingUpdateList(pendingUpdateList, domFacade, nodesFactory, documentWriter);
```

* `pendingUpdateList` `<Object[]>` The pending update list returned by `evaluateUpdatingExpression`.
* `domFacade` `<IDomFacade>` See `evaluateXPath`. The default will use nodes from the
  `pendingUpdateList`.
* `nodesFactory` `INodesFactory` A [INodesFactory](src/nodesFactory/INodesFactory.ts) implementation
  which will be used for creating nodes. Defaults to an implementation which uses properties and
  methods of nodes from the `pendingUpdateList`.
* `documentWriter` `<IDocumentWriter>` An [IDocumentWriter](src/documentWriter/IDocumePntWriter.ts)
  implementation which will be used for modifying a DOM. Defaults to an implementation which uses
  properties and methods of nodes from the `pendingUpdateList`.

### Example

```js
const {
	evaluateUpdatingExpression,
	executePendingUpdateList
} = require('fontoxpath');
const documentNode = new DOMParser().parseFromString('<xml/>', 'text/xml');

evaluateUpdatingExpression('replace node /xml with <foo/>', documentNode)
	.then(result => {
		executePendingUpdateList(result.pendingUpdateList);
		console.log(documentNode.documentElement.outerHTML);
		// Outputs: "<foo/>"
	});
```

### Global functions

To register custom functions. They are registered globally.

```js
registerCustomXPathFunction(name, signature, returnType, callback);
```

* `name` `{namespaceURI: string, localName: string}` The function name.
* `signature` `string[]` The arguments of the function.
* `returnType` `string` The return type of the function.
* `callback` `function` The function itself.

#### Example:
```js
const fontoxpath = require("fontoxpath")

// Register a function called 'there' in the 'hello' namespace:
fontoxpath.registerCustomXPathFunction({namespaceURI: 'hello', localName: 'there'}, ['xs:string'], 'xs:string', (_, str) => `Hello there, ${str}`);

// and call it, using the BracedUriLiteral syntax (Q{})
const out = fontoxpath.evaluateXPathToString('Q{hello}there("General Kenobi")');

// Or by using a prefix instead:
const URI_BY_PREFIX = {hi: 'hello'};
const out2 = fontoxpath.evaluateXPathToString(
	'hi:there("General Kenobi")',
	null,
	null,
	null,
	{namespaceResolver: (prefix) => (URI_BY_PREFIX[prefix])});
```

### Including modules

Use the `registerXQueryModule` function to register an XQuery module. Registered modules will be
globally available, but will have to be imported before they can be used.

#### Example:

```js
const fontoxpath = require('fontoxpath');

fontoxpath.registerXQueryModule(`
	module namespace test = "https://www.example.org/test1";

	declare %public function test:hello($a) {
		"Hello " || $a
	};
`);

// Import the module using the XQuery way:
fontoxpath.evaluateXPathToString(`
	import module namespace test = "https://www.example.org/test1";
	(: Invoke the test:hello function :)
	test:hello('there')
	`,
	null,
	null,
	null,
	{language: fontoxpath.evaluateXPath.XQUERY_3_1_LANGUAGE}
);

// Or by using the moduleImports API, which can be used in XPath contexts as well
fontoxpath.evaluateXPathToString(`
	(: Invoke the test:hello function :)
	test:hello('there')
	`,
	null,
	null,
	null,
	{moduleImports: { test: 'https://www.example.org/test1' } }
);
```

### Typescript

We support [TypeScript](https://github.com/Microsoft/TypeScript); and expose a minimal Node type.
You can use generic types to get the type of the DOM implementation you are using without having to
cast it.

```ts
const myNodes = evaluateXPathToNodes<slimdom.Node>(
  '<foo>bar</foo>',
  null,
  null,
  null,
  {language: evaluateXPath.XQUERY_3_1_LANGUAGE}
);

// Type of myNodes is: slimdom.Node[] .
```

## Features

Note that this engine assumes [XPath 1.0 compatibility
mode](https://www.w3.org/TR/xpath-31/#id-backwards-compatibility) turned off.

Not all [XPath 3.1 functions](https://www.w3.org/TR/xpath-functions-31/) are implemented yet. We
accept pull requests for missing features.

The following features are unavailable at this moment, but will be implemented at some point in time
([and even sooner if you can help!](./CONTRIBUTING.md)):

* Some DateTime related functions
* Collation related functions (`fn:compare#3`)
* Some other miscellaneous functions
* XML parsing
* The `treat as` operator
* Some parts of FLWOR expressions

For all available features, see the unit tests, or just try it out on the [Demo
page](https://xpath.playground.fontoxml.com).

## Compatibility

This engine is pretty DOM-agnostic, it has a good track record with the browser DOM implementations
and [slimdom.js](https://github.com/bwrrp/slimdom.js). There are a number of known issues with
[xmldom](https://github.com/jindw/xmldom) because it does not follow the DOM spec on some features
including namespaces.

## Contribution

If you have any questions on how to use FontoXPath, or if you are running into problems, just file a
github issue! If you are looking to contribute, we have a [Contribution Guide](./CONTRIBUTING.md)
that should help you in getting your development environment set up.

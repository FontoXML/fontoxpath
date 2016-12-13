(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(1),
		__webpack_require__(72),
		__webpack_require__(73),
		__webpack_require__(74),
		__webpack_require__(75),
		__webpack_require__(76)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		evaluateXPathToBoolean,
		evaluateXPathToFirstNode,
		evaluateXPathToNodes,
		evaluateXPathToNumber,
		evaluateXPathToString,
		evaluateXPathToStrings
	) {
		'use strict';

		function ReadOnlyBlueprint () {
		}

		/**
		 * Returns the parent node of the given node according to the blueprint.
		 *
		 * @method getParentNode
		 *
		 * @param  {Node} node The node for which to retrieve the parent node
		 *
		 * @return {Node|null} The parent node of the given node, or null if there is none
		 */
		ReadOnlyBlueprint.prototype.getParentNode = function (node) {
			return node.parentNode;
		};

		/**
		 * Returns the first child of the given node according to the blueprint.
		 *
		 * @method getFirstChild
		 *
		 * @param  {Node} node The node for which to retrieve the first child
		 *
		 * @return {Node|null} The first child of the given node, or null if there is none
		 */
		ReadOnlyBlueprint.prototype.getFirstChild = function (node) {
			return node.firstChild;
		};

		/**
		 * Returns the last child of the given node according to the blueprint.
		 *
		 * @method getLastChild
		 *
		 * @param  {Node} node The node for which to retrieve the last child
		 *
		 * @return {Node|null} The last child of the given node, or null if there is none
		 */
		ReadOnlyBlueprint.prototype.getLastChild = function (node) {
			return node.lastChild;
		};

		/**
		 * Returns the next sibling of the given node according to the blueprint.
		 *
		 * @method getNextSibling
		 *
		 * @param  {Node} node The node for which to retrieve the next sibling
		 *
		 * @return {Node|null} The next sibling of the given node, or null if there is none
		 */
		ReadOnlyBlueprint.prototype.getNextSibling = function (node) {
			return node.nextSibling;
		};

		/**
		 * Returns the previous sibling of the given node according to the blueprint.
		 *
		 * @method getPreviousSibling
		 *
		 * @param  {Node} node The node for which to retrieve the previous sibling
		 *
		 * @return {Node|null} The previous sibling of the given node, or null if there is none
		 */
		ReadOnlyBlueprint.prototype.getPreviousSibling = function (node) {
			return node.previousSibling;
		};

		/**
		 * Returns the child nodes of the given node according to the blueprint.
		 *
		 * @method getChildNodes
		 *
		 * @param  {Node} node The node for which to retrieve the child nodes
		 *
		 * @return {Node[]} The child nodes of the given node
		 */
		ReadOnlyBlueprint.prototype.getChildNodes = function (node) {
			var childNodes = [];

			for (var childNode = this.getFirstChild(node); childNode; childNode = this.getNextSibling(childNode)) {
				childNodes.push(childNode);
			}

			return childNodes;
		};

		/**
		 * Returns the value of the given node's attribute with the given name
		 *
		 * @method getAttribute
		 *
		 * @param  {Node}    node           Node for which to retrieve the attribute value
		 * @param  {String}  attributeName  Name of the attribute to be retrieved
		 *
		 * @return {String|null} The value of the given attribute, or null if the attribute does
		 *                         not exist.
		 */
		ReadOnlyBlueprint.prototype.getAttribute = function (node, attributeName) {
			return node.getAttribute(attributeName);
		};

		/**
		 * Get all the attributes of this node, including attributes which are only known in the ReadOnlyBlueprint
		 *
		 * @param   {Node}  node  The node from which to get all of  the attributes
		 *
		 * @return  {Attr[]}  The attributes of the given node, as an array of name/value objects.
		 */
		ReadOnlyBlueprint.prototype.getAllAttributes = function (node) {
			return Array.from(node.attributes);
		};

		/**
		 * Returns the data for the given node according to the ReadOnlyBlueprint.
		 *
		 * @method getData
		 *
		 * @param  {Node} node The node for which to retrieve the data
		 *
		 * @return {String} The data for the given node
		 */
		ReadOnlyBlueprint.prototype.getData = function (node) {
			return node.data || '';
		};

		return {
			domFacade: new ReadOnlyBlueprint(),
			evaluateXPathToBoolean: evaluateXPathToBoolean,
			evaluateXPathToFirstNode: evaluateXPathToFirstNode,
			evaluateXPathToNodes: evaluateXPathToNodes,
			evaluateXPathToNumber: evaluateXPathToNumber,
			evaluateXPathToString: evaluateXPathToString,
			evaluateXPathToStrings: evaluateXPathToStrings
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(2)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		evaluateXPath
	) {
		'use strict';

		/**
		 * Evaluates an XPath on the given contextNode.
		 *
		 * @param  {Selector|String}   XPathSelector  The selector to execute. Supports XPath 3.1.
		 * @param  {Node}              contextNode    The node from which to run the XPath.
		 * @param  {Blueprint}         blueprint      The blueprint (or DomFacade like interface) for retrieving relations.
		 * @param  {[Object]}          variables      Extra variables (name=>value). Values can be number / string or boolean.
		 *
		 * @return  {boolean}
		 */
		return function evaluateXPathToBoolean (selector, contextNode, blueprint, variables) {
			return evaluateXPath(selector, contextNode, blueprint, variables, evaluateXPath.BOOLEAN_TYPE);
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(3),
		__webpack_require__(71),
		__webpack_require__(21),
		__webpack_require__(11),
		__webpack_require__(13),
		__webpack_require__(49),
		__webpack_require__(20)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		createSelectorFromXPath,
		adaptJavaScriptValueToXPathValue,
		DynamicContext,
		Sequence,
		NodeValue,
		NumericValue,
		DomFacade
	) {
		'use strict';

		/**
		 * Evaluates an XPath on the given contextNode.
		 * If the return type is ANY_TYPE, the returned value depends on the result of the XPath:
		 *  * If the XPath evaluates to the empty sequence, an empty array is returned.
		 *  * If the XPath evaluates to a singleton node, that node is returned.
		 *  * If the XPath evaluates to a singleton value, that value is atomized and returned.
		 *  * If the XPath evaluates to a sequence of nodes, those nodes are returned.
		 *  * Else, the sequence is atomized and returned.
		 *
		 * @param  {Selector|String}   XPathSelector  The selector to execute. Supports XPath 3.1.
		 * @param  {Node}              contextNode    The node from which to run the XPath.
		 * @param  {Blueprint}         blueprint      The blueprint (or DomFacade like interface) for retrieving relations.
		 * @param  {[Object]}          variables      Extra variables (name=>value). Values can be number / string or boolean.
		 * @param  {[Number]}          returnType     One of the return types, indicates the expected type of the XPath query.
		 *
		 * @return  {Node[]|Node|Any[]|Any}
		 */
		function evaluateXPath (xPathSelector, contextNode, blueprint, variables, returnType) {
			returnType = returnType || evaluateXPath.ANY_TYPE;
			if (typeof xPathSelector === 'string') {
				xPathSelector = createSelectorFromXPath(xPathSelector);
			}
			var domFacade = new DomFacade(blueprint),
				contextSequence = Sequence.singleton(new NodeValue(domFacade, contextNode)),
				untypedVariables = Object.assign(
					{
						'theBest': 'FontoXML is the best!'
					},
					variables || {});
			var typedVariables = Object.keys(untypedVariables).reduce(function (typedVariables, variableName) {
					typedVariables[variableName] = adaptJavaScriptValueToXPathValue(untypedVariables[variableName]);
					return typedVariables;
				}, Object.create(null));

			var dynamicContext = new DynamicContext({
					contextItem: contextSequence,
					domFacade: domFacade,
					variables: typedVariables
				});

			var rawResults = xPathSelector.evaluate(dynamicContext);

			switch (returnType) {
				case evaluateXPath.BOOLEAN_TYPE:
					return rawResults.getEffectiveBooleanValue();

				case evaluateXPath.STRING_TYPE:
					if (rawResults.isEmpty()) {
						return '';
					}
					// Atomize to convert (attribute)nodes to be strings
					return rawResults.value[0].atomize().value;

				case evaluateXPath.STRINGS_TYPE:
					if (rawResults.isEmpty()) {
						return [];
					}

					// Atomize all parts
					return rawResults.value.map(function (value) { return value.atomize().value; });

				case evaluateXPath.NUMBER_TYPE:
					if (!rawResults.isSingleton()) {
						return NaN;
					}
					if (!(rawResults.value[0] instanceof NumericValue)) {
						return NaN;
					}
					return rawResults.value[0].value;

				case evaluateXPath.FIRST_NODE_TYPE:
					if (rawResults.isEmpty()) {
						return null;
					}
					if (!(rawResults.value[0].instanceOfType('node()'))) {
						throw new Error('Expected XPath ' + xPathSelector + ' to resolve to Node. Got ' + rawResults.value[0]);
					}
					if (rawResults.value[0].instanceOfType('attribute()')) {
						throw new Error('XPath can not resolve to attribute nodes');
					}
					return rawResults.value[0].value;

				case evaluateXPath.NODES_TYPE:
					if (rawResults.isEmpty()) {
						return [];
					}
					if (!(rawResults.value.every(function (value) {return value.instanceOfType('node()');}))) {
						throw new Error('Expected XPath ' + xPathSelector + ' to resolve to a sequence of Nodes.');
					}
					if (rawResults.value.some(function (value) {return value.instanceOfType('attribute()');})) {
						throw new Error('XPath ' + xPathSelector + ' should not resolve to attribute nodes');
					}
					return rawResults.value.map(function (nodeValue) { return nodeValue.value;});

				default:
					var allValuesAreNodes = rawResults.value.every(function (value) {
							return value.instanceOfType('node()') &&
								!(value.instanceOfType('attribute()'));
						});
					if (allValuesAreNodes) {
						if (rawResults.isSingleton()) {
							return rawResults.value[0].value;
						}
						return rawResults.value.map(function (nodeValue) {
							return nodeValue.value;
						});
					}
					if (rawResults.isSingleton()) {
						return rawResults.value[0].atomize().value;
					}
					return rawResults.atomize().value.map(function (atomizedValue) {
						return atomizedValue.value;
					});
			}
		}

		/**
		 * Returns the result of the query, can be anything depending on the query
		 */
		evaluateXPath.ANY_TYPE = 0;

		/**
		 * Resolve to a number, like count((1,2,3)) resolves to 3.
		 */
		evaluateXPath.NUMBER_TYPE = 1;

		/**
		 * Resolve to a string, like //someElement[1] resolves to the text content of the first someElement
		 */
		evaluateXPath.STRING_TYPE = 2;

		/**
		 * Resolves to true or false, uses the effective boolean value to determin result. count(1) resolves to true, count(()) resolves to false
		 */
		evaluateXPath.BOOLEAN_TYPE = 3;

		/**
		 * Resolve to all nodes the XPath resolves to. Returns nodes in the order the XPath would. Meaning (//a, //b) resolves to all A nodes, followed by all B nodes. //*[self::a or self::b] resolves to A and B nodes in document order.
		 */
		evaluateXPath.NODES_TYPE = 7;

		/**
		 * Resolves to the first node NODES_TYPE would have resolved to.
		 */
		evaluateXPath.FIRST_NODE_TYPE = 9;

		/**
		 * Resolve to an array of strings
		 */
		evaluateXPath.STRINGS_TYPE = 10;

		return evaluateXPath;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(4),
		__webpack_require__(5),
		__webpack_require__(7),
		__webpack_require__(70)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		warnForUsingDeprecatedFeature,
		xPathParser,
		compileAstToSelector,
		compiledSelectorCache
	) {
		'use strict';

		/**
		 * Parse an XPath string to a selector.
		 *
		 * @param  {string}  xPathString      The string to parse
		 */
		return function parseSelector (xPathString) {
			if (!compiledSelectorCache[xPathString]) {
				try {
					var ast = xPathParser.parse(xPathString);
					var compilerResult = compileAstToSelector(ast);
					compiledSelectorCache[xPathString] = compilerResult.result;

					if (compilerResult.hasDeprecationWarnings) {
						warnForUsingDeprecatedFeature('Functions as tests (like self::XXX()) are not correct XPath. They will be removed next release. Please refactor the selector "' + xPathString + '"');
					}
				} catch (error) {
					if (error instanceof xPathParser.SyntaxError) {
						throw new Error('XPST0003: Unable to parse XPath: ' + xPathString + '. ' + error);
					}
					throw error;
				}
			}
			return compiledSelectorCache[xPathString];
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
	) {
		'use strict';

		return function warnForUsingDeprecatedFeature (message) {
			console.warn(message);
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(6)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(
		xPathParserRaw
	) {
		'use strict';

		var module = {};
		new Function(xPathParserRaw).call(module);
		return module.xPathParser;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = "/* istanbul ignore next the parser is generated code with so many branches it skews the coverage percentages */\n!function(a){\"use strict\";function b(a,b){function c(){this.constructor=a}c.prototype=b.prototype,a.prototype=new c}function c(a,b,d,e){this.message=a,this.expected=b,this.found=d,this.location=e,this.name=\"SyntaxError\",\"function\"==typeof Error.captureStackTrace&&Error.captureStackTrace(this,c)}function d(a,b){function d(a,b){return{type:\"literal\",text:a,ignoreCase:b}}function e(a,b,c){return{type:\"class\",parts:a,inverted:b,ignoreCase:c}}function f(){return{type:\"end\"}}function g(a){return{type:\"other\",description:a}}function h(b){var c,d=Nh[b];if(d)return d;for(c=b-1;!Nh[c];)c--;for(d=Nh[c],d={line:d.line,column:d.column};b>c;)10===a.charCodeAt(c)?(d.line++,d.column=1):d.column++,c++;return Nh[b]=d,d}function i(a,b){var c=h(a),d=h(b);return{start:{offset:a,line:c.line,column:c.column},end:{offset:b,line:d.line,column:d.column}}}function j(a){Oh>Lh||(Lh>Oh&&(Oh=Lh,Ph=[]),Ph.push(a))}function k(a,b,d){return new c(c.buildMessage(a,b),a,b,d)}function l(){var a,b,c,d,e=109*Lh+0,f=Rh[e];return f?(Lh=f.nextPos,f.result):(a=Lh,b=Va(),b!==ab?(c=m(),c!==ab?(d=Va(),d!==ab?(Mh=a,b=db(c),a=b):(Lh=a,a=ab)):(Lh=a,a=ab)):(Lh=a,a=ab),Rh[e]={nextPos:Lh,result:a},a)}function m(){var b,c,d,e,f,g,h,i,k=109*Lh+4,l=Rh[k];if(l)return Lh=l.nextPos,l.result;if(b=Lh,c=n(),c!==ab){for(d=[],e=Lh,f=Va(),f!==ab?(44===a.charCodeAt(Lh)?(g=eb,Lh++):(g=ab,0===Qh&&j(fb)),g!==ab?(h=Va(),h!==ab?(i=n(),i!==ab?(Mh=e,f=mb(c,i),e=f):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab);e!==ab;)d.push(e),e=Lh,f=Va(),f!==ab?(44===a.charCodeAt(Lh)?(g=eb,Lh++):(g=ab,0===Qh&&j(fb)),g!==ab?(h=Va(),h!==ab?(i=n(),i!==ab?(Mh=e,f=mb(c,i),e=f):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab);d!==ab?(Mh=b,c=nb(c,d),b=c):(Lh=b,b=ab)}else Lh=b,b=ab;return Rh[k]={nextPos:Lh,result:b},b}function n(){var a,b=109*Lh+5,c=Rh[b];return c?(Lh=c.nextPos,c.result):(a=o(),a===ab&&(a=r(),a===ab&&(a=s(),a===ab&&(a=t()))),Rh[b]={nextPos:Lh,result:a},a)}function o(){var b,c,d,e,f,g,h,i=109*Lh+6,k=Rh[i];return k?(Lh=k.nextPos,k.result):(b=Lh,c=p(),c!==ab?(d=Va(),d!==ab?(a.substr(Lh,6)===ob?(e=ob,Lh+=6):(e=ab,0===Qh&&j(pb)),e!==ab?(f=Za(),f!==ab?(g=Va(),g!==ab?(h=n(),h!==ab?(Mh=b,c=qb(c,h),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[i]={nextPos:Lh,result:b},b)}function p(){var b,c,d,e,f,g,h,i,k=109*Lh+7,l=Rh[k];if(l)return Lh=l.nextPos,l.result;if(b=Lh,a.substr(Lh,3)===rb?(c=rb,Lh+=3):(c=ab,0===Qh&&j(sb)),c!==ab)if(d=Va(),d!==ab)if(e=q(),e!==ab){for(f=[],g=Lh,a.substr(Lh,2)===tb?(h=tb,Lh+=2):(h=ab,0===Qh&&j(ub)),h!==ab?(i=q(),i!==ab?(Mh=g,h=vb(e,i),g=h):(Lh=g,g=ab)):(Lh=g,g=ab);g!==ab;)f.push(g),g=Lh,a.substr(Lh,2)===tb?(h=tb,Lh+=2):(h=ab,0===Qh&&j(ub)),h!==ab?(i=q(),i!==ab?(Mh=g,h=vb(e,i),g=h):(Lh=g,g=ab)):(Lh=g,g=ab);f!==ab?(Mh=b,c=wb(e,f),b=c):(Lh=b,b=ab)}else Lh=b,b=ab;else Lh=b,b=ab;else Lh=b,b=ab;return Rh[k]={nextPos:Lh,result:b},b}function q(){var b,c,d,e,f,g,h,i=109*Lh+8,k=Rh[i];return k?(Lh=k.nextPos,k.result):(b=Lh,36===a.charCodeAt(Lh)?(c=gb,Lh++):(c=ab,0===Qh&&j(hb)),c!==ab?(d=Da(),d!==ab?(e=Va(),e!==ab?(a.substr(Lh,2)===xb?(f=xb,Lh+=2):(f=ab,0===Qh&&j(yb)),f!==ab?(g=Va(),g!==ab?(h=n(),h!==ab?(Mh=b,c=zb(d,h),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[i]={nextPos:Lh,result:b},b)}function r(){var b,c,d,e,f,g,h,i,k,l,m,o,p,q,r,s,t,u,v,w=109*Lh+9,x=Rh[w];if(x)return Lh=x.nextPos,x.result;if(b=Lh,a.substr(Lh,4)===Ab?(c=Ab,Lh+=4):(c=ab,0===Qh&&j(Bb)),c===ab&&(a.substr(Lh,5)===Cb?(c=Cb,Lh+=5):(c=ab,0===Qh&&j(Db))),c!==ab)if(d=Wa(),d!==ab)if(36===a.charCodeAt(Lh)?(e=gb,Lh++):(e=ab,0===Qh&&j(hb)),e!==ab)if(f=Da(),f!==ab)if(g=Wa(),g!==ab)if(a.substr(Lh,2)===Eb?(h=Eb,Lh+=2):(h=ab,0===Qh&&j(Fb)),h!==ab)if(i=Wa(),i!==ab)if(k=n(),k!==ab){for(l=[],m=Lh,44===a.charCodeAt(Lh)?(o=eb,Lh++):(o=ab,0===Qh&&j(fb)),o!==ab?(p=Va(),p!==ab?(36===a.charCodeAt(Lh)?(q=gb,Lh++):(q=ab,0===Qh&&j(hb)),q!==ab?(r=Da(),r!==ab?(s=Wa(),s!==ab?(a.substr(Lh,2)===Eb?(t=Eb,Lh+=2):(t=ab,0===Qh&&j(Fb)),t!==ab?(u=Wa(),u!==ab?(v=n(),v!==ab?(Mh=m,o=Gb(c,f,k,r,v),m=o):(Lh=m,m=ab)):(Lh=m,m=ab)):(Lh=m,m=ab)):(Lh=m,m=ab)):(Lh=m,m=ab)):(Lh=m,m=ab)):(Lh=m,m=ab)):(Lh=m,m=ab);m!==ab;)l.push(m),m=Lh,44===a.charCodeAt(Lh)?(o=eb,Lh++):(o=ab,0===Qh&&j(fb)),o!==ab?(p=Va(),p!==ab?(36===a.charCodeAt(Lh)?(q=gb,Lh++):(q=ab,0===Qh&&j(hb)),q!==ab?(r=Da(),r!==ab?(s=Wa(),s!==ab?(a.substr(Lh,2)===Eb?(t=Eb,Lh+=2):(t=ab,0===Qh&&j(Fb)),t!==ab?(u=Wa(),u!==ab?(v=n(),v!==ab?(Mh=m,o=Gb(c,f,k,r,v),m=o):(Lh=m,m=ab)):(Lh=m,m=ab)):(Lh=m,m=ab)):(Lh=m,m=ab)):(Lh=m,m=ab)):(Lh=m,m=ab)):(Lh=m,m=ab)):(Lh=m,m=ab);l!==ab?(m=Wa(),m!==ab?(a.substr(Lh,9)===Hb?(o=Hb,Lh+=9):(o=ab,0===Qh&&j(Ib)),o!==ab?(p=Wa(),p!==ab?(q=n(),q!==ab?(Mh=b,c=Jb(c,f,k,l,q),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)}else Lh=b,b=ab;else Lh=b,b=ab;else Lh=b,b=ab;else Lh=b,b=ab;else Lh=b,b=ab;else Lh=b,b=ab;else Lh=b,b=ab;else Lh=b,b=ab;return Rh[w]={nextPos:Lh,result:b},b}function s(){var b,c,d,e,f,g,h,i,k,l,o,p,q,r,s,t,u,v,w=109*Lh+10,x=Rh[w];return x?(Lh=x.nextPos,x.result):(b=Lh,a.substr(Lh,2)===Kb?(c=Kb,Lh+=2):(c=ab,0===Qh&&j(Lb)),c!==ab?(d=Va(),d!==ab?(40===a.charCodeAt(Lh)?(e=Mb,Lh++):(e=ab,0===Qh&&j(Nb)),e!==ab?(f=Va(),f!==ab?(g=m(),g!==ab?(h=Va(),h!==ab?(41===a.charCodeAt(Lh)?(i=Ob,Lh++):(i=ab,0===Qh&&j(Pb)),i!==ab?(k=Va(),k!==ab?(a.substr(Lh,4)===Qb?(l=Qb,Lh+=4):(l=ab,0===Qh&&j(Rb)),l!==ab?(o=Za(),o!==ab?(p=Va(),p!==ab?(q=n(),q!==ab?(r=Va(),r!==ab?(a.substr(Lh,4)===Sb?(s=Sb,Lh+=4):(s=ab,0===Qh&&j(Tb)),s!==ab?(t=Za(),t!==ab?(u=Va(),u!==ab?(v=n(),v!==ab?(Mh=b,c=Ub(g,q,v),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[w]={nextPos:Lh,result:b},b)}function t(){var b,c,d,e,f,g,h,i,k,l=109*Lh+11,m=Rh[l];if(m)return Lh=m.nextPos,m.result;if(b=Lh,c=u(),c!==ab){for(d=[],e=Lh,f=Va(),f!==ab?(a.substr(Lh,2)===Vb?(g=Vb,Lh+=2):(g=ab,0===Qh&&j(Wb)),g!==ab?(h=Za(),h!==ab?(i=Va(),i!==ab?(k=u(),k!==ab?(Mh=e,f=mb(c,k),e=f):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab);e!==ab;)d.push(e),e=Lh,f=Va(),f!==ab?(a.substr(Lh,2)===Vb?(g=Vb,Lh+=2):(g=ab,0===Qh&&j(Wb)),g!==ab?(h=Za(),h!==ab?(i=Va(),i!==ab?(k=u(),k!==ab?(Mh=e,f=mb(c,k),e=f):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab);d!==ab?(Mh=b,c=Xb(c,d),b=c):(Lh=b,b=ab)}else Lh=b,b=ab;return Rh[l]={nextPos:Lh,result:b},b}function u(){var b,c,d,e,f,g,h,i,k,l=109*Lh+12,m=Rh[l];if(m)return Lh=m.nextPos,m.result;if(b=Lh,c=v(),c!==ab){for(d=[],e=Lh,f=Va(),f!==ab?(a.substr(Lh,3)===Yb?(g=Yb,Lh+=3):(g=ab,0===Qh&&j(Zb)),g!==ab?(h=Za(),h!==ab?(i=Va(),i!==ab?(k=v(),k!==ab?(Mh=e,f=mb(c,k),e=f):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab);e!==ab;)d.push(e),e=Lh,f=Va(),f!==ab?(a.substr(Lh,3)===Yb?(g=Yb,Lh+=3):(g=ab,0===Qh&&j(Zb)),g!==ab?(h=Za(),h!==ab?(i=Va(),i!==ab?(k=v(),k!==ab?(Mh=e,f=mb(c,k),e=f):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab);d!==ab?(Mh=b,c=$b(c,d),b=c):(Lh=b,b=ab)}else Lh=b,b=ab;return Rh[l]={nextPos:Lh,result:b},b}function v(){var a,b,c,d,e,f,g=109*Lh+13,h=Rh[g];return h?(Lh=h.nextPos,h.result):(a=Lh,b=w(),b!==ab?(c=Va(),c!==ab?(d=I(),d===ab&&(d=H(),d===ab&&(d=J())),d!==ab?(e=Va(),e!==ab?(f=w(),f!==ab?(Mh=a,b=_b(b,d,f),a=b):(Lh=a,a=ab)):(Lh=a,a=ab)):(Lh=a,a=ab)):(Lh=a,a=ab)):(Lh=a,a=ab),a===ab&&(a=w()),Rh[g]={nextPos:Lh,result:a},a)}function w(){var b,c,d,e,f,g,h,i,k=109*Lh+14,l=Rh[k];if(l)return Lh=l.nextPos,l.result;if(b=Lh,c=x(),c!==ab){for(d=[],e=Lh,f=Va(),f!==ab?(a.substr(Lh,2)===ac?(g=ac,Lh+=2):(g=ab,0===Qh&&j(bc)),g!==ab?(h=Va(),h!==ab?(i=x(),i!==ab?(Mh=e,f=mb(c,i),e=f):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab);e!==ab;)d.push(e),e=Lh,f=Va(),f!==ab?(a.substr(Lh,2)===ac?(g=ac,Lh+=2):(g=ab,0===Qh&&j(bc)),g!==ab?(h=Va(),h!==ab?(i=x(),i!==ab?(Mh=e,f=mb(c,i),e=f):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab);d!==ab?(Mh=b,c=cc(c,d),b=c):(Lh=b,b=ab)}else Lh=b,b=ab;return Rh[k]={nextPos:Lh,result:b},b}function x(){var b,c,d,e,f,g,h,i,k=109*Lh+15,l=Rh[k];return l?(Lh=l.nextPos,l.result):(b=Lh,c=y(),c!==ab?(d=Lh,e=Va(),e!==ab?(a.substr(Lh,2)===dc?(f=dc,Lh+=2):(f=ab,0===Qh&&j(ec)),f!==ab?(g=Za(),g!==ab?(h=Va(),h!==ab?(i=y(),i!==ab?(Mh=d,e=fc(c,i),d=e):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab),d===ab&&(d=null),d!==ab?(Mh=b,c=gc(c,d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[k]={nextPos:Lh,result:b},b)}function y(){var b,c,d,e,f,g,h=109*Lh+16,i=Rh[h];return i?(Lh=i.nextPos,i.result):(b=Lh,c=z(),c!==ab?(d=Va(),d!==ab?(45===a.charCodeAt(Lh)?(e=hc,Lh++):(e=ab,0===Qh&&j(ic)),e===ab&&(43===a.charCodeAt(Lh)?(e=jc,Lh++):(e=ab,0===Qh&&j(kc))),e!==ab?(f=Va(),f!==ab?(g=y(),g!==ab?(Mh=b,c=lc(c,e,g),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=z()),Rh[h]={nextPos:Lh,result:b},b)}function z(){var b,c,d,e,f,g,h=109*Lh+17,i=Rh[h];return i?(Lh=i.nextPos,i.result):(b=Lh,c=A(),c!==ab?(d=Va(),d!==ab?(42===a.charCodeAt(Lh)?(e=mc,Lh++):(e=ab,0===Qh&&j(nc)),e===ab&&(e=Lh,a.substr(Lh,3)===oc?(f=oc,Lh+=3):(f=ab,0===Qh&&j(pc)),f===ab&&(a.substr(Lh,4)===qc?(f=qc,Lh+=4):(f=ab,0===Qh&&j(rc)),f===ab&&(a.substr(Lh,3)===sc?(f=sc,Lh+=3):(f=ab,0===Qh&&j(tc)))),f!==ab?(g=Za(),g!==ab?(Mh=e,f=uc(c,f),e=f):(Lh=e,e=ab)):(Lh=e,e=ab)),e!==ab?(f=Va(),f!==ab?(g=z(),g!==ab?(Mh=b,c=lc(c,e,g),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=A()),Rh[h]={nextPos:Lh,result:b},b)}function A(){var b,c,d,e,f,g,h,i,k=109*Lh+18,l=Rh[k];if(l)return Lh=l.nextPos,l.result;if(b=Lh,c=B(),c!==ab){if(d=[],e=Lh,f=Va(),f!==ab?(124===a.charCodeAt(Lh)?(g=vc,Lh++):(g=ab,0===Qh&&j(wc)),g===ab&&(g=Lh,a.substr(Lh,5)===xc?(h=xc,Lh+=5):(h=ab,0===Qh&&j(yc)),h!==ab?(i=Za(),i!==ab?(h=[h,i],g=h):(Lh=g,g=ab)):(Lh=g,g=ab)),g!==ab?(h=Va(),h!==ab?(i=B(),i!==ab?(Mh=e,f=mb(c,i),e=f):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab),e!==ab)for(;e!==ab;)d.push(e),e=Lh,f=Va(),f!==ab?(124===a.charCodeAt(Lh)?(g=vc,Lh++):(g=ab,0===Qh&&j(wc)),g===ab&&(g=Lh,a.substr(Lh,5)===xc?(h=xc,Lh+=5):(h=ab,0===Qh&&j(yc)),h!==ab?(i=Za(),i!==ab?(h=[h,i],g=h):(Lh=g,g=ab)):(Lh=g,g=ab)),g!==ab?(h=Va(),h!==ab?(i=B(),i!==ab?(Mh=e,f=mb(c,i),e=f):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab);else d=ab;d!==ab?(Mh=b,c=zc(c,d),b=c):(Lh=b,b=ab)}else Lh=b,b=ab;return b===ab&&(b=B()),Rh[k]={nextPos:Lh,result:b},b}function B(){var b,c,d,e,f,g,h,i,k=109*Lh+19,l=Rh[k];return l?(Lh=l.nextPos,l.result):(b=Lh,c=C(),c!==ab?(d=Lh,e=Va(),e!==ab?(a.substr(Lh,9)===Ac?(f=Ac,Lh+=9):(f=ab,0===Qh&&j(Bc)),f===ab&&(a.substr(Lh,6)===Cc?(f=Cc,Lh+=6):(f=ab,0===Qh&&j(Dc))),f!==ab?(g=Za(),g!==ab?(h=Va(),h!==ab?(i=B(),i!==ab?(Mh=d,e=Ec(c,f,i),d=e):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab),d===ab&&(d=null),d!==ab?(Mh=b,c=Fc(c,d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[k]={nextPos:Lh,result:b},b)}function C(){var b,c,d,e,f,g,h,i,k,l,m=109*Lh+20,n=Rh[m];return n?(Lh=n.nextPos,n.result):(b=Lh,c=D(),c!==ab?(d=Lh,e=Va(),e!==ab?(a.substr(Lh,8)===Gc?(f=Gc,Lh+=8):(f=ab,0===Qh&&j(Hc)),f!==ab?(g=Wa(),g!==ab?(a.substr(Lh,2)===Ic?(h=Ic,Lh+=2):(h=ab,0===Qh&&j(Jc)),h!==ab?(i=Za(),i!==ab?(k=Va(),k!==ab?(l=la(),l!==ab?(Mh=d,e=fc(c,l),d=e):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab),d===ab&&(d=null),d!==ab?(Mh=b,c=Kc(c,d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=D()),Rh[m]={nextPos:Lh,result:b},b)}function D(){var b,c,d,e,f,g,h,i,k,l,m=109*Lh+21,n=Rh[m];return n?(Lh=n.nextPos,n.result):(b=Lh,c=E(),c!==ab?(d=Lh,e=Va(),e!==ab?(a.substr(Lh,8)===Lc?(f=Lc,Lh+=8):(f=ab,0===Qh&&j(Mc)),f!==ab?(g=Wa(),g!==ab?(a.substr(Lh,2)===Nc?(h=Nc,Lh+=2):(h=ab,0===Qh&&j(Oc)),h!==ab?(i=Za(),i!==ab?(k=Va(),k!==ab?(l=ka(),l!==ab?(Mh=d,e=fc(c,l),d=e):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab),d===ab&&(d=null),d!==ab?(Mh=b,c=Pc(c,d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[m]={nextPos:Lh,result:b},b)}function E(){var b,c,d,e,f,g,h,i,k,l,m=109*Lh+22,n=Rh[m];return n?(Lh=n.nextPos,n.result):(b=Lh,c=F(),c!==ab?(d=Lh,e=Va(),e!==ab?(a.substr(Lh,4)===Qc?(f=Qc,Lh+=4):(f=ab,0===Qh&&j(Rc)),f!==ab?(g=Wa(),g!==ab?(a.substr(Lh,2)===Nc?(h=Nc,Lh+=2):(h=ab,0===Qh&&j(Oc)),h!==ab?(i=Za(),i!==ab?(k=Va(),k!==ab?(l=ka(),l!==ab?(Mh=d,e=fc(c,l),d=e):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab),d===ab&&(d=null),d!==ab?(Mh=b,c=Sc(c,d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[m]={nextPos:Lh,result:b},b)}function F(){var b,c,d,e,f,g,h,i,k,l,m,n=109*Lh+23,o=Rh[n];if(o)return Lh=o.nextPos,o.result;if(b=Lh,c=G(),c!==ab){for(d=[],e=Lh,f=Va(),f!==ab?(a.substr(Lh,2)===Tc?(g=Tc,Lh+=2):(g=ab,0===Qh&&j(Uc)),g!==ab?(h=Va(),h!==ab?(i=_(),i!==ab?(k=Va(),k!==ab?(l=X(),l!==ab?(m=Va(),m!==ab?(Mh=e,f=Vc(c,i,l),e=f):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab);e!==ab;)d.push(e),e=Lh,f=Va(),f!==ab?(a.substr(Lh,2)===Tc?(g=Tc,Lh+=2):(g=ab,0===Qh&&j(Uc)),g!==ab?(h=Va(),h!==ab?(i=_(),i!==ab?(k=Va(),k!==ab?(l=X(),l!==ab?(m=Va(),m!==ab?(Mh=e,f=Vc(c,i,l),e=f):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab);d!==ab?(Mh=b,c=Wc(c,d),b=c):(Lh=b,b=ab)}else Lh=b,b=ab;return Rh[n]={nextPos:Lh,result:b},b}function G(){var b,c,d,e=109*Lh+24,f=Rh[e];return f?(Lh=f.nextPos,f.result):(b=Lh,45===a.charCodeAt(Lh)?(c=hc,Lh++):(c=ab,0===Qh&&j(ic)),c!==ab?(d=G(),d!==ab?(Mh=b,c=Xc(d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=Lh,43===a.charCodeAt(Lh)?(c=jc,Lh++):(c=ab,0===Qh&&j(kc)),c!==ab?(d=G(),d!==ab?(Mh=b,c=Yc(d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=K())),Rh[e]={nextPos:Lh,result:b},b)}function H(){var b,c,d=109*Lh+25,e=Rh[d];return e?(Lh=e.nextPos,e.result):(b=Lh,61===a.charCodeAt(Lh)?(c=Zc,Lh++):(c=ab,0===Qh&&j($c)),c===ab&&(a.substr(Lh,2)===_c?(c=_c,Lh+=2):(c=ab,0===Qh&&j(ad)),c===ab&&(a.substr(Lh,2)===bd?(c=bd,Lh+=2):(c=ab,0===Qh&&j(cd)),c===ab&&(60===a.charCodeAt(Lh)?(c=dd,Lh++):(c=ab,0===Qh&&j(ed)),c===ab&&(a.substr(Lh,2)===fd?(c=fd,Lh+=2):(c=ab,0===Qh&&j(gd)),c===ab&&(62===a.charCodeAt(Lh)?(c=hd,Lh++):(c=ab,0===Qh&&j(id))))))),c!==ab&&(Mh=b,c=jd(c)),b=c,Rh[d]={nextPos:Lh,result:b},b)}function I(){var b,c,d,e=109*Lh+26,f=Rh[e];return f?(Lh=f.nextPos,f.result):(b=Lh,a.substr(Lh,2)===kd?(c=kd,Lh+=2):(c=ab,0===Qh&&j(ld)),c===ab&&(a.substr(Lh,2)===md?(c=md,Lh+=2):(c=ab,0===Qh&&j(nd)),c===ab&&(a.substr(Lh,2)===od?(c=od,Lh+=2):(c=ab,0===Qh&&j(pd)),c===ab&&(a.substr(Lh,2)===qd?(c=qd,Lh+=2):(c=ab,0===Qh&&j(rd)),c===ab&&(a.substr(Lh,2)===sd?(c=sd,Lh+=2):(c=ab,0===Qh&&j(td)),c===ab&&(a.substr(Lh,2)===ud?(c=ud,Lh+=2):(c=ab,0===Qh&&j(vd))))))),c!==ab?(d=Za(),d!==ab?(Mh=b,c=wd(c),b=c):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[e]={nextPos:Lh,result:b},b)}function J(){var b,c,d,e,f=109*Lh+27,g=Rh[f];return g?(Lh=g.nextPos,g.result):(b=Lh,c=Lh,a.substr(Lh,2)===xd?(d=xd,Lh+=2):(d=ab,0===Qh&&j(yd)),d!==ab?(e=Za(),e!==ab?(Mh=c,d=zd(d),c=d):(Lh=c,c=ab)):(Lh=c,c=ab),c===ab&&(a.substr(Lh,2)===Ad?(c=Ad,Lh+=2):(c=ab,0===Qh&&j(Bd)),c===ab&&(a.substr(Lh,2)===Cd?(c=Cd,Lh+=2):(c=ab,0===Qh&&j(Dd)))),c!==ab&&(Mh=b,c=Ed(c)),b=c,Rh[f]={nextPos:Lh,result:b},b)}function K(){var b,c,d,e,f,g,h,i,k=109*Lh+28,l=Rh[k];if(l)return Lh=l.nextPos,l.result;if(b=Lh,c=L(),c!==ab){for(d=[],e=Lh,f=Va(),f!==ab?(33===a.charCodeAt(Lh)?(g=Fd,Lh++):(g=ab,0===Qh&&j(Gd)),g!==ab?(h=Va(),h!==ab?(i=L(),i!==ab?(Mh=e,f=Hd(c,i),e=f):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab);e!==ab;)d.push(e),e=Lh,f=Va(),f!==ab?(33===a.charCodeAt(Lh)?(g=Fd,Lh++):(g=ab,0===Qh&&j(Gd)),g!==ab?(h=Va(),h!==ab?(i=L(),i!==ab?(Mh=e,f=Hd(c,i),e=f):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab)):(Lh=e,e=ab);d!==ab?(Mh=b,c=Id(c,d),b=c):(Lh=b,b=ab)}else Lh=b,b=ab;return Rh[k]={nextPos:Lh,result:b},b}function L(){var a,b=109*Lh+29,c=Rh[b];return c?(Lh=c.nextPos,c.result):(a=M(),a===ab&&(a=O()),Rh[b]={nextPos:Lh,result:a},a)}function M(){var b,c,d,e,f=109*Lh+30,g=Rh[f];return g?(Lh=g.nextPos,g.result):(b=Lh,c=N(),c!==ab?(d=P(),d!==ab?(e=M(),e!==ab?(Mh=b,c=Jd(c,d,e),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=Lh,c=N(),c!==ab?(47===a.charCodeAt(Lh)?(d=Kd,Lh++):(d=ab,0===Qh&&j(Ld)),d!==ab?(e=M(),e!==ab?(Mh=b,c=Md(c,e),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=N())),Rh[f]={nextPos:Lh,result:b},b)}function N(){var a,b=109*Lh+31,c=Rh[b];return c?(Lh=c.nextPos,c.result):(a=W(),a===ab&&(a=Q()),Rh[b]={nextPos:Lh,result:a},a)}function O(){var b,c,d,e=109*Lh+32,f=Rh[e];return f?(Lh=f.nextPos,f.result):(b=Lh,47===a.charCodeAt(Lh)?(c=Kd,Lh++):(c=ab,0===Qh&&j(Ld)),c!==ab?(d=M(),d!==ab?(Mh=b,c=Nd(d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=Lh,c=P(),c!==ab?(d=M(),d!==ab?(Mh=b,c=Od(c,d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)),Rh[e]={nextPos:Lh,result:b},b)}function P(){var b,c,d=109*Lh+33,e=Rh[d];return e?(Lh=e.nextPos,e.result):(b=Lh,a.substr(Lh,2)===Pd?(c=Pd,Lh+=2):(c=ab,0===Qh&&j(Qd)),c!==ab&&(Mh=b,c=Rd()),b=c,Rh[d]={nextPos:Lh,result:b},b)}function Q(){var a,b,c,d,e,f=109*Lh+34,g=Rh[f];if(g)return Lh=g.nextPos,g.result;if(a=Lh,b=R(),b!==ab)if(c=U(),c!==ab){for(d=[],e=Y();e!==ab;)d.push(e),e=Y();d!==ab?(Mh=a,b=Sd(b,c,d),a=b):(Lh=a,a=ab)}else Lh=a,a=ab;else Lh=a,a=ab;return a===ab&&(a=T()),Rh[f]={nextPos:Lh,result:a},a}function R(){var b,c,d,e=109*Lh+35,f=Rh[e];return f?(Lh=f.nextPos,f.result):(b=Lh,c=S(),c!==ab?(a.substr(Lh,2)===Td?(d=Td,Lh+=2):(d=ab,0===Qh&&j(Ud)),d!==ab?(Mh=b,c=Vd(c),b=c):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=Lh,64===a.charCodeAt(Lh)?(c=Wd,Lh++):(c=ab,0===Qh&&j(Xd)),c!==ab&&(Mh=b,c=Yd()),b=c,b===ab&&(b=Lh,c=Zd,c!==ab&&(Mh=b,c=$d()),b=c)),Rh[e]={nextPos:Lh,result:b},b)}function S(){var b,c=109*Lh+36,d=Rh[c];return d?(Lh=d.nextPos,d.result):(a.substr(Lh,16)===_d?(b=_d,Lh+=16):(b=ab,0===Qh&&j(ae)),b===ab&&(a.substr(Lh,8)===be?(b=be,Lh+=8):(b=ab,0===Qh&&j(ce)),b===ab&&(a.substr(Lh,9)===de?(b=de,Lh+=9):(b=ab,0===Qh&&j(ee)),b===ab&&(a.substr(Lh,5)===fe?(b=fe,Lh+=5):(b=ab,0===Qh&&j(ge)),b===ab&&(a.substr(Lh,9)===he?(b=he,Lh+=9):(b=ab,0===Qh&&j(ie)),b===ab&&(a.substr(Lh,17)===je?(b=je,Lh+=17):(b=ab,0===Qh&&j(ke)),b===ab&&(a.substr(Lh,18)===le?(b=le,Lh+=18):(b=ab,0===Qh&&j(me)),b===ab&&(a.substr(Lh,10)===ne?(b=ne,Lh+=10):(b=ab,0===Qh&&j(oe)),b===ab&&(a.substr(Lh,9)===pe?(b=pe,Lh+=9):(b=ab,0===Qh&&j(qe)),b===ab&&(a.substr(Lh,6)===re?(b=re,Lh+=6):(b=ab,0===Qh&&j(se)),b===ab&&(a.substr(Lh,17)===te?(b=te,Lh+=17):(b=ab,0===Qh&&j(ue)),b===ab&&(a.substr(Lh,4)===ve?(b=ve,Lh+=4):(b=ab,0===Qh&&j(we))))))))))))),Rh[c]={nextPos:Lh,result:b},b)}function T(){var b,c,d=109*Lh+37,e=Rh[d];return e?(Lh=e.nextPos,e.result):(b=Lh,a.substr(Lh,2)===xe?(c=xe,Lh+=2):(c=ab,0===Qh&&j(ye)),c!==ab&&(Mh=b,c=ze()),b=c,Rh[d]={nextPos:Lh,result:b},b)}function U(){var a,b,c=109*Lh+38,d=Rh[c];return d?(Lh=d.nextPos,d.result):(a=pa(),a===ab&&(a=Lh,b=V(),b!==ab&&(Mh=a,b=Ae(b)),a=b),Rh[c]={nextPos:Lh,result:a},a)}function V(){var b,c=109*Lh+39,d=Rh[c];return d?(Lh=d.nextPos,d.result):(b=Da(),b===ab&&(42===a.charCodeAt(Lh)?(b=mc,Lh++):(b=ab,0===Qh&&j(nc))),Rh[c]={nextPos:Lh,result:b},b)}function W(){var a,b,c,d,e,f=109*Lh+40,g=Rh[f];if(g)return Lh=g.nextPos,g.result;if(a=Lh,b=aa(),b!==ab){for(c=[],d=Lh,e=Y(),e!==ab&&(Mh=d,e=Be(b,e)),d=e,d===ab&&(d=Lh,e=X(),e!==ab&&(Mh=d,e=Ce(b,e)),d=e,d===ab&&(d=Lh,e=Z(),e!==ab&&(Mh=d,e=De(b,e)),d=e));d!==ab;)c.push(d),d=Lh,e=Y(),e!==ab&&(Mh=d,e=Be(b,e)),d=e,d===ab&&(d=Lh,e=X(),e!==ab&&(Mh=d,e=Ce(b,e)),d=e,d===ab&&(d=Lh,e=Z(),e!==ab&&(Mh=d,e=De(b,e)),d=e));c!==ab?(Mh=a,b=Ee(b,c),a=b):(Lh=a,a=ab)}else Lh=a,a=ab;return Rh[f]={nextPos:Lh,result:a},a}function X(){var b,c,d,e,f,g,h,i,k,l,m=109*Lh+41,n=Rh[m];if(n)return Lh=n.nextPos,n.result;if(b=Lh,40===a.charCodeAt(Lh)?(c=Mb,Lh++):(c=ab,0===Qh&&j(Nb)),c!==ab){if(d=Lh,e=ha(),e!==ab){for(f=[],g=Lh,h=Va(),h!==ab?(44===a.charCodeAt(Lh)?(i=eb,Lh++):(i=ab,0===Qh&&j(fb)),i!==ab?(k=Va(),k!==ab?(l=ha(),l!==ab?(Mh=g,h=Fe(e,l),g=h):(Lh=g,g=ab)):(Lh=g,g=ab)):(Lh=g,g=ab)):(Lh=g,g=ab);g!==ab;)f.push(g),g=Lh,h=Va(),h!==ab?(44===a.charCodeAt(Lh)?(i=eb,Lh++):(i=ab,0===Qh&&j(fb)),i!==ab?(k=Va(),k!==ab?(l=ha(),l!==ab?(Mh=g,h=Fe(e,l),g=h):(Lh=g,g=ab)):(Lh=g,g=ab)):(Lh=g,g=ab)):(Lh=g,g=ab);f!==ab?(Mh=d,e=wb(e,f),d=e):(Lh=d,d=ab)}else Lh=d,d=ab;d===ab&&(d=null),d!==ab?(41===a.charCodeAt(Lh)?(e=Ob,Lh++):(e=ab,0===Qh&&j(Pb)),e!==ab?(Mh=b,c=Ge(d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)}else Lh=b,b=ab;return Rh[m]={nextPos:Lh,result:b},b}function Y(){var b,c,d,e,f=109*Lh+42,g=Rh[f];return g?(Lh=g.nextPos,g.result):(b=Lh,91===a.charCodeAt(Lh)?(c=He,Lh++):(c=ab,0===Qh&&j(Ie)),c!==ab?(d=m(),d!==ab?(93===a.charCodeAt(Lh)?(e=Je,Lh++):(e=ab,0===Qh&&j(Ke)),e!==ab?(Mh=b,c=Le(d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[f]={nextPos:Lh,result:b},b)}function Z(){var b,c,d,e=109*Lh+43,f=Rh[e];return f?(Lh=f.nextPos,f.result):(b=Lh,63===a.charCodeAt(Lh)?(c=Me,Lh++):(c=ab,0===Qh&&j(Ne)),c!==ab?(d=$(),d!==ab?(Mh=b,c=Oe(d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[e]={nextPos:Lh,result:b},b)}function $(){var b,c=109*Lh+44,d=Rh[c];return d?(Lh=d.nextPos,d.result):(b=Oa(),b===ab&&(b=da(),b===ab&&(b=ea(),b===ab&&(42===a.charCodeAt(Lh)?(b=mc,Lh++):(b=ab,0===Qh&&j(nc))))),Rh[c]={nextPos:Lh,result:b},b)}function _(){var a,b=109*Lh+45,c=Rh[b];return c?(Lh=c.nextPos,c.result):(a=Da(),a===ab&&(a=da(),a===ab&&(a=ea())),Rh[b]={nextPos:Lh,result:a},a)}function aa(){var a,b=109*Lh+46,c=Rh[b];return c?(Lh=c.nextPos,c.result):(a=ba(),a===ab&&(a=da(),a===ab&&(a=ea(),a===ab&&(a=fa(),a===ab&&(a=ga(),a===ab&&(a=ja()))))),Rh[b]={nextPos:Lh,result:a},a)}function ba(){var a,b=109*Lh+47,c=Rh[b];return c?(Lh=c.nextPos,c.result):(a=ca(),a===ab&&(a=Ha()),Rh[b]={nextPos:Lh,result:a},a)}function ca(){var b,c,d,e,f=109*Lh+48,g=Rh[f];return g?(Lh=g.nextPos,g.result):(b=Lh,c=Ga(),c===ab&&(c=Fa(),c===ab&&(c=Ea())),c!==ab?(d=Lh,Qh++,Pe.test(a.charAt(Lh))?(e=a.charAt(Lh),Lh++):(e=ab,0===Qh&&j(Qe)),Qh--,e===ab?d=void 0:(Lh=d,d=ab),d!==ab?(Mh=b,c=Re(c),b=c):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[f]={nextPos:Lh,result:b},b)}function da(){var b,c,d,e=109*Lh+49,f=Rh[e];return f?(Lh=f.nextPos,f.result):(b=Lh,36===a.charCodeAt(Lh)?(c=gb,Lh++):(c=ab,0===Qh&&j(hb)),c!==ab?(d=Da(),d!==ab?(Mh=b,c=Se(d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[e]={nextPos:Lh,result:b},b)}function ea(){var b,c,d,e,f,g,h=109*Lh+50,i=Rh[h];return i?(Lh=i.nextPos,i.result):(b=Lh,40===a.charCodeAt(Lh)?(c=Mb,Lh++):(c=ab,0===Qh&&j(Nb)),c!==ab?(d=Va(),d!==ab?(e=m(),e!==ab?(f=Va(),f!==ab?(41===a.charCodeAt(Lh)?(g=Ob,Lh++):(g=ab,0===Qh&&j(Pb)),g!==ab?(Mh=b,c=db(e),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=Lh,40===a.charCodeAt(Lh)?(c=Mb,Lh++):(c=ab,0===Qh&&j(Nb)),c!==ab?(d=Va(),d!==ab?(41===a.charCodeAt(Lh)?(e=Ob,Lh++):(e=ab,0===Qh&&j(Pb)),e!==ab?(Mh=b,c=Te(),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)),Rh[h]={nextPos:Lh,result:b},b)}function fa(){var b,c,d,e,f=109*Lh+51,g=Rh[f];return g?(Lh=g.nextPos,g.result):(b=Lh,46===a.charCodeAt(Lh)?(c=Ue,Lh++):(c=ab,0===Qh&&j(Ve)),c!==ab?(d=Lh,Qh++,46===a.charCodeAt(Lh)?(e=Ue,Lh++):(e=ab,0===Qh&&j(Ve)),Qh--,e===ab?d=void 0:(Lh=d,d=ab),d!==ab?(Mh=b,c=We(),b=c):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[f]={nextPos:Lh,result:b},b)}function ga(){var b,c,d,e,f,g,h=109*Lh+52,i=Rh[h];return i?(Lh=i.nextPos,i.result):(b=Lh,c=Lh,Qh++,d=Lh,e=Ya(),e!==ab?(f=Va(),f!==ab?(40===a.charCodeAt(Lh)?(g=Mb,Lh++):(g=ab,0===Qh&&j(Nb)),g!==ab?(e=[e,f,g],d=e):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab),Qh--,d===ab?c=void 0:(Lh=c,c=ab),c!==ab?(d=Da(),d!==ab?(e=Va(),e!==ab?(f=X(),f!==ab?(Mh=b,c=Xe(d,f),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[h]={nextPos:Lh,result:b},b)}function ha(){var a,b=109*Lh+53,c=Rh[b];return c?(Lh=c.nextPos,c.result):(a=ia(),a===ab&&(a=n()),Rh[b]={nextPos:Lh,result:a},a)}function ia(){var b,c,d=109*Lh+54,e=Rh[d];return e?(Lh=e.nextPos,e.result):(b=Lh,63===a.charCodeAt(Lh)?(c=Me,Lh++):(c=ab,0===Qh&&j(Ne)),c!==ab&&(Mh=b,c=Ye()),b=c,Rh[d]={nextPos:Lh,result:b},b)}function ja(){var b,c,d,e,f=109*Lh+55,g=Rh[f];return g?(Lh=g.nextPos,g.result):(b=Lh,c=Da(),c!==ab?(35===a.charCodeAt(Lh)?(d=Ze,Lh++):(d=ab,0===Qh&&j($e)),d!==ab?(e=Ea(),e!==ab?(Mh=b,c=_e(c,e),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[f]={nextPos:Lh,result:b},b)}function ka(){var b,c,d,e=109*Lh+57,f=Rh[e];return f?(Lh=f.nextPos,f.result):(b=Lh,c=Da(),c!==ab?(63===a.charCodeAt(Lh)?(d=Me,Lh++):(d=ab,0===Qh&&j(Ne)),d===ab&&(d=null),d!==ab?(Mh=b,c=cf(c,d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[e]={nextPos:Lh,result:b},b)}function la(){var b,c,d,e,f=109*Lh+59,g=Rh[f];return g?(Lh=g.nextPos,g.result):(a.substr(Lh,16)===df?(b=df,Lh+=16):(b=ab,0===Qh&&j(ef)),b===ab&&(b=Lh,c=na(),c!==ab?(d=Va(),d!==ab?(e=ma(),e===ab&&(e=null),e!==ab?(Mh=b,c=ff(c,e),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)),Rh[f]={nextPos:Lh,result:b},b)}function ma(){var b,c=109*Lh+60,d=Rh[c];return d?(Lh=d.nextPos,d.result):(63===a.charCodeAt(Lh)?(b=Me,Lh++):(b=ab,0===Qh&&j(Ne)),b===ab&&(42===a.charCodeAt(Lh)?(b=mc,Lh++):(b=ab,0===Qh&&j(nc)),b===ab&&(43===a.charCodeAt(Lh)?(b=jc,Lh++):(b=ab,0===Qh&&j(kc)))),Rh[c]={nextPos:Lh,result:b},b)}function na(){var b,c=109*Lh+61,d=Rh[c];return d?(Lh=d.nextPos,d.result):(b=pa(),b===ab&&(a.substr(Lh,6)===gf?(b=gf,Lh+=6):(b=ab,0===Qh&&j(hf)),b===ab&&(b=oa(),b===ab&&(b=Ca()))),Rh[c]={nextPos:Lh,result:b},b)}function oa(){var a,b,c=109*Lh+62,d=Rh[c];return d?(Lh=d.nextPos,d.result):(a=Lh,b=Da(),b!==ab&&(Mh=a,b=jf(b)),a=b,Rh[c]={nextPos:Lh,result:a},a)}function pa(){var a,b,c=109*Lh+63,d=Rh[c];return d?(Lh=d.nextPos,d.result):(a=ra(),a===ab&&(a=za(),a===ab&&(a=wa(),a===ab&&(a=Lh,b=Ba(),b!==ab&&(Mh=a,b=kf()),a=b,a===ab&&(a=Lh,b=ya(),b!==ab&&(Mh=a,b=kf()),a=b,a===ab&&(a=va(),a===ab&&(a=ta(),a===ab&&(a=sa(),a===ab&&(a=Lh,b=ua(),b!==ab&&(Mh=a,b=kf()),a=b,a===ab&&(a=qa(),a===ab&&(a=Lh,b=ga(),b!==ab&&(Mh=a,b=lf(b)),a=b)))))))))),Rh[c]={nextPos:Lh,result:a},a)}function qa(){var b,c,d=109*Lh+64,e=Rh[d];return e?(Lh=e.nextPos,e.result):(b=Lh,a.substr(Lh,6)===mf?(c=mf,Lh+=6):(c=ab,0===Qh&&j(nf)),c!==ab&&(Mh=b,c=of()),b=c,Rh[d]={nextPos:Lh,result:b},b)}function ra(){var b,c,d,e,f,g,h=109*Lh+65,i=Rh[h];return i?(Lh=i.nextPos,i.result):(b=Lh,a.substr(Lh,14)===pf?(c=pf,Lh+=14):(c=ab,0===Qh&&j(qf)),c!==ab?(d=Va(),d!==ab?(e=za(),e===ab&&(e=Ba()),e===ab&&(e=null),e!==ab?(f=Va(),f!==ab?(41===a.charCodeAt(Lh)?(g=Ob,Lh++):(g=ab,0===Qh&&j(Pb)),g!==ab?(Mh=b,c=rf(e),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=Lh,a.substr(Lh,15)===sf?(c=sf,Lh+=15):(c=ab,0===Qh&&j(tf)),c!==ab&&(Mh=b,c=uf()),b=c),Rh[h]={nextPos:Lh,result:b},b)}function sa(){var b,c,d=109*Lh+66,e=Rh[d];return e?(Lh=e.nextPos,e.result):(b=Lh,a.substr(Lh,6)===vf?(c=vf,Lh+=6):(c=ab,0===Qh&&j(wf)),c!==ab&&(Mh=b,c=xf()),b=c,Rh[d]={nextPos:Lh,result:b},b)}function ta(){var b,c,d=109*Lh+67,e=Rh[d];return e?(Lh=e.nextPos,e.result):(b=Lh,a.substr(Lh,9)===yf?(c=yf,Lh+=9):(c=ab,0===Qh&&j(zf)),c!==ab&&(Mh=b,c=Af()),b=c,Rh[d]={nextPos:Lh,result:b},b)}function ua(){var b,c,d=109*Lh+68,e=Rh[d];return e?(Lh=e.nextPos,e.result):(b=Lh,a.substr(Lh,16)===Bf?(c=Bf,Lh+=16):(c=ab,0===Qh&&j(Cf)),c!==ab&&(Mh=b,c=Df()),b=c,Rh[d]={nextPos:Lh,result:b},b)}function va(){var b,c,d,e,f,g,h=109*Lh+69,i=Rh[h];return i?(Lh=i.nextPos,i.result):(b=Lh,a.substr(Lh,23)===Ef?(c=Ef,Lh+=23):(c=ab,0===Qh&&j(Ff)),c!==ab?(d=Va(),d!==ab?(e=Oa(),e!==ab?(f=Va(),f!==ab?(41===a.charCodeAt(Lh)?(g=Ob,Lh++):(g=ab,0===Qh&&j(Pb)),g!==ab?(Mh=b,c=Gf(e),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=Lh,a.substr(Lh,23)===Ef?(c=Ef,Lh+=23):(c=ab,0===Qh&&j(Ff)),c!==ab?(d=Va(),d!==ab?(e=Ha(),e!==ab?(f=Va(),f!==ab?(41===a.charCodeAt(Lh)?(g=Ob,Lh++):(g=ab,0===Qh&&j(Pb)),g!==ab?(Mh=b,c=Hf(e),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=Lh,a.substr(Lh,24)===If?(c=If,Lh+=24):(c=ab,0===Qh&&j(Jf)),c!==ab&&(Mh=b,c=Kf()),b=c)),Rh[h]={nextPos:Lh,result:b},b)}function wa(){var b,c,d,e,f,g,h,i,k,l,m=109*Lh+70,n=Rh[m];return n?(Lh=n.nextPos,n.result):(b=Lh,a.substr(Lh,10)===Lf?(c=Lf,Lh+=10):(c=ab,0===Qh&&j(Mf)),c!==ab?(d=Va(),d!==ab?(e=xa(),e!==ab?(f=Va(),f!==ab?(44===a.charCodeAt(Lh)?(g=eb,Lh++):(g=ab,0===Qh&&j(fb)),g!==ab?(h=Va(),h!==ab?(i=Da(),i!==ab?(k=Va(),k!==ab?(41===a.charCodeAt(Lh)?(l=Ob,Lh++):(l=ab,0===Qh&&j(Pb)),l!==ab?(Mh=b,c=Nf(e,i),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=Lh,a.substr(Lh,10)===Lf?(c=Lf,Lh+=10):(c=ab,0===Qh&&j(Mf)),c!==ab?(d=Va(),d!==ab?(e=xa(),e!==ab?(f=Va(),f!==ab?(41===a.charCodeAt(Lh)?(g=Ob,Lh++):(g=ab,0===Qh&&j(Pb)),g!==ab?(Mh=b,c=Of(e),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=Lh,a.substr(Lh,11)===Pf?(c=Pf,Lh+=11):(c=ab,0===Qh&&j(Qf)),c!==ab&&(Mh=b,c=Rf()),b=c)),Rh[m]={nextPos:Lh,result:b},b)}function xa(){var b,c=109*Lh+71,d=Rh[c];return d?(Lh=d.nextPos,d.result):(b=Da(),b===ab&&(42===a.charCodeAt(Lh)?(b=mc,Lh++):(b=ab,0===Qh&&j(nc))),Rh[c]={nextPos:Lh,result:b},b)}function ya(){var b,c,d,e,f,g,h=109*Lh+72,i=Rh[h];return i?(Lh=i.nextPos,i.result):(b=Lh,a.substr(Lh,17)===Sf?(c=Sf,Lh+=17):(c=ab,0===Qh&&j(Tf)),c!==ab?(d=Va(),d!==ab?(e=Da(),e!==ab?(f=Va(),f!==ab?(41===a.charCodeAt(Lh)?(g=Ob,Lh++):(g=ab,0===Qh&&j(Pb)),g!==ab?(Mh=b,c=Uf(e),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[h]={nextPos:Lh,result:b},b)}function za(){var b,c,d,e,f,g,h,i,k,l,m=109*Lh+73,n=Rh[m];return n?(Lh=n.nextPos,n.result):(b=Lh,a.substr(Lh,8)===Vf?(c=Vf,Lh+=8):(c=ab,0===Qh&&j(Wf)),c!==ab?(d=Va(),d!==ab?(e=Aa(),e!==ab?(f=Va(),f!==ab?(44===a.charCodeAt(Lh)?(g=eb,Lh++):(g=ab,0===Qh&&j(fb)),g!==ab?(h=Va(),h!==ab?(i=Da(),i!==ab?(k=Va(),k!==ab?(41===a.charCodeAt(Lh)?(l=Ob,Lh++):(l=ab,0===Qh&&j(Pb)),l!==ab?(Mh=b,c=Xf(e,i),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=Lh,a.substr(Lh,8)===Vf?(c=Vf,Lh+=8):(c=ab,0===Qh&&j(Wf)),c!==ab?(d=Va(),d!==ab?(e=Aa(),e!==ab?(f=Va(),f!==ab?(41===a.charCodeAt(Lh)?(g=Ob,Lh++):(g=ab,0===Qh&&j(Pb)),g!==ab?(Mh=b,c=Yf(e),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=Lh,a.substr(Lh,9)===Zf?(c=Zf,Lh+=9):(c=ab,0===Qh&&j($f)),c!==ab&&(Mh=b,c=_f()),b=c)),Rh[m]={nextPos:Lh,result:b},b)}function Aa(){var b,c=109*Lh+74,d=Rh[c];return d?(Lh=d.nextPos,d.result):(b=Da(),b===ab&&(42===a.charCodeAt(Lh)?(b=mc,Lh++):(b=ab,0===Qh&&j(nc))),Rh[c]={nextPos:Lh,result:b},b)}function Ba(){var b,c,d,e,f=109*Lh+75,g=Rh[f];return g?(Lh=g.nextPos,g.result):(b=Lh,a.substr(Lh,15)===ag?(c=ag,Lh+=15):(c=ab,0===Qh&&j(bg)),c!==ab?(d=Da(),d!==ab?(41===a.charCodeAt(Lh)?(e=Ob,Lh++):(e=ab,0===Qh&&j(Pb)),e!==ab?(c=[c,d,e],b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[f]={nextPos:Lh,result:b},b)}function Ca(){var b,c,d,e,f,g,h=109*Lh+85,i=Rh[h];return i?(Lh=i.nextPos,i.result):(b=Lh,40===a.charCodeAt(Lh)?(c=Mb,Lh++):(c=ab,0===Qh&&j(Nb)),c!==ab?(d=Va(),d!==ab?(e=na(),e!==ab?(f=Va(),f!==ab?(41===a.charCodeAt(Lh)?(g=Ob,Lh++):(g=ab,0===Qh&&j(Pb)),g!==ab?(c=[c,d,e,f,g],b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[h]={nextPos:Lh,result:b},b)}function Da(){var a,b=109*Lh+86,c=Rh[b];return c?(Lh=c.nextPos,c.result):(a=Na(),a===ab&&(a=Ia()),Rh[b]={nextPos:Lh,result:a},a)}function Ea(){var a,b,c=109*Lh+87,d=Rh[c];return d?(Lh=d.nextPos,d.result):(a=Lh,b=Qa(),b!==ab&&(Mh=a,b=cg(b)),a=b,Rh[c]={nextPos:Lh,result:a},a)}function Fa(){var b,c,d,e,f,g,h=109*Lh+88,i=Rh[h];return i?(Lh=i.nextPos,i.result):(b=Lh,46===a.charCodeAt(Lh)?(c=Ue,Lh++):(c=ab,0===Qh&&j(Ve)),c!==ab?(d=Qa(),d!==ab?(Mh=b,c=dg(d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab),b===ab&&(b=Lh,c=Lh,d=Lh,e=Qa(),e!==ab?(46===a.charCodeAt(Lh)?(f=Ue,Lh++):(f=ab,0===Qh&&j(Ve)),f!==ab?(g=Qa(),g===ab&&(g=null),g!==ab?(e=[e,f,g],d=e):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab),c=d!==ab?a.substring(c,Lh):d,c!==ab&&(Mh=b,c=eg(c)),b=c),Rh[h]={nextPos:Lh,result:b},b)}function Ga(){var b,c,d,e,f,g,h,i,k,l=109*Lh+89,m=Rh[l];if(m)return Lh=m.nextPos,m.result;if(b=Lh,c=Lh,d=Lh,e=Lh,46===a.charCodeAt(Lh)?(f=Ue,Lh++):(f=ab,0===Qh&&j(Ve)),f!==ab?(g=Qa(),g!==ab?(f=[f,g],e=f):(Lh=e,e=ab)):(Lh=e,e=ab),e===ab)if(e=Lh,f=Qa(),f!==ab){if(g=Lh,46===a.charCodeAt(Lh)?(h=Ue,Lh++):(h=ab,0===Qh&&j(Ve)),h!==ab){for(i=[],fg.test(a.charAt(Lh))?(k=a.charAt(Lh),Lh++):(k=ab,0===Qh&&j(gg));k!==ab;)i.push(k),fg.test(a.charAt(Lh))?(k=a.charAt(Lh),Lh++):(k=ab,0===Qh&&j(gg));i!==ab?(h=[h,i],g=h):(Lh=g,g=ab)}else Lh=g,g=ab;g===ab&&(g=null),\ng!==ab?(f=[f,g],e=f):(Lh=e,e=ab)}else Lh=e,e=ab;return e!==ab?(hg.test(a.charAt(Lh))?(f=a.charAt(Lh),Lh++):(f=ab,0===Qh&&j(ig)),f!==ab?(jg.test(a.charAt(Lh))?(g=a.charAt(Lh),Lh++):(g=ab,0===Qh&&j(kg)),g===ab&&(g=null),g!==ab?(h=Qa(),h!==ab?(e=[e,f,g,h],d=e):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab)):(Lh=d,d=ab),c=d!==ab?a.substring(c,Lh):d,c!==ab&&(Mh=b,c=lg(c)),b=c,Rh[l]={nextPos:Lh,result:b},b}function Ha(){var b,c,d,e,f=109*Lh+90,g=Rh[f];if(g)return Lh=g.nextPos,g.result;if(b=Lh,34===a.charCodeAt(Lh)?(c=mg,Lh++):(c=ab,0===Qh&&j(ng)),c!==ab){for(d=[],e=Ka(),e===ab&&(og.test(a.charAt(Lh))?(e=a.charAt(Lh),Lh++):(e=ab,0===Qh&&j(pg)));e!==ab;)d.push(e),e=Ka(),e===ab&&(og.test(a.charAt(Lh))?(e=a.charAt(Lh),Lh++):(e=ab,0===Qh&&j(pg)));d!==ab?(34===a.charCodeAt(Lh)?(e=mg,Lh++):(e=ab,0===Qh&&j(ng)),e!==ab?(Mh=b,c=qg(d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)}else Lh=b,b=ab;if(b===ab)if(b=Lh,39===a.charCodeAt(Lh)?(c=rg,Lh++):(c=ab,0===Qh&&j(sg)),c!==ab){for(d=[],e=La(),e===ab&&(tg.test(a.charAt(Lh))?(e=a.charAt(Lh),Lh++):(e=ab,0===Qh&&j(ug)));e!==ab;)d.push(e),e=La(),e===ab&&(tg.test(a.charAt(Lh))?(e=a.charAt(Lh),Lh++):(e=ab,0===Qh&&j(ug)));d!==ab?(39===a.charCodeAt(Lh)?(e=rg,Lh++):(e=ab,0===Qh&&j(sg)),e!==ab?(Mh=b,c=qg(d),b=c):(Lh=b,b=ab)):(Lh=b,b=ab)}else Lh=b,b=ab;return Rh[f]={nextPos:Lh,result:b},b}function Ia(){var a,b=109*Lh+91,c=Rh[b];return c?(Lh=c.nextPos,c.result):(a=Ja(),a===ab&&(a=Oa()),Rh[b]={nextPos:Lh,result:a},a)}function Ja(){var b,c,d,e,f,g,h=109*Lh+92,i=Rh[h];if(i)return Lh=i.nextPos,i.result;if(b=Lh,81===a.charCodeAt(Lh)?(c=vg,Lh++):(c=ab,0===Qh&&j(wg)),c!==ab)if(d=Va(),d!==ab)if(123===a.charCodeAt(Lh)?(e=ib,Lh++):(e=ab,0===Qh&&j(jb)),e!==ab){for(f=[],xg.test(a.charAt(Lh))?(g=a.charAt(Lh),Lh++):(g=ab,0===Qh&&j(yg));g!==ab;)f.push(g),xg.test(a.charAt(Lh))?(g=a.charAt(Lh),Lh++):(g=ab,0===Qh&&j(yg));f!==ab?(125===a.charCodeAt(Lh)?(g=kb,Lh++):(g=ab,0===Qh&&j(lb)),g!==ab?(c=[c,d,e,f,g],b=c):(Lh=b,b=ab)):(Lh=b,b=ab)}else Lh=b,b=ab;else Lh=b,b=ab;else Lh=b,b=ab;return Rh[h]={nextPos:Lh,result:b},b}function Ka(){var b,c,d=109*Lh+93,e=Rh[d];return e?(Lh=e.nextPos,e.result):(b=Lh,a.substr(Lh,2)===zg?(c=zg,Lh+=2):(c=ab,0===Qh&&j(Ag)),c!==ab&&(Mh=b,c=Bg()),b=c,Rh[d]={nextPos:Lh,result:b},b)}function La(){var b,c,d=109*Lh+94,e=Rh[d];return e?(Lh=e.nextPos,e.result):(b=Lh,a.substr(Lh,2)===Cg?(c=Cg,Lh+=2):(c=ab,0===Qh&&j(Dg)),c!==ab&&(Mh=b,c=Eg()),b=c,Rh[d]={nextPos:Lh,result:b},b)}function Ma(){var b,c,d,e,f=109*Lh+95,g=Rh[f];if(g)return Lh=g.nextPos,g.result;if(b=Lh,a.substr(Lh,2)===Fg?(c=Fg,Lh+=2):(c=ab,0===Qh&&j(Gg)),c!==ab){for(d=[],e=Ra(),e===ab&&(e=Ma());e!==ab;)d.push(e),e=Ra(),e===ab&&(e=Ma());d!==ab?(a.substr(Lh,2)===Hg?(e=Hg,Lh+=2):(e=ab,0===Qh&&j(Ig)),e!==ab?(c=[c,d,e],b=c):(Lh=b,b=ab)):(Lh=b,b=ab)}else Lh=b,b=ab;return Rh[f]={nextPos:Lh,result:b},b}function Na(){var a,b=109*Lh+96,c=Rh[b];return c?(Lh=c.nextPos,c.result):(a=Sa(),a===ab&&(a=Oa()),Rh[b]={nextPos:Lh,result:a},a)}function Oa(){var a,b,c,d,e=109*Lh+97,f=Rh[e];if(f)return Lh=f.nextPos,f.result;if(a=Lh,b=Ta(),b!==ab){for(c=[],d=Ua();d!==ab;)c.push(d),d=Ua();c!==ab?(Mh=a,b=Jg(b,c),a=b):(Lh=a,a=ab)}else Lh=a,a=ab;return Rh[e]={nextPos:Lh,result:a},a}function Pa(){var b,c=109*Lh+98,d=Rh[c];return d?(Lh=d.nextPos,d.result):(9===a.charCodeAt(Lh)?(b=Kg,Lh++):(b=ab,0===Qh&&j(Lg)),b===ab&&(10===a.charCodeAt(Lh)?(b=Mg,Lh++):(b=ab,0===Qh&&j(Ng)),b===ab&&(13===a.charCodeAt(Lh)?(b=Og,Lh++):(b=ab,0===Qh&&j(Pg)),b===ab&&(Qg.test(a.charAt(Lh))?(b=a.charAt(Lh),Lh++):(b=ab,0===Qh&&j(Rg)),b===ab&&(Sg.test(a.charAt(Lh))?(b=a.charAt(Lh),Lh++):(b=ab,0===Qh&&j(Tg)),b===ab&&(Ug.test(a.charAt(Lh))?(b=a.charAt(Lh),Lh++):(b=ab,0===Qh&&j(Vg))))))),Rh[c]={nextPos:Lh,result:b},b)}function Qa(){var b,c,d,e=109*Lh+99,f=Rh[e];if(f)return Lh=f.nextPos,f.result;if(b=Lh,c=[],fg.test(a.charAt(Lh))?(d=a.charAt(Lh),Lh++):(d=ab,0===Qh&&j(gg)),d!==ab)for(;d!==ab;)c.push(d),fg.test(a.charAt(Lh))?(d=a.charAt(Lh),Lh++):(d=ab,0===Qh&&j(gg));else c=ab;return c!==ab&&(Mh=b,c=Wg(c)),b=c,Rh[e]={nextPos:Lh,result:b},b}function Ra(){var b,c,d,e,f=109*Lh+100,g=Rh[f];return g?(Lh=g.nextPos,g.result):(b=Lh,c=Lh,Qh++,a.substr(Lh,2)===Fg?(d=Fg,Lh+=2):(d=ab,0===Qh&&j(Gg)),Qh--,d===ab?c=void 0:(Lh=c,c=ab),c!==ab?(d=Lh,Qh++,a.substr(Lh,2)===Hg?(e=Hg,Lh+=2):(e=ab,0===Qh&&j(Ig)),Qh--,e===ab?d=void 0:(Lh=d,d=ab),d!==ab?(e=Pa(),e!==ab?(c=[c,d,e],b=c):(Lh=b,b=ab)):(Lh=b,b=ab)):(Lh=b,b=ab),Rh[f]={nextPos:Lh,result:b},b)}function Sa(){var b,c,d,e,f,g=109*Lh+101,h=Rh[g];return h?(Lh=h.nextPos,h.result):(b=Lh,c=Lh,d=Oa(),d!==ab?(58===a.charCodeAt(Lh)?(e=Xg,Lh++):(e=ab,0===Qh&&j(Yg)),e!==ab?(f=Oa(),f!==ab?(d=[d,e,f],c=d):(Lh=c,c=ab)):(Lh=c,c=ab)):(Lh=c,c=ab),b=c!==ab?a.substring(b,Lh):c,Rh[g]={nextPos:Lh,result:b},b)}function Ta(){var b,c=109*Lh+102,d=Rh[c];return d?(Lh=d.nextPos,d.result):(Zg.test(a.charAt(Lh))?(b=a.charAt(Lh),Lh++):(b=ab,0===Qh&&j($g)),b===ab&&(95===a.charCodeAt(Lh)?(b=_g,Lh++):(b=ab,0===Qh&&j(ah)),b===ab&&(bh.test(a.charAt(Lh))?(b=a.charAt(Lh),Lh++):(b=ab,0===Qh&&j(ch)))),Rh[c]={nextPos:Lh,result:b},b)}function Ua(){var b,c=109*Lh+103,d=Rh[c];return d?(Lh=d.nextPos,d.result):(b=Ta(),b===ab&&(dh.test(a.charAt(Lh))?(b=a.charAt(Lh),Lh++):(b=ab,0===Qh&&j(eh))),Rh[c]={nextPos:Lh,result:b},b)}function Va(){var a,b,c=109*Lh+104,d=Rh[c];if(d)return Lh=d.nextPos,d.result;for(a=[],b=Xa();b!==ab;)a.push(b),b=Xa();return Rh[c]={nextPos:Lh,result:a},a}function Wa(){var a,b,c=109*Lh+105,d=Rh[c];if(d)return Lh=d.nextPos,d.result;if(a=[],b=Xa(),b!==ab)for(;b!==ab;)a.push(b),b=Xa();else a=ab;return Rh[c]={nextPos:Lh,result:a},a}function Xa(){var b,c=109*Lh+106,d=Rh[c];return d?(Lh=d.nextPos,d.result):(32===a.charCodeAt(Lh)?(b=fh,Lh++):(b=ab,0===Qh&&j(gh)),b===ab&&(9===a.charCodeAt(Lh)?(b=Kg,Lh++):(b=ab,0===Qh&&j(Lg)),b===ab&&(13===a.charCodeAt(Lh)?(b=Og,Lh++):(b=ab,0===Qh&&j(Pg)),b===ab&&(10===a.charCodeAt(Lh)?(b=Mg,Lh++):(b=ab,0===Qh&&j(Ng)),b===ab&&(b=Ma())))),Rh[c]={nextPos:Lh,result:b},b)}function Ya(){var b,c=109*Lh+107,d=Rh[c];return d?(Lh=d.nextPos,d.result):(a.substr(Lh,5)===hh?(b=hh,Lh+=5):(b=ab,0===Qh&&j(ih)),b===ab&&(a.substr(Lh,9)===de?(b=de,Lh+=9):(b=ab,0===Qh&&j(ee)),b===ab&&(a.substr(Lh,7)===jh?(b=jh,Lh+=7):(b=ab,0===Qh&&j(kh)),b===ab&&(a.substr(Lh,13)===lh?(b=lh,Lh+=13):(b=ab,0===Qh&&j(mh)),b===ab&&(a.substr(Lh,7)===nh?(b=nh,Lh+=7):(b=ab,0===Qh&&j(oh)),b===ab&&(a.substr(Lh,14)===ph?(b=ph,Lh+=14):(b=ab,0===Qh&&j(qh)),b===ab&&(a.substr(Lh,8)===af?(b=af,Lh+=8):(b=ab,0===Qh&&j(bf)),b===ab&&(a.substr(Lh,2)===Kb?(b=Kb,Lh+=2):(b=ab,0===Qh&&j(Lb)),b===ab&&(a.substr(Lh,4)===rh?(b=rh,Lh+=4):(b=ab,0===Qh&&j(sh)),b===ab&&(a.substr(Lh,3)===th?(b=th,Lh+=3):(b=ab,0===Qh&&j(uh)),b===ab&&(a.substr(Lh,14)===vh?(b=vh,Lh+=14):(b=ab,0===Qh&&j(wh)),b===ab&&(a.substr(Lh,4)===xh?(b=xh,Lh+=4):(b=ab,0===Qh&&j(yh)),b===ab&&(a.substr(Lh,22)===zh?(b=zh,Lh+=22):(b=ab,0===Qh&&j(Ah)),b===ab&&(a.substr(Lh,16)===Bh?(b=Bh,Lh+=16):(b=ab,0===Qh&&j(Ch)),b===ab&&(a.substr(Lh,14)===Dh?(b=Dh,Lh+=14):(b=ab,0===Qh&&j(Eh)),b===ab&&(a.substr(Lh,6)===Fh?(b=Fh,Lh+=6):(b=ab,0===Qh&&j(Gh)),b===ab&&(a.substr(Lh,4)===Hh?(b=Hh,Lh+=4):(b=ab,0===Qh&&j(Ih)),b===ab&&(a.substr(Lh,10)===Jh?(b=Jh,Lh+=10):(b=ab,0===Qh&&j(Kh))))))))))))))))))),Rh[c]={nextPos:Lh,result:b},b)}function Za(){var b,c,d=109*Lh+108,e=Rh[d];return e?(Lh=e.nextPos,e.result):(b=Lh,Qh++,40===a.charCodeAt(Lh)?(c=Mb,Lh++):(c=ab,0===Qh&&j(Nb)),c===ab&&(34===a.charCodeAt(Lh)?(c=mg,Lh++):(c=ab,0===Qh&&j(ng)),c===ab&&(39===a.charCodeAt(Lh)?(c=rg,Lh++):(c=ab,0===Qh&&j(sg)),c===ab&&(c=Xa()))),Qh--,c!==ab?(Lh=b,b=void 0):b=ab,Rh[d]={nextPos:Lh,result:b},b)}function $a(a,b){return b?a.concat(b):a}b=void 0!==b?b:{};var _a,ab={},bb={XPath:l},cb=l,db=function(a){return a},eb=\",\",fb=d(\",\",!1),gb=\"$\",hb=d(\"$\",!1),ib=\"{\",jb=d(\"{\",!1),kb=\"}\",lb=d(\"}\",!1),mb=function(a,b){return b},nb=function(a,b){return b.length?$a([\"sequence\",a],b):a},ob=\"return\",pb=d(\"return\",!1),qb=function(a,b){return 1===a.length?[\"let\"].concat(a[0],[b]):a.reduceRight(function(a,b){return[\"let\"].concat(b,[a])},b)},rb=\"let\",sb=d(\"let\",!1),tb=\", \",ub=d(\", \",!1),vb=function(a,b){return b},wb=function(a,b){return $a([a],b)},xb=\":=\",yb=d(\":=\",!1),zb=function(a,b){return[a,b]},Ab=\"some\",Bb=d(\"some\",!1),Cb=\"every\",Db=d(\"every\",!1),Eb=\"in\",Fb=d(\"in\",!1),Gb=function(a,b,c,d,e){return[d,e]},Hb=\"satisfies\",Ib=d(\"satisfies\",!1),Jb=function(a,b,c,d,e){return[\"quantified\",a,[[b,c]].concat(d),e]},Kb=\"if\",Lb=d(\"if\",!1),Mb=\"(\",Nb=d(\"(\",!1),Ob=\")\",Pb=d(\")\",!1),Qb=\"then\",Rb=d(\"then\",!1),Sb=\"else\",Tb=d(\"else\",!1),Ub=function(a,b,c){return[\"conditional\",a,b,c]},Vb=\"or\",Wb=d(\"or\",!1),Xb=function(a,b){return b.length?$a([\"or\",a],b):a},Yb=\"and\",Zb=d(\"and\",!1),$b=function(a,b){return b.length?$a([\"and\",a],b):a},_b=function(a,b,c){return[\"compare\",b,a,c]},ac=\"||\",bc=d(\"||\",!1),cc=function(a,b){if(!b.length)return a;var c=[a].concat(b);return $a([\"functionCall\",[\"namedFunctionRef\",\"concat\",c.length],c])},dc=\"to\",ec=d(\"to\",!1),fc=function(a,b){return b},gc=function(a,b){return null===b?a:[\"functionCall\",[\"namedFunctionRef\",\"op:to\",2],[a,b]]},hc=\"-\",ic=d(\"-\",!1),jc=\"+\",kc=d(\"+\",!1),lc=function(a,b,c){return[\"binaryOperator\",b,a,c]},mc=\"*\",nc=d(\"*\",!1),oc=\"div\",pc=d(\"div\",!1),qc=\"idiv\",rc=d(\"idiv\",!1),sc=\"mod\",tc=d(\"mod\",!1),uc=function(a,b){return b},vc=\"|\",wc=d(\"|\",!1),xc=\"union\",yc=d(\"union\",!1),zc=function(a,b){return $a([\"union\",a],b)},Ac=\"intersect\",Bc=d(\"intersect\",!1),Cc=\"except\",Dc=d(\"except\",!1),Ec=function(a,b,c){return[\"op:\"+b,c]},Fc=function(a,b){return null===b?a:[\"functionCall\",[\"namedFunctionRef\",b[0],2],[a,b[1]]]},Gc=\"instance\",Hc=d(\"instance\",!1),Ic=\"of\",Jc=d(\"of\",!1),Kc=function(a,b){return b?[\"instance of\",a,b]:a},Lc=\"castable\",Mc=d(\"castable\",!1),Nc=\"as\",Oc=d(\"as\",!1),Pc=function(a,b){return b?[\"castable as\",a,b]:a},Qc=\"cast\",Rc=d(\"cast\",!1),Sc=function(a,b){return b?[\"cast as\",a,b]:a},Tc=\"=>\",Uc=d(\"=>\",!1),Vc=function(a,b,c){return[b,c]},Wc=function(a,b){return b.length?b.reduce(function(a,b){var c=[a].concat(b[1]);return[\"functionCall\",[\"namedFunctionRef\",b[0],c.length],c]},a):a},Xc=function(a){return[\"unaryMinus\",a]},Yc=function(a){return[\"unaryPlus\",a]},Zc=\"=\",$c=d(\"=\",!1),_c=\"!=\",ad=d(\"!=\",!1),bd=\"<=\",cd=d(\"<=\",!1),dd=\"<\",ed=d(\"<\",!1),fd=\">=\",gd=d(\">=\",!1),hd=\">\",id=d(\">\",!1),jd=function(a){return[\"generalCompare\",a]},kd=\"eq\",ld=d(\"eq\",!1),md=\"ne\",nd=d(\"ne\",!1),od=\"lt\",pd=d(\"lt\",!1),qd=\"le\",rd=d(\"le\",!1),sd=\"gt\",td=d(\"gt\",!1),ud=\"ge\",vd=d(\"ge\",!1),wd=function(a){return[\"valueCompare\",a]},xd=\"is\",yd=d(\"is\",!1),zd=function(a){return a},Ad=\"<<\",Bd=d(\"<<\",!1),Cd=\">>\",Dd=d(\">>\",!1),Ed=function(a){return[\"nodeCompare\",a]},Fd=\"!\",Gd=d(\"!\",!1),Hd=function(a,b){return b},Id=function(a,b){return b.length?b.reduce(function(a,b){return[\"simpleMap\",a,b]},a):a},Jd=function(a,b,c){return[\"path\",a,[\"path\",b,c]]},Kd=\"/\",Ld=d(\"/\",!1),Md=function(a,b){return[\"path\",a,b]},Nd=function(a){return[\"absolutePath\",a]},Od=function(a,b){return[\"absolutePath\",[\"path\",a,b]]},Pd=\"//\",Qd=d(\"//\",!1),Rd=function(){return[\"descendant-or-self\",[\"kindTest\",\"node()\"]]},Sd=function(a,b,c){return c.length?c.reduce(function(a,b){return[\"filter\",a,b]},[a,b]):[a,b]},Td=\"::\",Ud=d(\"::\",!1),Vd=function(a){return a},Wd=\"@\",Xd=d(\"@\",!1),Yd=function(){return\"attribute\"},Zd=\"\",$d=function(){return\"child\"},_d=\"ancestor-or-self\",ae=d(\"ancestor-or-self\",!1),be=\"ancestor\",ce=d(\"ancestor\",!1),de=\"attribute\",ee=d(\"attribute\",!1),fe=\"child\",ge=d(\"child\",!1),he=\"decendant\",ie=d(\"decendant\",!1),je=\"following-sibling\",ke=d(\"following-sibling\",!1),le=\"descendant-or-self\",me=d(\"descendant-or-self\",!1),ne=\"descendant\",oe=d(\"descendant\",!1),pe=\"following\",qe=d(\"following\",!1),re=\"parent\",se=d(\"parent\",!1),te=\"preceding-sibling\",ue=d(\"preceding-sibling\",!1),ve=\"self\",we=d(\"self\",!1),xe=\"..\",ye=d(\"..\",!1),ze=function(){return[\"parent\",[\"kindTest\",\"node()\"]]},Ae=function(a){return[\"nameTest\",a]},Be=function(a,b){return[\"filter\",b]},Ce=function(a,b){return[\"functionCall\",b]},De=function(a,b){return[\"lookup\",b]},Ee=function(a,b){return b.length?b.reduce(function(a,b){return b.splice(1,0,a),b},a):a},Fe=function(a,b){return b},Ge=function(a){return a||[]},He=\"[\",Ie=d(\"[\",!1),Je=\"]\",Ke=d(\"]\",!1),Le=function(a){return a},Me=\"?\",Ne=d(\"?\",!1),Oe=function(a){return a},Pe=/^[a-zA-Z]/,Qe=e([[\"a\",\"z\"],[\"A\",\"Z\"]],!1,!1),Re=function(a){return a},Se=function(a){return[\"varRef\",a]},Te=function(){return[\"sequence\"]},Ue=\".\",Ve=d(\".\",!1),We=function(){return[\"self\",[\"kindTest\",\"item()\"]]},Xe=function(a,b){return[\"functionCall\",[\"namedFunctionRef\",a,b.length],b]},Ye=function(){return\"argumentPlaceholder\"},Ze=\"#\",$e=d(\"#\",!1),_e=function(a,b){return[\"namedFunctionRef\",a,b[1]]},af=\"function\",bf=d(\"function\",!1),cf=function(a,b){return[\"type\",a,!!b]},df=(d(\" as \",!1),\"empty-sequence()\"),ef=d(\"empty-sequence()\",!1),ff=function(a,b){return[a,b]},gf=\"item()\",hf=d(\"item()\",!1),jf=function(a){return[\"typeTest\",a]},kf=function(){return\"unsupported\"},lf=function(a){return[\"deprecationWarning\",a]},mf=\"node()\",nf=d(\"node()\",!1),of=function(){return[\"kindTest\",\"node()\"]},pf=\"document-node(\",qf=d(\"document-node(\",!1),rf=function(a){return[\"kindTest\",\"document-node()\",a]},sf=\"document-node()\",tf=d(\"document-node()\",!1),uf=function(){return[\"kindTest\",\"document-node()\"]},vf=\"text()\",wf=d(\"text()\",!1),xf=function(){return[\"kindTest\",\"text()\"]},yf=\"comment()\",zf=d(\"comment()\",!1),Af=function(){return[\"kindTest\",\"comment()\"]},Bf=\"namespace-node()\",Cf=d(\"namespace-node()\",!1),Df=function(){return[\"kindTest\",\"namespace-node()\"]},Ef=\"processing-instruction(\",Ff=d(\"processing-instruction(\",!1),Gf=function(a){return[\"kindTest\",\"processing-instruction()\",a]},Hf=function(a){return[\"kindTest\",\"processing-instruction()\",a[1]]},If=\"processing-instruction()\",Jf=d(\"processing-instruction()\",!1),Kf=function(){return[\"kindTest\",\"processing-instruction()\"]},Lf=\"attribute(\",Mf=d(\"attribute(\",!1),Nf=function(a,b){return[\"kindTest\",\"attribute()\",a,b]},Of=function(a){return[\"kindTest\",\"attribute()\",a]},Pf=\"attribute()\",Qf=d(\"attribute()\",!1),Rf=function(){return[\"kindTest\",\"attribute()\"]},Sf=\"schema-attribute(\",Tf=d(\"schema-attribute(\",!1),Uf=function(a){return[\"kindTest\",\"schema-attribute()\",a]},Vf=\"element(\",Wf=d(\"element(\",!1),Xf=function(a,b){return[\"kindTest\",\"element()\",a,b]},Yf=function(a){return[\"kindTest\",\"element()\",a]},Zf=\"element()\",$f=d(\"element()\",!1),_f=function(){return[\"kindTest\",\"element()\"]},ag=\"schema-element(\",bg=d(\"schema-element(\",!1),cg=(d(\"function (*)\",!1),d(\"map(*)\",!1),d(\"map(\",!1),d(\"array(*)\",!1),d(\"array(\",!1),function(a){return[\"literal\",a,\"xs:integer\"]}),dg=function(a){return[\"literal\",parseFloat(\".\"+a,10),\"xs:decimal\"]},eg=function(a){return[\"literal\",parseFloat(a,10),\"xs:decimal\"]},fg=/^[0-9]/,gg=e([[\"0\",\"9\"]],!1,!1),hg=/^[eE]/,ig=e([\"e\",\"E\"],!1,!1),jg=/^[+\\-]/,kg=e([\"+\",\"-\"],!1,!1),lg=function(a){return[\"literal\",parseFloat(a,10),\"xs:double\"]},mg='\"',ng=d('\"',!1),og=/^[^\"]/,pg=e(['\"'],!0,!1),qg=function(a){return[\"literal\",a.join(\"\"),\"xs:string\"]},rg=\"'\",sg=d(\"'\",!1),tg=/^[^']/,ug=e([\"'\"],!0,!1),vg=\"Q\",wg=d(\"Q\",!1),xg=/^[^{}]/,yg=e([\"{\",\"}\"],!0,!1),zg='\"\"',Ag=d('\"\"',!1),Bg=function(){return'\"'},Cg=\"''\",Dg=d(\"''\",!1),Eg=function(){return\"'\"},Fg=\"(:\",Gg=d(\"(:\",!1),Hg=\":)\",Ig=d(\":)\",!1),Jg=function(a,b){return a+b.join(\"\")},Kg=\"\t\",Lg=d(\"\t\",!1),Mg=\"\\n\",Ng=d(\"\\n\",!1),Og=\"\\r\",Pg=d(\"\\r\",!1),Qg=/^[ -\\uD7FF]/,Rg=e([[\" \",\"퟿\"]],!1,!1),Sg=/^[\\uE000-\\uFFFD]/,Tg=e([[\"\",\"�\"]],!1,!1),Ug=/^[\\u10000-\\u10FFFF]/,Vg=e([\"က\",[\"0\",\"ჿ\"],\"F\",\"F\"],!1,!1),Wg=function(a){return parseInt(a.join(\"\"),10)},Xg=\":\",Yg=d(\":\",!1),Zg=/^[A-Z]/,$g=e([[\"A\",\"Z\"]],!1,!1),_g=\"_\",ah=d(\"_\",!1),bh=/^[a-z]/,ch=e([[\"a\",\"z\"]],!1,!1),dh=/^[\\-.0-9]/,eh=e([\"-\",\".\",[\"0\",\"9\"]],!1,!1),fh=\" \",gh=d(\" \",!1),hh=\"array\",ih=d(\"array\",!1),jh=\"comment\",kh=d(\"comment\",!1),lh=\"document-node\",mh=d(\"document-node\",!1),nh=\"element\",oh=d(\"element\",!1),ph=\"empty-sequence\",qh=d(\"empty-sequence\",!1),rh=\"item\",sh=d(\"item\",!1),th=\"map\",uh=d(\"map\",!1),vh=\"namespace-node\",wh=d(\"namespace-node\",!1),xh=\"node\",yh=d(\"node\",!1),zh=\"processing-instruction\",Ah=d(\"processing-instruction\",!1),Bh=\"schema-attribute\",Ch=d(\"schema-attribute\",!1),Dh=\"schema-element\",Eh=d(\"schema-element\",!1),Fh=\"switch\",Gh=d(\"switch\",!1),Hh=\"text\",Ih=d(\"text\",!1),Jh=\"typeswitch\",Kh=d(\"typeswitch\",!1),Lh=0,Mh=0,Nh=[{line:1,column:1}],Oh=0,Ph=[],Qh=0,Rh={};if(\"startRule\"in b){if(!(b.startRule in bb))throw new Error(\"Can't start parsing from rule \\\"\"+b.startRule+'\".');cb=bb[b.startRule]}if(_a=cb(),_a!==ab&&Lh===a.length)return _a;throw _a!==ab&&Lh<a.length&&j(f()),k(Ph,Oh<a.length?a.charAt(Oh):null,Oh<a.length?i(Oh,Oh+1):i(Oh,Oh))}b(c,Error),c.buildMessage=function(a,b){function c(a){return a.charCodeAt(0).toString(16).toUpperCase()}function d(a){return a.replace(/\\\\/g,\"\\\\\\\\\").replace(/\"/g,'\\\\\"').replace(/\\0/g,\"\\\\0\").replace(/\\t/g,\"\\\\t\").replace(/\\n/g,\"\\\\n\").replace(/\\r/g,\"\\\\r\").replace(/[\\x00-\\x0F]/g,function(a){return\"\\\\x0\"+c(a)}).replace(/[\\x10-\\x1F\\x7F-\\x9F]/g,function(a){return\"\\\\x\"+c(a)})}function e(a){return a.replace(/\\\\/g,\"\\\\\\\\\").replace(/\\]/g,\"\\\\]\").replace(/\\^/g,\"\\\\^\").replace(/-/g,\"\\\\-\").replace(/\\0/g,\"\\\\0\").replace(/\\t/g,\"\\\\t\").replace(/\\n/g,\"\\\\n\").replace(/\\r/g,\"\\\\r\").replace(/[\\x00-\\x0F]/g,function(a){return\"\\\\x0\"+c(a)}).replace(/[\\x10-\\x1F\\x7F-\\x9F]/g,function(a){return\"\\\\x\"+c(a)})}function f(a){return i[a.type](a)}function g(a){var b,c,d=new Array(a.length);for(b=0;b<a.length;b++)d[b]=f(a[b]);if(d.sort(),d.length>0){for(b=1,c=1;b<d.length;b++)d[b-1]!==d[b]&&(d[c]=d[b],c++);d.length=c}switch(d.length){case 1:return d[0];case 2:return d[0]+\" or \"+d[1];default:return d.slice(0,-1).join(\", \")+\", or \"+d[d.length-1]}}function h(a){return a?'\"'+d(a)+'\"':\"end of input\"}var i={literal:function(a){return'\"'+d(a.text)+'\"'},\"class\":function(a){var b,c=\"\";for(b=0;b<a.parts.length;b++)c+=a.parts[b]instanceof Array?e(a.parts[b][0])+\"-\"+e(a.parts[b][1]):e(a.parts[b]);return\"[\"+(a.inverted?\"^\":\"\")+c+\"]\"},any:function(a){return\"any character\"},end:function(a){return\"end of input\"},other:function(a){return a.description}};return\"Expected \"+g(a)+\" but \"+h(b)+\" found.\"},a.xPathParser={SyntaxError:c,parse:d}}(this);\n"

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(22),
		__webpack_require__(41),
		__webpack_require__(24),
		__webpack_require__(25),
		__webpack_require__(26),
		__webpack_require__(27),
		__webpack_require__(28),
		__webpack_require__(29),
		__webpack_require__(30),
		__webpack_require__(31),
		__webpack_require__(32),
		__webpack_require__(33),
		__webpack_require__(35),
		__webpack_require__(36),
		__webpack_require__(37),

		__webpack_require__(38),
		__webpack_require__(8),
		__webpack_require__(42),
		__webpack_require__(43),
		__webpack_require__(44),
		__webpack_require__(45),
		__webpack_require__(46),
		__webpack_require__(47),
		__webpack_require__(50),
		__webpack_require__(53),
		__webpack_require__(57),
		__webpack_require__(58),
		__webpack_require__(59),

		__webpack_require__(60),
		__webpack_require__(61),
		__webpack_require__(62),
		__webpack_require__(69)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		PathSelector,
		AbsolutePathSelector,
		Filter,
		AttributeAxis,
		AncestorAxis,
		ChildAxis,
		DescendantAxis,
		FollowingSiblingAxis,
		ParentAxis,
		PrecedingSiblingAxis,
		SelfSelector,
		NodeNameSelector,
		NodeTypeSelector,
		ProcessingInstructionTargetSelector,
		TypeTest,

		FunctionCall,
		AndOperator,
		OrOperator,
		UniversalSelector,
		Union,
		SequenceOperator,
		SimpleMapOperator,
		Unary,
		BinaryNumericOperator,
		Compare,
		InstanceOfOperator,
		QuantifiedExpression,
		IfExpression,

		Literal,
		LetExpression,
		NamedFunctionRef,
		VarRef
	) {
		'use strict';

		var hasDeprecationWarnings = false;

		// Basic and incomplete implementation of single steps as defined in XPATH 1.0 (http://www.w3.org/TR/xpath/)
		// Only single steps are allowed, because that's what selectors offer. Anyway: all paths have synonyms as (nested) predicates.
		// Missing:
		//  * various functions, such as:
		//    * last()
		//    * first()
		//    * position()
		//    * name()
		//  * operators, such as >, <, *, +, | and =, unless in the context of attributes
		//  * variables
		function compile (ast) {
			var args = ast.slice(1);
			switch (ast[0]) {
				// Operators
				case 'and':
					return and(args);
				case 'or':
					return or(args);
				case 'compare':
					return compare(args);
				case 'unaryPlus':
					return unaryPlus(args);
				case 'unaryMinus':
					return unaryMinus(args);
				case 'binaryOperator':
					return binaryOperator(args);
				case 'sequence':
					return sequence(args);
				case 'union':
					return union(args);

				// Tests
				case 'nameTest':
					return nameTest(args);
				case 'kindTest':
					return kindTest(args);
				case 'typeTest':
					return typeTest(args);

				// Axes
				case 'ancestor':
					return ancestor(args);
				case 'ancestor-or-self':
					return ancestorOrSelf(args);
				case 'attribute':
					return attribute(args);
				case 'child':
					return child(args);
				case 'descendant':
					return descendant(args);
				case 'descendant-or-self':
					return descendantOrSelf(args);
				case 'parent':
					return parent(args);
				case 'following-sibling':
					return followingSibling(args);
				case 'preceding-sibling':
					return precedingSibling(args);
				case 'self':
					return self(args);

				// Path
				case 'absolutePath':
					return absolutePath(args);
				case 'path':
					return path(args);

				// Postfix operators
				case 'filter':
					return filter(args);

				// Functions
				case 'functionCall':
					return functionCall(args);

				case 'literal':
					return literal(args);

				// Variables
				case 'let':
					return letExpression(args);
				case 'varRef':
					return varRef(args);
				case 'namedFunctionRef':
					return namedFunctionRef(args);

				// Quantified
				case 'quantified':
					return quantified(args);

				// Conditional
				case 'conditional':
					return conditional(args);

				case 'instance of':
					return instanceOf(args);

				case 'simpleMap':
					return simpleMap(args);

				case 'deprecationWarning':
					hasDeprecationWarnings = true;
					return compile(args[0]);

				default:
					throw new Error('No selector counterpart for: ' + ast[0] + '.');
			}
		}

		function absolutePath (args) {
			return new AbsolutePathSelector(compile(args[0]));
		}

		function ancestor (args) {
			return new AncestorAxis(compile(args[0]));
		}

		function ancestorOrSelf (args) {
			var subSelector = compile(args[0]);
			return new AncestorAxis(subSelector, {inclusive: true});
		}

		function and (args) {
			return new AndOperator(args.map(compile));
		}

		function attribute (args) {
			return new AttributeAxis(compile(args[0]));
		}

		function binaryOperator (args) {
			var kind = args[0];
			var a = compile(args[1]);
			var b = compile(args[2]);

			return new BinaryNumericOperator(kind, a, b);
		}

		function child (args) {
			return new ChildAxis(compile(args[0]));
		}

		function descendant (args) {
			return new DescendantAxis(compile(args[0]));
		}

		function descendantOrSelf (args) {
			var subSelector = compile(args[0]);
			return new DescendantAxis(subSelector, {inclusive: true});
		}

		// Binary compare (=, !=, le, is, etc)
		function compare (args) {
			return new Compare(args[0], compile(args[1]), compile(args[2]));
		}

		function conditional (args) {
			return new IfExpression(compile(args[0]), compile(args[1]), compile(args[2]));
		}

		function filter (args) {
			return new Filter(compile(args[0]), compile(args[1]));
		}

		function followingSibling (args) {
			return new FollowingSiblingAxis(compile(args[0]));
		}

		function functionCall (args) {
			return new FunctionCall(compile(args[0]), args[1].map(compile));
		}

		function instanceOf (args) {
			var expression = compile(args[0]);
			var sequenceType = args[1];

			return new InstanceOfOperator(expression, compile(sequenceType[0]), sequenceType[1] || '');
		}

		function letExpression (args) {
			var rangeVariable = args[0];
			var bindingSequence = compile(args[1]);
			var returnExpression = compile(args[2]);

			return new LetExpression(rangeVariable, bindingSequence, returnExpression);
		}

		function literal (args) {
			return new Literal(args[0], args[1]);
		}

		function namedFunctionRef (args) {
			var functionName = args.shift();
			// Note: due to deprecation, we need to switcharoo fonto- to fonto:
			functionName = functionName.replace('fonto-', 'fonto:');
			return new NamedFunctionRef(functionName, args[0]);
		}

		function nameTest (args) {
			var nodeName = args[0];
			return new NodeNameSelector(nodeName);
		}

		function kindTest (args) {
			switch (args[0]) {
				case 'item()':
					return new UniversalSelector();
				case 'node()':
					return new UniversalSelector();
				case 'element()':
					if (args.length == 2) {
						return new NodeNameSelector(args[1]);
					}

					if (args.length > 2) {
						throw new Error('element() with more than 1 argument is not supported.');
					}

					return new NodeTypeSelector(1);
				case 'text()':
					return new NodeTypeSelector(3);
				case 'processing-instruction()':
					if (args.length > 1) {
						return new ProcessingInstructionTargetSelector(args[1]);
					}
					return new NodeTypeSelector(7);
				case 'comment()':
					return new NodeTypeSelector(8);
				case 'document-node()':
					return new NodeTypeSelector(9);

				default:
					throw new Error('Unrecognized nodeType: ' + args[0]);
			}
		}

		function or (args) {
			return new OrOperator(args.map(compile));
		}

		function parent (args) {
			return new ParentAxis(compile(args[0]));
		}

		function path (args) {
			return new PathSelector(args.map(compile));
		}

		function precedingSibling (args) {
			return new PrecedingSiblingAxis(compile(args[0]));
		}

		function quantified (args) {
			var inClauses = args[1].map(function (inClause) {
				return [inClause[0], compile(inClause[1])];
			});
			return new QuantifiedExpression(args[0], inClauses, compile(args[2]));
		}

		function self (args) {
			return new SelfSelector(compile(args[0]));
		}

		function sequence (args) {
			return new SequenceOperator(args.map(compile));
		}

		function simpleMap (args) {
			return new SimpleMapOperator(compile(args[0]), compile(args[1]));
		}

		function typeTest (args) {
			return new TypeTest(args[0]);
		}

		function unaryPlus (args) {
			return new Unary('+', compile(args[0]));
		}

		function unaryMinus (args) {
			return new Unary('-', compile(args[0]));
		}

		function union (args) {
			return new Union(args.map(compile));
		}

		function varRef (args) {
			return new VarRef(args[0]);
		}

		return function parseSelector (xPathAst) {
			var result = {
					result: compile(xPathAst),
					hasDeprecationWarnings: hasDeprecationWarnings
				};
			hasDeprecationWarnings = false;

			return result;
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(9),
		__webpack_require__(10),
		__webpack_require__(11),
		__webpack_require__(18),
		__webpack_require__(19)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		isSameSetOfSelectors,
		Specificity,
		Sequence,
		BooleanValue,
		Selector
	) {
		'use strict';

		/**
		 * The 'and' combining selector
		 * @param  {Selector[]}  selectors
		 */
		function AndOperator (selectors) {
			Selector.call(
				this,
				selectors.reduce(function (specificity, selector) {
					return specificity.add(selector.specificity);
				}, new Specificity({})),
				Selector.RESULT_ORDER_SORTED);
			this._subSelectors = selectors;
		}

		AndOperator.prototype = Object.create(Selector.prototype);
		AndOperator.prototype.constructor = AndOperator;

		AndOperator.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof AndOperator &&
				isSameSetOfSelectors(this._subSelectors, otherSelector._subSelectors);
		};

		AndOperator.prototype.evaluate = function (dynamicContext) {
			var result = this._subSelectors.every(function (subSelector) {
					return subSelector.evaluate(dynamicContext).getEffectiveBooleanValue();
				});

			return Sequence.singleton(result ? BooleanValue.TRUE : BooleanValue.FALSE);
		};

		AndOperator.prototype.getBucket = function () {
			// Any bucket of our subselectors should do, and is preferable to no bucket
			for (var i = 0, l = this._subSelectors.length; i < l; ++i) {
				var bucket = this._subSelectors[i].getBucket();
				if (bucket) {
					return bucket;
				}
			}
			return null;
		};

		return AndOperator;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
	) {
		'use strict';

		return function isSameSetOfSelectors (selectors1, selectors2) {
			if (selectors1.length !== selectors2.length) {
				return false;
			}

			// Compare arrays of selectors, allowing of variance in ordering only
			var matchedSelectors = new Array(selectors1.length).fill(false);
			return selectors1.every(function (selector1) {
				// See if there is an unmatched value present in the other array
				return selectors2.find(function (selector2, i) {
					if (matchedSelectors[i]) {
						// Already matched
						return false;
					}
					if (selector1.equals(selector2)) {
						// Mark as matched
						matchedSelectors[i] = true;
						return true;
					}
					return false;
				});
			});
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
	) {
		'use strict';

		var SPECIFICITY_DIMENSIONS = [
				'external',
				'attribute',
				'nodeName',
				'nodeType',
				'universal'
			],
			NUMBER_OF_SPECIFICITY_DIMENSIONS = SPECIFICITY_DIMENSIONS.length;

		/**
		 * @param  {Object}  countsByKind  simple selector counts indexed by specificity dimension
		 */
		function Specificity (countsByKind) {
			this._counts = SPECIFICITY_DIMENSIONS.map(function (specificityKind) {
				return countsByKind[specificityKind] || 0;
			});
		}

		/**
		 * @param  {Specificity}  otherSpecificity
		 *
		 * @return {Specificity}  new specificity with the combined counts
		 */
		Specificity.prototype.add = function (otherSpecificity) {
			return new Specificity(SPECIFICITY_DIMENSIONS.reduce(function (countsByKind, specificityKind, index) {
				countsByKind[specificityKind] = this._counts[index] + otherSpecificity._counts[index];
				return countsByKind;
			}.bind(this), Object.create(null)));
		};

		/**
		 * @param  {Specificity}  otherSpecificity
		 *
		 * @return  {Number}  -1 if specificity is less than otherSpecificity, 1 if it is greater, 0 if equal
		 */
		Specificity.prototype.compareTo = function (otherSpecificity) {
			for (var i = 0; i < NUMBER_OF_SPECIFICITY_DIMENSIONS; ++i) {
				if (otherSpecificity._counts[i] < this._counts[i]) {
					return 1;
				}
				if (otherSpecificity._counts[i] > this._counts[i]) {
					return -1;
				}
			}
			return 0;
		};

		return Specificity;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(12),
		__webpack_require__(13)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Item,
		NodeValue
	) {
		'use strict';

		function Sequence (initialValues) {
			Item.call(this, initialValues || []);
		}

		Sequence.prototype = Object.create(Item.prototype);

		Sequence.singleton = function (value) {
			return new Sequence([value]);
		};

		Sequence.empty = function () {
			return new Sequence([]);
		};

		Sequence.prototype.atomize = function () {
			return new Sequence(this.value.map(function (value) {
				return value.atomize();
			}));
		};

		Sequence.prototype.isEmpty = function () {
			return this.value.length === 0;
		};

		Sequence.prototype.isSingleton = function () {
			return this.value.length === 1;
		};

		Sequence.prototype.getEffectiveBooleanValue = function () {
			if (this.isEmpty()) {
				return false;
			}

			if (this.value[0] instanceof NodeValue) {
				return true;
			}

			if (this.isSingleton()) {
				return this.value[0].getEffectiveBooleanValue();
			}

			throw new Error('FORG0006: A wrong argument type was specified in a function call.');
		};

		Sequence.prototype.merge = function (otherSequence) {
			this.value = this.value.concat(otherSequence.value);
			return this;
		};

		return Sequence;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
	) {
		'use strict';

		function Item (value) {
			this.value = value;
		}

		Item.prototype.atomize = function () {};

		Item.prototype.getEffectiveBooleanValue = function () {
			throw new Error('Not implemented');
		};

		Item.prototype.instanceOfType = function (simpleTypeName) {
			return simpleTypeName === 'item()';
		};

		return Item;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(14),
		__webpack_require__(16),
		__webpack_require__(12)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		StringValue,
		AttributeNode,
		Item
	) {
		'use strict';

		// This should work for maximal reuse of instances:
		// NodeValue has a strong ref to a Node, but when it's only referenced by this weakmap, it should be eligible for GC
		// When it is collected, the Node may be collected too
		var nodeValueByNode = new WeakMap();

		function NodeValue (domFacade, node) {
			if (nodeValueByNode.has(node)) {
				return nodeValueByNode.get(node);
			}
			nodeValueByNode.set(node, this);

			Item.call(this, node);

			this._domFacade = domFacade;
			this.nodeType = node.nodeType;
			switch (node.nodeType) {
				case this.value.ATTRIBUTE_NODE:
					this.nodeName = this.value.nodeName;
					break;
				case this.value.ELEMENT_NODE:
					// element
					this.nodeName = this.value.nodeName;
					break;
				case this.value.PROCESSING_INSTRUCTION_NODE:
					// A processing instruction's target is its nodename (https://www.w3.org/TR/xpath-functions-31/#func-node-name)
					this.nodeName = this.value.target;
					break;
				default:
					// All other nodes have no name
					this.nodeName = null;
			}
			this.target = node.target;
			return this;
		}

		NodeValue.prototype = Object.create(Item.prototype);

		NodeValue.prototype.instanceOfType = function (simpleTypeName) {
			switch(simpleTypeName) {
				case 'node()':
					return true;
				case 'attribute()':
					return this.value.nodeType === this.value.ATTRIBUTE_NODE;
				case 'element()':
					return this.value.nodeType === this.value.ELEMENT_NODE;
				case 'text()':
					return this.value.nodeType === this.value.TEXT_NODE;
				case 'processing-instruction()':
					return this.value.nodeType === this.value.PROCESSING_INSTRUCTION_NODE;
				case 'comment()':
					return this.value.nodeType === this.value.COMMENT_NODE;
				case 'document()':
					return this.value.nodeType === this.value.DOCUMENT_NODE;

				default:
					return Item.prototype.instanceOfType.call(this, simpleTypeName);
			}
		};

		NodeValue.prototype.atomize = function () {
			// TODO: Mix in types, by default get string value
			if (this.value instanceof AttributeNode) {
				return this.value.atomize();
			}

			if (this.instanceOfType('text()')) {
				return new StringValue(this._domFacade.getData(this.value));
			}
			var domFacade = this._domFacade;
			var allTextNodes = (function getTextNodes (node) {
					if (node.nodeType === node.TEXT_NODE) {
						return [node];
					}
					return domFacade.getChildNodes(node)
						.reduce(function (textNodes, childNode) {
							Array.prototype.push.apply(textNodes, getTextNodes(childNode));
							return textNodes;
						}, []);
				})(this.value);

			return new StringValue(allTextNodes.map(function (textNode) {
					return this._domFacade.getData(textNode);
			}.bind(this)).join(''));
		};

		NodeValue.prototype.getStringValue = function () {
			if (this.value instanceof AttributeNode) {
				return this.value.getStringValue();
			}

			return this.atomize();
		};

		return NodeValue;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(15)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		AnyAtomicTypeValue
	) {
		'use strict';

		function StringValue (value) {
			AnyAtomicTypeValue.call(this, value);
		}

		StringValue.prototype = Object.create(AnyAtomicTypeValue.prototype);
		StringValue.prototype.constructor = StringValue;

		StringValue.cast = function (value) {
			return new StringValue(AnyAtomicTypeValue.cast(value).value);
		};

		StringValue.prototype.getEffectiveBooleanValue = function () {
			return this.value.length > 0;
		};

		StringValue.primitiveTypeName = StringValue.prototype.primitiveTypeName = 'xs:string';

		StringValue.prototype.instanceOfType = function (simpleTypeName) {
			return simpleTypeName === this.primitiveTypeName ||
				AnyAtomicTypeValue.prototype.instanceOfType.call(this, simpleTypeName);
		};

		return StringValue;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(12)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Item
	) {
		'use strict';

		function AnyAtomicTypeValue (value) {
			Item.call(this, value);
		}

		AnyAtomicTypeValue.prototype = Object.create(Item.prototype);
		AnyAtomicTypeValue.prototype.constructor = AnyAtomicTypeValue;

		AnyAtomicTypeValue.cast = function (value) {
			return new AnyAtomicTypeValue(value.value + '');
		};

		AnyAtomicTypeValue.prototype.atomize = function () {
			return this;
		};

		AnyAtomicTypeValue.primitiveTypeName = AnyAtomicTypeValue.prototype.primitiveTypeName = 'xs:anyAtomicType';

		AnyAtomicTypeValue.prototype.instanceOfType = function (simpleTypeName) {
			return simpleTypeName === 'xs:anyAtomicType' ||
				Item.prototype.instanceOfType.call(this, simpleTypeName);
		};

		return AnyAtomicTypeValue;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(17),
		__webpack_require__(14)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
	 	UntypedAtomicValue,
		StringValue
	) {
		'use strict';

		function AttributeNode (element, attributeName, attributeValue) {
			this.value = attributeValue;
			this.nodeName = attributeName;
			this._element = element;

			this.nodeType = this.ATTRIBUTE_NODE;
		}

		AttributeNode.prototype.ELEMENT_NODE = AttributeNode.ELEMENT_NODE = 1;
		AttributeNode.prototype.ATTRIBUTE_NODE = AttributeNode.ATTRIBUTE_NODE = 2;
		AttributeNode.prototype.TEXT_NODE = AttributeNode.TEXT_NODE = 3;
		AttributeNode.prototype.CDATA_SECTION_NODE = AttributeNode.CDATA_SECTION_NODE = 4;
		AttributeNode.prototype.ENTITY_REFERENCE_NODE = AttributeNode.ENTITY_REFERENCE_NODE = 5;
		AttributeNode.prototype.ENTITY_NODE = AttributeNode.ENTITY_NODE = 6;
		AttributeNode.prototype.PROCESSING_INSTRUCTION_NODE = AttributeNode.PROCESSING_INSTRUCTION_NODE = 7;
		AttributeNode.prototype.COMMENT_NODE = AttributeNode.COMMENT_NODE = 8;
		AttributeNode.prototype.DOCUMENT_NODE = AttributeNode.DOCUMENT_NODE = 9;
		AttributeNode.prototype.DOCUMENT_TYPE_NODE = AttributeNode.DOCUMENT_TYPE_NODE = 10;
		AttributeNode.prototype.DOCUMENT_FRAGMENT_NODE = AttributeNode.DOCUMENT_FRAGMENT_NODE = 11;
		AttributeNode.prototype.NOTATION_NODE = AttributeNode.NOTATION_NODE = 12;

		AttributeNode.prototype.getParentNode = function () {
			return this._element;
		};

		AttributeNode.prototype.atomize = function () {
			// TODO: Mix in types
			return new UntypedAtomicValue(this.value);
		};

		AttributeNode.prototype.getStringValue = function () {
			return new StringValue(this.value);
		};

		return AttributeNode;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(15)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		AnyAtomicTypeValue
	) {
		'use strict';

		function UntypedAtomicValue (value) {
			AnyAtomicTypeValue.call(this, value);
		}

		UntypedAtomicValue.prototype = Object.create(AnyAtomicTypeValue.prototype);
		UntypedAtomicValue.prototype.constructor = UntypedAtomicValue;

		UntypedAtomicValue.cast = function (value) {
			throw new Error('Not implemented');
		};

		UntypedAtomicValue.prototype.getEffectiveBooleanValue = function () {
			return this.value.length > 0;
		};

		UntypedAtomicValue.primitiveTypeName = UntypedAtomicValue.prototype.primitiveTypeName = 'xs:untypedAtomic';

		UntypedAtomicValue.prototype.instanceOfType = function (simpleTypeName) {
			return simpleTypeName === 'xs:untypedAtomic' ||
				AnyAtomicTypeValue.prototype.instanceOfType.call(this, simpleTypeName);
		};

		return UntypedAtomicValue;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(15)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		AnyAtomicTypeValue
	) {
		'use strict';

		function BooleanValue (initialValue) {
			AnyAtomicTypeValue.call(this, initialValue);
		}

		BooleanValue.prototype = Object.create(AnyAtomicTypeValue.prototype);
		BooleanValue.prototype.constructor = BooleanValue;

		BooleanValue.TRUE = BooleanValue.prototype.TRUE = new BooleanValue(true);
		BooleanValue.FALSE = BooleanValue.prototype.FALSE = new BooleanValue(false);

		BooleanValue.cast = function (value) {
			if (value instanceof BooleanValue) {
				return new BooleanValue(value.value);
			}

			var anyAtomicTypeValue = AnyAtomicTypeValue.cast(value);

			switch (anyAtomicTypeValue.value) {
				case 'true':
				case '1':
					return BooleanValue.TRUE;
				case 'false':
				case '0':
					return BooleanValue.FALSE;

				default:
					throw new Error('XPTY0004: can not cast ' + value + ' to xs:boolean');
			}
		};

		BooleanValue.prototype.getEffectiveBooleanValue = function () {
			return this.value;
		};

		BooleanValue.primitiveTypeName = BooleanValue.prototype.primitiveTypeName = 'xs:boolean';

		BooleanValue.prototype.instanceOfType = function (simpleTypeName) {
			return simpleTypeName === this.primitiveTypeName ||
				AnyAtomicTypeValue.prototype.instanceOfType.call(this, simpleTypeName);
		};

		return BooleanValue;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(20),
		__webpack_require__(21),
		__webpack_require__(11),
		__webpack_require__(13)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		DomFacade,
		DynamicContext,
		Sequence,
		NodeValue
	) {
		'use strict';

		/**
		 * @param  {Specificity}  specificity
		 * @param  {string}       expectedResultOrder  Describe what the expected sorting order is, will be used to shortcut sorting at various places.
		 *                                               Either 'sorted', 'reverse-sorted' or 'unsorted'. Sorted sequences are expected to be deduplicated.
		 */
		function Selector (specificity, expectedResultOrder) {
			/**
			 * @type  {Specificity}
			 */
			this.specificity = specificity;

			this.expectedResultOrder = expectedResultOrder;
		}

		Selector.RESULT_ORDER_SORTED = Selector.prototype.RESULT_ORDER_SORTED = 'sorted';
		Selector.RESULT_ORDER_REVERSE_SORTED = Selector.prototype.RESULT_ORDER_REVERSE_SORTED = 'reverse-sorted';
		Selector.RESULT_ORDER_UNSORTED = Selector.prototype.RESULT_ORDER_UNSORTED = 'unsorted';

		/**
		 * @deprecated
		 */
		Selector.prototype.matches = function (node, blueprint) {
			var result = this.evaluate(new DynamicContext({
					contextItem: Sequence.singleton(new NodeValue(blueprint, node)),
					contextSequence: null,
					domFacade: new DomFacade(blueprint),
					variables: {}
				}));

			return result.getEffectiveBooleanValue();
		};

		/**
		 * Compare this selector to the other selector, checking equivalence
		 *
		 * @param   {Selector}  selector
		 * @return  {boolean}   Whether this selector is equivalent to the other
		 */
		Selector.prototype.equals = function (otherSelector) {
			throw new Error('Not Implemented');
		};

		/**
		 * Retrieve the bucket name, if any, in which this selector can be presorted.
		 *
		 * Buckets can be used for quickly filtering a set of selectors to only those potentially applicable to a givne
		 * node. Use getBucketsForNode to determine the buckets to consider for a given node.
		 *
		 * @return  {String|null}  Bucket name, or null if the selector is not bucketable.
		 */
		Selector.prototype.getBucket = function () {
			return null;
		};

		Selector.prototype.evaluate = function (dynamicContext) {
			throw new Error('Not Implemented');
		};

		return Selector;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
	) {
		'use strict';

		/**
		 * Facade for dom interface things, compatible with blueprintQuery. Pass a readonlyBlueprint to use the live DOM
		 */
		function DomFacade (blueprint) {
			this._blueprint = blueprint;

			this._createdNodeValuesByNodeId = Object.create(null);
		}

		DomFacade.prototype.isAttributeNode = DomFacade.isAttributeNode = function (node) {
			return node.nodeType === node.ATTRIBUTE_NODE;
		};

		/**
		 * TODO: depTracking will be here
		 */
		DomFacade.prototype.getParentNode = function (node) {
			if (this.isAttributeNode(node)) {
				return node.getParentNode();
			}
			return this._blueprint.getParentNode(node);
		};

		DomFacade.prototype.getFirstChild = function (node) {
			if (this.isAttributeNode(node)) {
				return null;
			}
			return this._blueprint.getFirstChild(node);
		};

		DomFacade.prototype.getLastChild = function (node) {
			if (this.isAttributeNode(node)) {
				return null;
			}

			return this._blueprint.getLastChild(node);
		};

		DomFacade.prototype.getNextSibling = function (node) {
			if (this.isAttributeNode(node)) {
				return null;
			}

			return this._blueprint.getNextSibling(node);
		};

		DomFacade.prototype.getPreviousSibling = function (node) {
			if (this.isAttributeNode(node)) {
				return null;
			}

			return this._blueprint.getPreviousSibling(node);
		};

		DomFacade.prototype.getChildNodes = function (node) {
			if (this.isAttributeNode(node)) {
				return [];
			}

			var childNodes = [];

			for (var childNode = this.getFirstChild(node); childNode; childNode = this.getNextSibling(childNode)) {
				childNodes.push(childNode);
			}

			return childNodes;
		};

		DomFacade.prototype.getAttribute = function (node, attributeName) {
			if (this.isAttributeNode(node)) {
				return null;
			}

			var value = this._blueprint.getAttribute(node, attributeName);
			if (!value) {
				return null;
			}
			return value;
		};

		DomFacade.prototype.getAllAttributes = function (node) {
			if (this.isAttributeNode(node)) {
				return [];
			}

			return this._blueprint.getAllAttributes(node);
		};

		DomFacade.prototype.getData = function (node) {
			if (this.isAttributeNode(node)) {
				return node.value;
			}

			return this._blueprint.getData(node) || '';
		};

		// Can be used to create an extra frame when tracking dependencies
		DomFacade.prototype.getRelatedNodes = function (node, callback) {
			return callback();
		};

		return DomFacade;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
	) {
		'use strict';

		function DynamicContext (context) {
			this.contextItem = context.contextItem;
			this.contextSequence = context.contextSequence;
			this.domFacade = context.domFacade;
			this.variables = context.variables;
		}

		DynamicContext.prototype.createScopedContext = function (overlayContext) {
			return new DynamicContext({
				contextItem: overlayContext.contextItem ? overlayContext.contextItem : this.contextItem,
				contextSequence: overlayContext.contextSequence ? overlayContext.contextSequence : this.contextSequence,
				domFacade: overlayContext.domFacade ? overlayContext.domFacade : this.domFacade,
				variables: overlayContext.variables ? Object.assign({}, this.variables, overlayContext.variables) : this.variables
			});
		};

		return DynamicContext;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(10),
		__webpack_require__(11),
		__webpack_require__(23),
		__webpack_require__(13)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Specificity,
		Sequence,
		sortNodeValues,
		NodeValue
	) {
		'use strict';

		/**
		 * @param  {Selector[]}  stepSelectors
		 */
		function PathSelector (stepSelectors) {
			Selector.call(
				this,
				stepSelectors.reduce(function (specificity, selector) {
					// Implicit AND, so sum
					return specificity.add(selector.specificity);
				}, new Specificity({})),
				Selector.RESULT_ORDER_SORTED);

			this._stepSelectors = stepSelectors;
		}

		PathSelector.prototype = Object.create(Selector.prototype);
		PathSelector.prototype.constructor = PathSelector;

		PathSelector.prototype.equals = function (otherSelector) {
			return otherSelector instanceof PathSelector &&
				this._stepSelectors.length === otherSelector._stepSelectors.length &&
				this._stepSelectors.every(function (selector, i) {
					return otherSelector._stepSelectors[i].equals(selector);
				});
		};

		PathSelector.prototype.getBucket = function () {
			return this._stepSelectors[0].getBucket();
		};

		function sortResults (domFacade, result) {
			var resultContainsNodes = false,
				resultContainsNonNodes = false;
			result.forEach(function (resultValue) {
				if (resultValue instanceof NodeValue) {
					resultContainsNodes = true;
				} else {
					resultContainsNonNodes = true;
				}
			});
			if (resultContainsNonNodes && resultContainsNodes) {
				throw new Error('XPTY0018: The path operator should either return nodes or non-nodes. Mixed sequences are not allowed.');
			}

			if (resultContainsNodes) {
				return sortNodeValues(domFacade, result);
			}
			return result;
		}

		PathSelector.prototype.evaluate = function (dynamicContext) {
			var nodeSequence = dynamicContext.contextItem;

			var result = this._stepSelectors.reduce(function (intermediateResultNodes, selector) {
					// All but the last step should return nodes. The last step may return whatever, as long as it is not mixed
					intermediateResultNodes.forEach(function (intermediateResultNode) {
						if (!(intermediateResultNode instanceof NodeValue)) {
							throw new Error('XPTY0019: The / operator can only be applied to xml/json nodes.');
						}
					});

					var resultValuesInOrderOfEvaluation = [];
					var resultSet = new Set();
					intermediateResultNodes.forEach(function (nodeValue) {
						var newResults = selector.evaluate(dynamicContext.createScopedContext({
								contextItem: Sequence.singleton(nodeValue),
								contextSequence: null
							}));

						if (newResults.isEmpty()) {
							return;
						}

						var sortedResultNodes;
						if (selector.expectedResultOrder === Selector.RESULT_ORDER_REVERSE_SORTED) {
							sortedResultNodes = newResults.value.reverse();
						} else {
							sortedResultNodes = newResults.value;
						}

						sortedResultNodes.forEach(function (newResult) {
							if (newResult instanceof NodeValue) {
								// Because the intermediateResults are ordered, and these results are ordered too, we should be able to dedupe and concat these results
								if (resultSet.has(newResult)) {
									return;
								}
								resultSet.add(newResult);
							}
							resultValuesInOrderOfEvaluation.push(newResult);
						});
					}, []);

					if (selector.expectedResultOrder === selector.RESULT_ORDER_UNSORTED) {
						// The result should be sorted before we can continue
						resultValuesInOrderOfEvaluation = sortResults(dynamicContext.domFacade, resultValuesInOrderOfEvaluation);
					}

					return resultValuesInOrderOfEvaluation;
				}, nodeSequence.value);

			return new Sequence(result);
		};

		return PathSelector;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
	) {
		'use strict';

		/**
		 * Compares positions of given nodes in the given state, assuming they share a common parent
		 *
		 * @param {DomFacade} domFacade The domFacade in which to consider the nodes
		 * @param {Node}      node1     The first node
		 * @param {Node}      node2     The second node
		 *
		 * @return {Number} Returns 0 if node1 equals node2, -1 if node1 precedes node2, and 1 otherwise
		 */
		function compareSiblingPositions (domFacade, node1, node2) {
			if (node1 === node2) {
				return 0;
			}

			// If either one of the nodes describes an end, the other one precedes it.
			if (node2 === null) {
				return -1;
			}
			if (node1 === null) {
				return 1;
			}

			var childNodes = domFacade.getChildNodes(domFacade.getParentNode(node1));
			for (var i = 0, l = childNodes.length; i <l; ++i) {
				var childNode = childNodes[i];
				if (childNode === node1) {
					return -1;
				}
				if (childNode === node2) {
					return 1;
				}
			}
		}

		/**
		 * Find all ancestors of the given node
		 *
		 * @param   {DomFacade}  domFacade  The domFacade to consider relations in
		 * @param   {Node}       node       The node to find all ancestors of
		 * @return  {Node[]}     All of the ancestors of the given node
		 */
		function findAllAncestors (domFacade, node) {
			var ancestors = [];
			for (var ancestor = node; ancestor; ancestor = domFacade.getParentNode(ancestor)) {
				ancestors.unshift(ancestor);
			}

			return ancestors;
		}

		/**
		 * Compares the given positions w.r.t. document order in this state
		 *
		 * @param {DomFacade} domFacade      The domFacade in which to consider the nodes
		 * @param {Node}      parentNode1    The parent of the first position
		 * @param {Node|null} referenceNode1 The next sibling of the first position
		 * @param {Node}      parentNode2    The parent of the second position
		 * @param {Node|null} referenceNode2 The next sibling of the second position
		 *
		 * @return {Number} Returns 0 if the positions are equal, -1 if the first position precedes the second,
		 *                    and 1 otherwise.
		 */
		function comparePositions (domFacade, parentNode1, referenceNode1, parentNode2, referenceNode2) {
			var bias = 0;
			if (parentNode1 !== parentNode2) {
				var ancestors1 = findAllAncestors(domFacade, parentNode1),
				ancestors2 = findAllAncestors(domFacade, parentNode2);
				// Skip common ancestors
				var commonAncestor = null,
					i, l;
				for (i = 0, l = Math.min(ancestors1.length, ancestors2.length); i < l; ++i) {
					if (ancestors1[i] !== ancestors2[i])
						break;

					commonAncestor = ancestors1[i];
				}
				// No defined ordering between different trees
				if (!commonAncestor) {
					return 0;
				}

				if (i < ancestors1.length) {
					referenceNode1 = ancestors1[i];
					// Position under node is higher in document order than a position directly before it
					bias = 1;
				}
				if (i < ancestors2.length) {
					referenceNode2 = ancestors2[i];
					// Position under node is higher in document order than a position directly before it
					bias = -1;
				}
			}
			// Compare positions under the common ancestor
			return compareSiblingPositions(domFacade, referenceNode1, referenceNode2) || bias;
		}

		function compareNodePositions (domFacade, node1, node2) {
			return comparePositions(
				domFacade,
				node1, domFacade.getFirstChild(node1),
				node2, domFacade.getFirstChild(node2));
		}

		/**
		 * Sort (and deduplicate) the nodeValues in DOM order
		 * Attributes are placed after their elements, before childnodes.
		 * Attributes are sorted alphabetically by their names
		 *
		 * @param   {DomFacade}    domFacade
		 * @param   {NodeValue[]}  nodeValues
		 *
		 *@return   {NodeValue[]}  The sorted nodes
		 */
		return function sortNodeValues (domFacade, nodeValues) {
			return nodeValues
				.sort(function (nodeValueA, nodeValueB) {
					var valueA, valueB;
					if (nodeValueA.instanceOfType('attribute()') && !nodeValueB.instanceOfType('attribute()')) {
						valueA = domFacade.getParentNode(nodeValueA.value);
						valueB = nodeValueB.value;
						if (valueA === valueB) {
							// Same element, so A
							return 1;
						}
					} else if (nodeValueB.instanceOfType('attribute()') && !nodeValueA.instanceOfType('attribute()')) {
						valueA = nodeValueA.value;
						valueB = domFacade.getParentNode(valueB.value);
						if (valueB === valueA) {
							// Same element, so B before A
							return -1;
						}
					} else if (nodeValueA.instanceOfType('attribute()') && nodeValueB.instanceOfType('attribute()')) {
						if (domFacade.getParentNode(nodeValueB.value) === domFacade.getParentNode(nodeValueA.value)) {
							// Sort on attributes name
							return nodeValueA.value.nodeName > nodeValueB.value.nodeName ? 1 : -1;
						}
						valueA = domFacade.getParentNode(nodeValueA.value);
						valueB = domFacade.getParentNode(nodeValueB.value);
					} else {
						valueA = nodeValueA.value;
						valueB = nodeValueB.value;
					}
					return compareNodePositions(domFacade, valueA, valueB);
				})
				.filter(function (nodeValue, i, sortedNodes) {
					if (i === 0) {
						return true;
					}
					return nodeValue !== sortedNodes[i - 1];
				});
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(11)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Sequence
	) {
		'use strict';

		/**
		 * @param  {Selector}    selector
		 * @param  {Selector}    filterSelector
		 */
		function Filter (selector, filterSelector) {
			Selector.call(this, selector.specificity.add(filterSelector.specificity), selector.expectedResultOrder);

			this._selector = selector;
			this._filterSelector = filterSelector;
		}

		Filter.prototype = Object.create(Selector.prototype);
		Filter.prototype.constructor = Filter;

		Filter.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof Filter &&
				this._selector.equals(otherSelector._selector) &&
				this._filterSelector.equals(otherSelector._filterSelector);
		};

		Filter.prototype.getBucket = function () {
			return this._selector.getBucket();
		};

		Filter.prototype.evaluate = function (dynamicContext) {
			var valuesToFilter = this._selector.evaluate(dynamicContext);

			var filteredValues = valuesToFilter.value.filter(function (value, index) {
				var result = this._filterSelector.evaluate(
						dynamicContext.createScopedContext({
							contextItem: Sequence.singleton(value),
							contextSequence: valuesToFilter
						}));

				if (result.isEmpty()) {
					return false;
				}

				var resultValue = result.value[0];
				if (resultValue.instanceOfType('xs:numeric')) {
					// Remember: XPath is one-based
					return resultValue.value === index + 1;
				}

				return result.getEffectiveBooleanValue();
			}.bind(this));

			return new Sequence(filteredValues);
		};

		return Filter;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(10),
		__webpack_require__(11),
		__webpack_require__(13),
		__webpack_require__(16)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Specificity,
		Sequence,
		NodeValue,
		AttributeNode
	) {
		'use strict';

		/**
		 * @param  {Selector}    attributeTestSelector
		 */
		function AttributeAxis (attributeTestSelector) {
			Selector.call(this, new Specificity({attribute: 1}), Selector.RESULT_ORDER_UNSORTED);

			this._attributeTestSelector = attributeTestSelector;
		}

		AttributeAxis.prototype = Object.create(Selector.prototype);
		AttributeAxis.prototype.constructor = AttributeAxis;

		AttributeAxis.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof AttributeAxis &&
				this._attributeTestSelector.equals(otherSelector._attributeTestSelector);
		};

		AttributeAxis.prototype.evaluate = function (dynamicContext) {
			var contextItem = dynamicContext.contextItem,
				domFacade = dynamicContext.domFacade;

			if (!contextItem.value[0].instanceOfType('element()')) {
				return Sequence.empty();
			}

			var attributes = domFacade
				.getAllAttributes(contextItem.value[0].value)
				.map(function (attribute) {
					return new NodeValue(domFacade, new AttributeNode(
						contextItem.value[0].value,
						attribute.name,
						attribute.value
					));
				}).filter(function (attributeNodeValue) {
					var scopedContext = dynamicContext.createScopedContext({ contextItem: Sequence.singleton(attributeNodeValue) });
					return this._attributeTestSelector.evaluate(scopedContext).getEffectiveBooleanValue();
				}.bind(this));

			return new Sequence(attributes);
		};

		return AttributeAxis;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(11),
		__webpack_require__(13)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Sequence,
		NodeValue
	) {
		'use strict';

		/**
		 * @param  {Selector}  ancestorSelector
		 * @param  {Object}    options
		 */
		function AncestorAxis (ancestorSelector, options) {
			options = options || {};
			Selector.call(this, ancestorSelector.specificity, Selector.RESULT_ORDER_REVERSE_SORTED);

			this._ancestorSelector = ancestorSelector;
			this._isInclusive = !!options.inclusive;
		}

		AncestorAxis.prototype = Object.create(Selector.prototype);
		AncestorAxis.prototype.constructor = AncestorAxis;

		AncestorAxis.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof AncestorAxis &&
				this._isInclusive === otherSelector._isInclusive &&
				this._ancestorSelector.equals(otherSelector._ancestorSelector);
		};

		AncestorAxis.prototype.evaluate = function (dynamicContext) {
			var contextItem = dynamicContext.contextItem,
				domFacade = dynamicContext.domFacade;

			// Assume singleton, since axes are only valid in paths
			var contextNode = contextItem.value[0].value;
			var ancestors = [];
			for (var ancestorNode = this._isInclusive ? contextNode : domFacade.getParentNode(contextNode);
				ancestorNode;
				ancestorNode = domFacade.getParentNode(ancestorNode)) {
				var isMatchingAncestor = this._ancestorSelector.evaluate({
						contextItem: Sequence.singleton(new NodeValue(dynamicContext.domFacade, ancestorNode)),
						contextSequence: null,
						domFacade: domFacade
					}).getEffectiveBooleanValue();

				if (isMatchingAncestor) {
					ancestors.push(ancestorNode);
				}
			}
			return new Sequence(ancestors.map(function (node) {
				return new NodeValue(dynamicContext.domFacade, node);
			}));
		};

		return AncestorAxis;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(11),
		__webpack_require__(13)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Sequence,
		NodeValue
	) {
		'use strict';

		/**
		 * @param  {Selector}  childSelector
		 */
		function ChildAxis (childSelector) {
			Selector.call(this, childSelector.specificity, Selector.RESULT_ORDER_SORTED);

			this._childSelector = childSelector;
		}

		ChildAxis.prototype = Object.create(Selector.prototype);
		ChildAxis.prototype.constructor = ChildAxis;

		ChildAxis.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof ChildAxis &&
				this._childSelector.equals(otherSelector._childSelector);
		};

		ChildAxis.prototype.evaluate = function (dynamicContext) {
			var contextItem = dynamicContext.contextItem,
				domFacade = dynamicContext.domFacade;
			var nodeValues = domFacade.getChildNodes(contextItem.value[0].value)
				.filter(function (node) {
					return this._childSelector.evaluate(
						dynamicContext.createScopedContext({
							contextItem: Sequence.singleton(new NodeValue(dynamicContext.domFacade, node)),
							contextSequence: null
						})).getEffectiveBooleanValue();
				}.bind(this))
				.map(function (node) {
					return new NodeValue(dynamicContext.domFacade, node);
				});

			return new Sequence(nodeValues);
		};

		return ChildAxis;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(11),
		__webpack_require__(13)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Sequence,
		NodeValue
	) {
		'use strict';

		/**
		 * @param  {Selector}  descendantSelector
		 */
		function DescendantAxis (descendantSelector, options) {
			options = options || {};
			Selector.call(this, descendantSelector.specificity, Selector.RESULT_ORDER_SORTED);

			this._descendantSelector = descendantSelector;
			this._isInclusive = !!options.inclusive;
		}

		DescendantAxis.prototype = Object.create(Selector.prototype);
		DescendantAxis.prototype.constructor = DescendantAxis;

		DescendantAxis.prototype.equals = function (otherSelector) {
			return otherSelector instanceof DescendantAxis &&
				this._isInclusive === otherSelector._isInclusive &&
				this._descendantSelector.equals(otherSelector._descendantSelector);
		};

		DescendantAxis.prototype.evaluate = function (dynamicContext) {
			var contextItem = dynamicContext.contextItem,
				domFacade = dynamicContext.domFacade;

			// Assume singleton, since axes are only valid in paths
			var isMatchingDescendant = function (descendantNode) {
					var scopedContext = dynamicContext.createScopedContext({
							contextItem: Sequence.singleton(new NodeValue(domFacade, descendantNode)),
							contextSequence: null
						});
					return this._descendantSelector.evaluate(scopedContext).getEffectiveBooleanValue();
				}.bind(this);
			var nodeValues = [];
			function findDescendants (matchingDescendants, node) {
					if (isMatchingDescendant(node)) {
						matchingDescendants.push(new NodeValue(domFacade, node));
					}
					domFacade.getChildNodes(node)
						.forEach(function (childNode) {
							findDescendants(matchingDescendants, childNode);
						});
			}

			if (this._isInclusive) {
				findDescendants(nodeValues, contextItem.value[0].value);
			} else {
				domFacade.getChildNodes(contextItem.value[0].value).forEach(function (childNode) {
					findDescendants(nodeValues, childNode);
				});
			}

			return new Sequence(nodeValues);
		};

		return DescendantAxis;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(11),
		__webpack_require__(13)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Sequence,
		NodeValue
	) {
		'use strict';

		/**
		 * @param  {Selector}  siblingSelector
		 */
		function FollowingSiblingAxis (siblingSelector) {
			Selector.call(this, siblingSelector.specificity, Selector.RESULT_ORDER_SORTED);

			this._siblingSelector = siblingSelector;
		}

		FollowingSiblingAxis.prototype = Object.create(Selector.prototype);
		FollowingSiblingAxis.prototype.constructor = FollowingSiblingAxis;

		/**
		 * @param  {Selector}  otherSelector
		 */
		FollowingSiblingAxis.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof FollowingSiblingAxis &&
				this._siblingSelector.equals(otherSelector._siblingSelector);
		};

		FollowingSiblingAxis.prototype.evaluate = function (dynamicContext) {
			var contextItem = dynamicContext.contextItem,
				domFacade = dynamicContext.domFacade;

			function isMatchingSibling (selector, node) {
				return selector.evaluate(dynamicContext.createScopedContext({
					contextItem: Sequence.singleton(new NodeValue(dynamicContext.domFacade, node)),
					contextSequence: null
				})).getEffectiveBooleanValue();
			}

			var sibling = contextItem.value[0].value;
			var nodes = [];
			while ((sibling = domFacade.getNextSibling(sibling))) {
				if (!isMatchingSibling(this._siblingSelector, sibling)) {
					continue;
				}
				nodes.push(new NodeValue(dynamicContext.domFacade, sibling));
			}
			return new Sequence(nodes);
		};

		return FollowingSiblingAxis;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(11),
		__webpack_require__(13)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Sequence,
		NodeValue
	) {
		'use strict';

		/**
		 * @param  {Selector}  parentSelector
		 */
		function ParentAxis (parentSelector) {
			Selector.call(this, parentSelector.specificity, Selector.RESULT_ORDER_REVERSE_SORTED);

			this._parentSelector = parentSelector;
		}

		ParentAxis.prototype = Object.create(Selector.prototype);
		ParentAxis.prototype.constructor = ParentAxis;

		ParentAxis.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof ParentAxis &&
				this._parentSelector.equals(otherSelector._parentSelector);
		};

		ParentAxis.prototype.evaluate = function (dynamicContext) {
			var nodeSequence = dynamicContext.contextItem,
				domFacade = dynamicContext.domFacade;

			var nodeValues = nodeSequence.value
				.map(function (nodeValue) {
					var parentNode = domFacade.getParentNode(nodeValue.value);
					if (!parentNode) {
						return null;
					}
					return new NodeValue(dynamicContext.domFacade, parentNode);
				})
				.filter(function (nodeValue) {
					if (!nodeValue) {
						return false;
					}
					var result = this._parentSelector.evaluate(dynamicContext.createScopedContext({
							contextItem: Sequence.singleton(nodeValue),
							contextSequence: null
						}));
					return result.getEffectiveBooleanValue();
				}.bind(this));

			return new Sequence(nodeValues);
		};

		return ParentAxis;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(11),
		__webpack_require__(13)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Sequence,
		NodeValue
	) {
		'use strict';

		/**
		 * @param  {Selector}  siblingSelector
		 */
		function PrecedingSiblingAxis (siblingSelector) {
			Selector.call(this, siblingSelector.specificity, Selector.RESULT_ORDER_REVERSE_SORTED);

			this._siblingSelector = siblingSelector;
		}

		PrecedingSiblingAxis.prototype = Object.create(Selector.prototype);
		PrecedingSiblingAxis.prototype.constructor = PrecedingSiblingAxis;

		/**
		 * @param  {Selector}  otherSelector
		 */
		PrecedingSiblingAxis.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof PrecedingSiblingAxis &&
				this._siblingSelector.equals(otherSelector._siblingSelector);
		};

		PrecedingSiblingAxis.prototype.evaluate = function (dynamicContext) {
			var contextItem = dynamicContext.contextItem;

			function isMatchingSibling (selector, node) {
				return selector.evaluate(dynamicContext.createScopedContext({
					contextItem: Sequence.singleton(new NodeValue(dynamicContext.domFacade, node)),
					contextSequence: null
				})).getEffectiveBooleanValue();
			}

			var sibling = contextItem.value[0].value;
			var nodes = [];
			while ((sibling = dynamicContext.domFacade.getPreviousSibling(sibling))) {
				if (!isMatchingSibling(this._siblingSelector, sibling)) {
					continue;
				}
				nodes.push(new NodeValue(dynamicContext.domFacade, sibling));
			}
			return new Sequence(nodes);
		};

		return PrecedingSiblingAxis;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(11)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Sequence
	) {
		'use strict';

		/**
		 * @param  {Selector}  selector
		 */
		function SelfAxis (selector) {
			Selector.call(this, selector.specificity, Selector.RESULT_ORDER_SORTED);

			this._selector = selector;
		}

		SelfAxis.prototype = Object.create(Selector.prototype);
		SelfAxis.prototype.constructor = SelfAxis;

		SelfAxis.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof SelfAxis &&
				this._selector.equals(otherSelector._selector);
		};

		SelfAxis.prototype.evaluate = function (dynamicContext) {
			var nodeSequence = dynamicContext.contextItem;

			return new Sequence(nodeSequence.value.filter(function (nodeValue) {
				return this._selector.evaluate(dynamicContext.createScopedContext({
					contextItem: Sequence.singleton(nodeValue),
					contextSequence: nodeSequence
				})).getEffectiveBooleanValue();
			}.bind(this)));
		};

		SelfAxis.prototype.getBucket = function () {
			return this._selector.getBucket();
		};

		return SelfAxis;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(18),
		__webpack_require__(11),
		__webpack_require__(19),
		__webpack_require__(10),
		__webpack_require__(34)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		BooleanValue,
		Sequence,
		Selector,
		Specificity,
		isSameArray
	) {
		'use strict';

		/**
		 * @param  {String|String[]}  nodeName
		 */
		function NodeNameSelector (nodeName) {
			var specificity = {nodeName: 1};
			if (nodeName === '*') {
				specificity = {nodeType: 1};
			}
			Selector.call(this, new Specificity(specificity), Selector.RESULT_ORDER_SORTED);

			// Do not coerce the string/string[] to string[] because this costs performance in domInfo.isElement
			this._nodeName = nodeName;

			if (Array.isArray(this._nodeName)) {
				this._nodeName = this._nodeName.concat().sort();
			}
		}

		NodeNameSelector.prototype = Object.create(Selector.prototype);
		NodeNameSelector.prototype.constructor = NodeNameSelector;

		NodeNameSelector.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			if (!(otherSelector instanceof NodeNameSelector)) {
				return false;
			}

			var nodeNames = Array.isArray(this._nodeName) ? this._nodeName : [this._nodeName],
			otherNodeNames = Array.isArray(otherSelector._nodeName) ? otherSelector._nodeName : [otherSelector._nodeName];

			return isSameArray(nodeNames, otherNodeNames);
		};

		NodeNameSelector.prototype.evaluate = function (dynamicContext) {
			var sequence = dynamicContext.contextItem,
				node = sequence.value[0];

			if (!node.instanceOfType('element()') && !node.instanceOfType('attribute()')) {
				return Sequence.singleton(BooleanValue.FALSE);
			}

			if (this._nodeName === '*') {
				return Sequence.singleton(BooleanValue.TRUE);
			}
			var returnValue = Array.isArray(this._nodeName) ?
				this._nodeName.indexOf(node.nodeName) > -1 :
				this._nodeName === node.nodeName;
			return Sequence.singleton(returnValue ? BooleanValue.TRUE : BooleanValue.FALSE);
		};

		NodeNameSelector.prototype.getBucket = function () {
			if (this._nodeName === '*') {
				// While * is a test matching attributes or elements, buckets are never used to match nodes.
				return 'type-1';
			}
			return 'name-' + this._nodeName;
		};

		return NodeNameSelector;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
	) {
		'use strict';

		return function isSameAttributeValues (values1, values2) {
			if (values1 === values2) {
				return true;
			}
			if (values1.length !== values2.length) {
				return false;
			}

			// The values are sorted, so a simple a[i] === b[i] is sufficient
			return values1.every(function (value, i) {
				return values2[i] === value;
			});
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(11),
		__webpack_require__(18),
		__webpack_require__(10)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Sequence,
		BooleanValue,
		Specificity
	) {
		'use strict';

		/**
		 * @param  {Number}  nodeType
		 */
		function NodeTypeSelector (nodeType) {
			Selector.call(this, new Specificity({nodeType: 1}), Selector.RESULT_ORDER_SORTED);

			this._nodeType = nodeType;
		}

		NodeTypeSelector.prototype = Object.create(Selector.prototype);
		NodeTypeSelector.prototype.constructor = NodeTypeSelector;

		NodeTypeSelector.prototype.evaluate = function (dynamicContext) {
			var sequence = dynamicContext.contextItem;
			var booleanValue = this._nodeType === sequence.value[0].value.nodeType ?
				BooleanValue.TRUE :
				BooleanValue.FALSE;
			return Sequence.singleton(booleanValue);
		};

		NodeTypeSelector.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof NodeTypeSelector &&
				this._nodeType === otherSelector._nodeType;
		};

		NodeTypeSelector.prototype.getBucket = function () {
			return 'type-' + this._nodeType;
		};

		return NodeTypeSelector;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(18),
		__webpack_require__(11),
		__webpack_require__(19),
		__webpack_require__(10)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		BooleanValue,
		Sequence,
		Selector,
		Specificity
	) {
		'use strict';

		/**
		 * @param  {String}  target
		 */
		function ProcessingInstructionTargetSelector (target) {
			Selector.call(this, new Specificity({nodeName: 1}), Selector.RESULT_ORDER_SORTED);

			this._target = target;
		}

		ProcessingInstructionTargetSelector.prototype = Object.create(Selector.prototype);
		ProcessingInstructionTargetSelector.prototype.constructor = ProcessingInstructionTargetSelector;

		ProcessingInstructionTargetSelector.prototype.evaluate = function (dynamicContext) {
			var sequence = dynamicContext.contextItem;
			// Assume singleton
			var nodeValue = sequence.value[0];
			var isMatchingProcessingInstruction = nodeValue.instanceOfType('processing-instruction()') &&
				nodeValue.value.target === this._target;
			return Sequence.singleton(isMatchingProcessingInstruction ? BooleanValue.TRUE : BooleanValue.FALSE);
		};

		ProcessingInstructionTargetSelector.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof ProcessingInstructionTargetSelector &&
				this._target === otherSelector._target;
		};

		ProcessingInstructionTargetSelector.prototype.getBucket = function () {
			return 'type-7';
		};

		return ProcessingInstructionTargetSelector;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(11),
		__webpack_require__(18),
		__webpack_require__(10)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Sequence,
		BooleanValue,
		Specificity
	) {
		'use strict';

		/**
		 * @param  {string}  type
		 */
		function TypeTest (type) {
			Selector.call(this, new Specificity({}), Selector.RESULT_ORDER_SORTED);

			this._type = type;
		}

		TypeTest.prototype = Object.create(Selector.prototype);
		TypeTest.prototype.constructor = TypeTest;

		TypeTest.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof TypeTest &&
			this._type === otherSelector._type;
		};

		TypeTest.prototype.evaluate = function (dynamicContext) {
			var booleanValue = dynamicContext.contextItem.value[0].instanceOfType(this._type) ? BooleanValue.TRUE : BooleanValue.FALSE;
			return Sequence.singleton(booleanValue);
		};

		return TypeTest;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(39),
		__webpack_require__(40),
		__webpack_require__(11),
		__webpack_require__(19),
		__webpack_require__(10)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		argumentListToString,
		isValidArgument,
		Sequence,
		Selector,
		Specificity
	) {
		'use strict';

		/**
		 * @param  {Selector}    functionReference  Reference to the function to execute.
		 * @param  {Selector[]}  args              The arguments to be evaluated and passed to the function
		 */
		function FunctionCall (functionReference, args) {
			Selector.call(this, new Specificity({external: 1}), Selector.RESULT_ORDER_UNSORTED);

			this._args = args;
			this._functionReference = functionReference;
		}

		FunctionCall.prototype = Object.create(Selector.prototype);
		FunctionCall.prototype.constructor = FunctionCall;

		FunctionCall.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof FunctionCall &&
				this._functionReference.equals(otherSelector._functionReference) &&
				this._args.length === otherSelector._args.length &&
				this._args.every(function (arg, i) {
					return arg.equals(otherSelector._args[i]);
				});
		};

		function isValidArgumentList (argumentTypes, argumentList) {
			var indexOfRest = argumentTypes.indexOf('...');
			if (indexOfRest > -1) {
				var replacePart = new Array(argumentList.length - (argumentTypes.length - 1))
					.fill(argumentTypes[indexOfRest - 1]);
				argumentTypes = argumentTypes.slice(0, indexOfRest)
					.concat(replacePart, argumentTypes.slice(indexOfRest + 1));
			}

			return argumentList.length === argumentTypes.length &&
				argumentList.every(function (argument, i) {
					return isValidArgument(argumentTypes[i], argument);
				});
		}

		FunctionCall.prototype.evaluate = function (dynamicContext) {
			var sequence = this._functionReference.evaluate(dynamicContext);

			if (!sequence.isSingleton()) {
				throw new Error('XPTY0004: expected base expression to evaluate to a sequence with a single item');
			}

			var evaluatedArgs = this._args.map(function (argument) {
						return argument.evaluate(dynamicContext);
					}),
				functionItem = sequence.value[0];

			if (!functionItem.instanceOfType('function(*)')) {
				throw new Error('XPTY0004: expected base expression to evaluate to a function item');
			}

			if (functionItem.getArity() !== this._args.length) {
				throw new Error('XPTY0004: expected arity of dynamic function to be ' + this._args.length + ', got function with arity of ' + functionItem.getArity());
			}

			if (!isValidArgumentList(functionItem.getArgumentTypes(), evaluatedArgs)) {
				throw new Error('XPTY0004: expected argument list of dynamic function to be [' + argumentListToString(evaluatedArgs) + '], got function with argument list [' + functionItem.getArgumentTypes().join(', ') + '].');
			}

			return functionItem.value.apply(undefined, [dynamicContext].concat(evaluatedArgs));
		};

		return FunctionCall;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [

	], __WEBPACK_AMD_DEFINE_RESULT__ = function (

	) {
		'use strict';

		return function argumentListToString (argumentList) {
			return argumentList.map(function (argument) {
				if (argument.isEmpty()) {
					return 'item()?';
				}

				if (argument.isSingleton()) {
					return argument.value[0].primitiveTypeName;
				}
				return argument.value[0].primitiveTypeName + '+';
			}).join(', ');
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
	) {
		'use strict';

		return function isValidArgument (argumentTypes, argument) {
			// argumentTypes is something like 'xs:string?'
			var parts = argumentTypes.match(/^([^+?*]*)([\+\*\?])?$/);
			var type = parts[1],
				multiplicity = parts[2];
			switch (multiplicity) {
				case '?':
					if (!argument.isEmpty() && !argument.isSingleton()) {
						return false;
					}
					break;

				case '+':
					if (argument.isEmpty()) {
						return false;
					}
					break;

				case '*':
					break;

				default:
					if (!argument.isSingleton()) {
						return false;
					}
			}

			return argument.value.every(function (argumentItem) {
				return argumentItem.instanceOfType(type);
			});
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(11),
		__webpack_require__(13)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Sequence,
		NodeValue
	) {
		'use strict';

		/**
		 * @param  {Selector}  relativePathSelector
		 */
		function AbsolutePathSelector (relativePathSelector) {
			Selector.call(this, relativePathSelector.specificity, Selector.RESULT_ORDER_SORTED);

			this._relativePathSelector = relativePathSelector;
		}

		AbsolutePathSelector.prototype = Object.create(Selector.prototype);
		AbsolutePathSelector.prototype.constructor = AbsolutePathSelector;

		AbsolutePathSelector.prototype.equals = function (otherSelector) {
			return otherSelector instanceof AbsolutePathSelector &&
				this._relativePathSelector.equals(otherSelector._relativePathSelector);
		};

		AbsolutePathSelector.prototype.evaluate = function (dynamicContext) {
			var nodeSequence = dynamicContext.contextItem,
				domFacade = dynamicContext.domFacade;
			var node = nodeSequence.value[0].value;
			var documentNode = node.nodeType === node.DOCUMENT_NODE ? node : node.ownerDocument;
			// Assume this is the start, so only one node
			return this._relativePathSelector.evaluate(
				dynamicContext.createScopedContext({
					contextItem: Sequence.singleton(
						new NodeValue(domFacade, documentNode)),
					contextSequence: null
				}));
		};

		return AbsolutePathSelector;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(9),
		__webpack_require__(19),
		__webpack_require__(10),
		__webpack_require__(11),
		__webpack_require__(18)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		isSameSetOfSelectors,
		Selector,
		Specificity,
		Sequence,
		BooleanValue
	) {
		'use strict';

		/**
		 * The 'or' combining selector
		 * @param  {Selector[]}  selectors
		 */
		function OrOperator (selectors) {
			Selector.call(
				this,
				selectors.reduce(function (maxSpecificity, selector) {
					if (maxSpecificity.compareTo(selector.specificity) > 0) {
						return maxSpecificity;
					}
					return selector.specificity;
				}, new Specificity({})),
				Selector.RESULT_ORDER_SORTED);

			// If all subSelectors define the same bucket: use that one, else, use no bucket.
			this._bucket = selectors.reduce(function (bucket, selector) {
				if (bucket === undefined) {
					return selector.getBucket();
				}
				if (bucket === null) {
					return null;
				}

				if (bucket !== selector.getBucket()) {
					return null;
				}

				return bucket;
			}, undefined);

			this._subSelectors = selectors;
		}

		OrOperator.prototype = Object.create(Selector.prototype);
		OrOperator.prototype.constructor = OrOperator;

		OrOperator.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof OrOperator &&
				isSameSetOfSelectors(this._subSelectors, otherSelector._subSelectors);
		};

		OrOperator.prototype.evaluate = function (dynamicContext) {
			var result = this._subSelectors.some(function (subSelector) {
					return subSelector.evaluate(dynamicContext).getEffectiveBooleanValue();
				});

			return Sequence.singleton(result ? BooleanValue.TRUE : BooleanValue.FALSE);
		};

		OrOperator.prototype.getBucket = function () {
			return this._bucket;
		};

		return OrOperator;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(10),
		__webpack_require__(11),
		__webpack_require__(18)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Specificity,
		Sequence,
		BooleanValue
	) {
		'use strict';

		/**
		 * Deprecated, only used for fluent syntax.
		 */
		function UniversalSelector () {
			Selector.call(
				this,
				new Specificity({universal: 1}),
				Selector.RESULT_ORDER_SORTED);
		}

		UniversalSelector.prototype = Object.create(Selector.prototype);
		UniversalSelector.prototype.constructor = UniversalSelector;

		UniversalSelector.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof UniversalSelector;
		};

		UniversalSelector.prototype.evaluate = function () {
			return Sequence.singleton(BooleanValue.TRUE);
		};

		return UniversalSelector;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(9),
		__webpack_require__(10),
		__webpack_require__(19),
		__webpack_require__(11),
		__webpack_require__(23)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		isSameSetOfSelectors,
		Specificity,
		Selector,
		Sequence,
		sortNodeValues
	) {
		'use strict';

		/**
		 * The 'union' combining selector, or when matching, concats otherwise.
		 * order is undefined.
		 * @param  {Selector[]}  selectors
		 */
		function Union (selectors) {
			Selector.call(
				this,
				selectors.reduce(function (maxSpecificity, selector) {
					if (maxSpecificity.compareTo(selector.specificity) > 0) {
						return maxSpecificity;
					}
					return selector.specificity;
				}, new Specificity({})),
				Selector.RESULT_ORDER_UNSORTED);

			this._subSelectors = selectors;
		}

		Union.prototype = Object.create(Selector.prototype);
		Union.prototype.constructor = Union;

		Union.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof Union &&
				isSameSetOfSelectors(this._subSelectors, otherSelector._subSelectors);
		};

		Union.prototype.evaluate = function (dynamicContext) {
			var nodeSet = this._subSelectors.reduce(function (resultingNodeSet, selector) {
					var results = selector.evaluate(dynamicContext);
					var allItemsAreNode = results.value.every(function (valueItem) {
							return valueItem.instanceOfType('node()');
						});

					if (!allItemsAreNode) {
						throw new Error('ERRXPTY0004: The sequences to union are not of type node()*');
					}
					results.value.forEach(function (nodeValue) {
						resultingNodeSet.add(nodeValue);
					});
					return resultingNodeSet;
				}, new Set());

			var sortedValues = sortNodeValues(dynamicContext.domFacade, Array.from(nodeSet.values()));
			return new Sequence(sortedValues);
		};
		return Union;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(9),
		__webpack_require__(19),
		__webpack_require__(10),
		__webpack_require__(11)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		isSameSetOfSelectors,
		Selector,
		Specificity,
		Sequence
	) {
		'use strict';

		/**
		 * The Sequence selector evaluates its operands and returns them as a single sequence
		 *
		 * @param  {Selector[]}  selectors
		 */
		function SequenceOperator (selectors) {
			Selector.call(
				this,
				selectors.reduce(function (specificity, selector) {
					return specificity.add(selector.specificity);
				}, new Specificity({})),
				Selector.RESULT_ORDER_UNSORTED);
			this._selectors = selectors;
		}

		SequenceOperator.prototype = Object.create(Selector.prototype);
		SequenceOperator.prototype.constructor = SequenceOperator;

		SequenceOperator.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof SequenceOperator &&
				isSameSetOfSelectors(this._selectors, otherSelector._selectors);
		};

		SequenceOperator.prototype.evaluate = function (dynamicContext) {
			return this._selectors.reduce(function (accum, selector) {
				return accum.merge(selector.evaluate(dynamicContext));
			}, new Sequence());
		};

		return SequenceOperator;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(10),
		__webpack_require__(11)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Specificity,
		Sequence
	) {
		'use strict';

		/**
		 * Simple Map operator
		 * The simple map operator will evaluate expressions given in expression1 and use the results as context for
		 * evaluating all expressions in expression2. Returns a sequence with results from the evaluation of expression2.
		 * Order is undefined.
		 *
		 * @param  {Selector}    expression1
		 * @param  {Selector[]}  expression2
		 */
		function SimpleMapOperator (expression1, expression2) {
			Selector.call(
				this,
				new Specificity({}).add(expression1.specificity),
				Selector.RESULT_ORDER_UNSORTED);

			this._expression1 = expression1;
			this._expression2 = expression2;
		}

		SimpleMapOperator.prototype = Object.create(Selector.prototype);
		SimpleMapOperator.prototype.constructor = SimpleMapOperator;

		SimpleMapOperator.prototype.evaluate = function (dynamicContext) {
			return this._expression1.evaluate(dynamicContext).value.reduce(function (sequenceToReturn, currentValue) {
					var context = dynamicContext.createScopedContext({ contextItem: Sequence.singleton(currentValue) });
					return sequenceToReturn.merge(this._expression2.evaluate(context));
				}.bind(this), Sequence.empty());
		};

		SimpleMapOperator.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof SimpleMapOperator &&
				this._expression1.equals(otherSelector._expression1) &&
				this._expression2.equals(otherSelector._expression2);
		};

		return SimpleMapOperator;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(11),
		__webpack_require__(48),
		__webpack_require__(19)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Sequence,
		DoubleValue,
		Selector
	) {
		'use strict';

		/**
		 * Positivese or negativise a value: +1 = 1, -1 = 0 - 1, -1 + 2 = 1, --1 = 1, etc
		 * @param  {string}    kind       Either + or -
		 * @param  {Selector}  valueExpr  The selector evaluating to the value to process
		 */
		function Unary (kind, valueExpr) {
			Selector.call(this, valueExpr.specificity, Selector.RESULT_ORDER_SORTED);
			this._valueExpr = valueExpr;

			this._kind = kind;
		}

		Unary.prototype = Object.create(Selector.prototype);
		Unary.prototype.constructor = Unary;

		Unary.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof Unary &&
				this._kind === otherSelector._kind &&
				this._valueExpr.equals(otherSelector._valueExpr);
		};

		Unary.prototype.evaluate = function (dynamicContext) {
			var valueSequence = this._valueExpr.evaluate(dynamicContext);
			if (valueSequence.isEmpty()) {
				return Sequence.singleton(new DoubleValue(Number.NaN));
			}

			var value = valueSequence.value[0].atomize();
			if (value.instanceOfType('xs:integer') ||
				value.instanceOfType('xs:decimal') ||
				value.instanceOfType('xs:double') ||
				value.instanceOfType('xs:float')) {

				if (this._kind === '-') {
					// TODO: clone
					value.value = -value.value;
				}
				return Sequence.singleton(value);
			}

			return Sequence.singleton(new DoubleValue(Number.NaN));
		};

		return Unary;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(49)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		NumericValue
	) {
		'use strict';

		function DoubleValue (initialValue) {
			NumericValue.call(this, initialValue);
		}

		DoubleValue.prototype = Object.create(NumericValue.prototype);
		DoubleValue.prototype.constructor = DoubleValue;

		DoubleValue.cast = function (value) {
			if (value instanceof DoubleValue) {
				return new DoubleValue(value.value);
			}

			var numericValue = NumericValue.cast(value);
			return new DoubleValue(numericValue.value);
		};

		DoubleValue.primitiveTypeName = DoubleValue.prototype.primitiveTypeName = 'xs:double';

		DoubleValue.prototype.instanceOfType = function (simpleTypeName) {
			return simpleTypeName === this.primitiveTypeName ||
				NumericValue.prototype.instanceOfType.call(this, simpleTypeName);
		};

		return DoubleValue;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(15)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		AnyAtomicTypeValue
	) {
		'use strict';

		/**
		 * Abstract Numeric class, primary type for everything which is numeric: decimal, double and float
		 */
		function NumericValue (initialValue) {
			AnyAtomicTypeValue.call(this, initialValue);
		}

		NumericValue.prototype = Object.create(AnyAtomicTypeValue.prototype);
		NumericValue.prototype.constructor = NumericValue;

		NumericValue.cast = function (value) {
			var anyAtomicTypeValue = AnyAtomicTypeValue.cast(value);
			var floatValue = parseFloat(anyAtomicTypeValue.value, 10);

			return new NumericValue(floatValue);
		};

		NumericValue.prototype.getEffectiveBooleanValue = function () {
			return this.value !== 0 && !Number.isNaN(this.value);
		};

		NumericValue.prototype.instanceOfType = function (simpleTypeName) {
			return simpleTypeName === 'xs:numeric' ||
				AnyAtomicTypeValue.prototype.instanceOfType.call(this, simpleTypeName);
		};

		return NumericValue;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(11),
		__webpack_require__(48),
		__webpack_require__(51),
		__webpack_require__(52),
		__webpack_require__(17),
		__webpack_require__(19),
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Sequence,
		DoubleValue,
		DecimalValue,
		IntegerValue,
		UntypedAtomicValue,
		Selector
	) {
		'use strict';

		/**
		 * @param  {string}    kind             One of +, -, *, div, idiv, mod
		 * @param  {Selector}  firstValueExpr   The selector evaluating to the first value to process
		 * @param  {Selector}  secondValueExpr  The selector evaluating to the second value to process
		 */
		function BinaryNumericOperator (kind, firstValueExpr, secondValueExpr) {
			Selector.call(
				this,
				firstValueExpr.specificity.add(secondValueExpr.specificity),
				Selector.RESULT_ORDER_SORTED);
			this._firstValueExpr = firstValueExpr;
			this._secondValueExpr = secondValueExpr;

			this._kind = kind;
		}

		BinaryNumericOperator.prototype = Object.create(Selector.prototype);
		BinaryNumericOperator.prototype.constructor = BinaryNumericOperator;

		function executeOperator (kind, a, b) {
			switch (kind) {
				case '+':
					return a + b;
				case '-':
					return a - b;
				case '*':
					return a * b;
				case 'div':
					return a / b;
				case 'idiv':
					return Math.abs(a / b);
				case 'mod':
					return a % b;
			}
		}

		BinaryNumericOperator.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof BinaryNumericOperator &&
				this._kind === otherSelector._kind &&
				this._firstValueExpr.equals(otherSelector._firstValueExpr) &&
				this._secondValueExpr.equals(otherSelector._secondValueExpr);
		};

		BinaryNumericOperator.prototype.evaluate = function (dynamicContext) {
			var firstValueSequence = this._firstValueExpr.evaluate(dynamicContext).atomize();
			if (firstValueSequence.isEmpty()) {
				// Shortcut, if the first part is empty, we can return empty.
				// As per spec, we do not have to evaluate the second part, though we could.
				return firstValueSequence;
			}
			var secondValueSequence = this._secondValueExpr.evaluate(dynamicContext);
			if (secondValueSequence.isEmpty()) {
				return secondValueSequence;
			}

			if (!firstValueSequence.isSingleton() || !secondValueSequence.isSingleton()) {
				throw new Error('XPTY0004: the operands of the "' + this._kind + '" operator should be of type xs:numeric?.');
			}

			// Cast both to doubles, if they are xs:untypedAtomic
			var firstValue = firstValueSequence.value[0],
				secondValue = secondValueSequence.value[0];

			if (firstValue instanceof UntypedAtomicValue) {
				firstValue = DoubleValue.cast(firstValue);
			}

			if (secondValue instanceof UntypedAtomicValue) {
				secondValue = DoubleValue.cast(secondValue);
			}

			var result = executeOperator(this._kind, firstValue.value, secondValue.value),
				typedResult;
			// Override for types
			if (this._kind === 'div') {
				typedResult = new DecimalValue(result);
			} else if (this._kind === 'idiv') {
				typedResult = new IntegerValue(result);
			} else {
				// For now, always return a decimal, it's all the same in JavaScript
				typedResult = new DecimalValue(result);
			}
			return Sequence.singleton(typedResult);
		};

		return BinaryNumericOperator;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(49)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		NumericValue
	) {
		'use strict';

		function DecimalValue (initialValue) {
			NumericValue.call(this, initialValue);
		}

		DecimalValue.prototype = Object.create(NumericValue.prototype);
		DecimalValue.prototype.constructor = DecimalValue;

		DecimalValue.cast = function (value) {
			if (value instanceof DecimalValue) {
				return new DecimalValue(value.value);
			}

			var numericValue = NumericValue.cast(value);
			return new DecimalValue(numericValue.value);
		};

		DecimalValue.primitiveTypeName = DecimalValue.prototype.primitiveTypeName = 'xs:decimal';

		DecimalValue.prototype.instanceOfType = function (simpleTypeName) {
			return simpleTypeName === this.primitiveTypeName ||
				NumericValue.prototype.instanceOfType.call(this, simpleTypeName);
		};

		return DecimalValue;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(51)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		DecimalValue
	) {
		'use strict';

		function IntegerValue (initialValue) {
			DecimalValue.call(this, Math.abs(initialValue));
		}

		IntegerValue.prototype = Object.create(DecimalValue.prototype);
		IntegerValue.prototype.constructor = IntegerValue;

		IntegerValue.cast = function (value) {
			if (value instanceof IntegerValue) {
				return new IntegerValue(value.value);
			}

			var decimalValue = DecimalValue.cast(value);

			// Strip off any decimals
			var integerValue = Math.abs(decimalValue.value);

			return new IntegerValue(integerValue);
		};

		IntegerValue.prototype.instanceOfType = function (simpleTypeName) {
			return simpleTypeName === 'xs:integer' ||
				DecimalValue.prototype.instanceOfType.call(this, simpleTypeName);
		};

		return IntegerValue;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(11),
		__webpack_require__(18),
		__webpack_require__(19),

		__webpack_require__(54),
		__webpack_require__(55)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Sequence,
		BooleanValue,
		Selector,

		generalCompare,
		valueCompare
	) {
		'use strict';

		function Compare (kind, firstSelector, secondSelector) {
			Selector.call(
				this,
				firstSelector.specificity.add(secondSelector.specificity),
				Selector.RESULT_ORDER_SORTED);
			this._firstSelector = firstSelector;
			this._secondSelector = secondSelector;

			this._compare = kind[0];
			this._operator = kind[1];

			switch (kind[0]) {
				case 'generalCompare':
					this._comparator = generalCompare;
					break;
				case 'valueCompare':
					this._comparator = valueCompare;
					break;
				case 'nodeCompare':
					throw new Error('NodeCompare is not implemented');
			}
		}

		Compare.prototype = Object.create(Selector.prototype);
		Compare.prototype.constructor = Compare;

		Compare.prototype.equals = function (otherSelector) {
			if (otherSelector === this) {
				return true;
			}
			return otherSelector instanceof Compare &&
				this._firstSelector.equals(otherSelector._firstSelector) &&
				this._secondSelector.equals(otherSelector._secondSelector);
		};

		Compare.prototype.evaluate = function (dynamicContext) {
			var firstSequence = this._firstSelector.evaluate(dynamicContext),
				secondSequence = this._secondSelector.evaluate(dynamicContext);

			if (this._compare === 'valueCompare' && (firstSequence.isEmpty() || secondSequence.isEmpty())) {
				return Sequence.empty();
			}

			// Atomize both sequences
			var firstAtomizedSequence = firstSequence.atomize();
			var secondAtomizedSequence = secondSequence.atomize();
			var booleanValue = this._comparator(this._operator, firstAtomizedSequence, secondAtomizedSequence) ?
				BooleanValue.TRUE :
				BooleanValue.FALSE;
			return Sequence.singleton(booleanValue);
		};

		return Compare;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(11),
		__webpack_require__(55)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Sequence,
		valueCompare
	) {
		'use strict';

		var OPERATOR_TRANSLATION = {
				'=': 'eq',
				'>': 'gt',
				'<': 'lt',
				'!=': 'ne',
				'<=': 'le',
				'>=': 'ge'
			};

		return function generalCompare(operator, firstSequence, secondSequence) {
			// Atomize both sequences
			var firstAtomizedSequence = firstSequence.atomize();
			var secondAtomizedSequence = secondSequence.atomize();

			// Change operator to equivalent valueCompare operator
			operator = OPERATOR_TRANSLATION[operator];

			return firstAtomizedSequence.value.some(function (firstValue) {
				var firstSingletonSequence = Sequence.singleton(firstValue);
				return secondAtomizedSequence.value.some(function (secondValue) {
					return valueCompare(operator, firstSingletonSequence, Sequence.singleton(secondValue));
				});
			});
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(11),
		__webpack_require__(17),
		__webpack_require__(14),
		__webpack_require__(56),
		__webpack_require__(48)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Sequence,
		UntypedAtomicValue,
		StringValue,
		FloatValue,
		DoubleValue
	) {
		'use strict';

		return function valueCompare (operator, firstSequence, secondSequence) {
			// https://www.w3.org/TR/xpath-3/#doc-xpath31-ValueComp
			if (!firstSequence.isSingleton() || !secondSequence.isSingleton()) {
				throw new Error('XPTY0004: Sequences to compare are not singleton');
			}

			var firstValue = firstSequence.value[0],
				secondValue = secondSequence.value[0];

			if (firstValue instanceof UntypedAtomicValue) {
				firstValue = StringValue.cast(firstValue);
			}

			if (secondValue instanceof UntypedAtomicValue) {
				secondValue = StringValue.cast(secondValue);
			}

			if (firstValue.primitiveTypeName !== secondValue.primitiveTypeName) {
				if ((firstValue.instanceOfType('xs:string') || firstValue.instanceOfType('xs:anyURI')) &&
					(secondValue.instanceOfType('xs:string') || secondValue.instanceOfType('xs:anyURI'))) {
					firstValue = StringValue.cast(firstValue);
					secondValue = StringValue.cast(secondValue);
				}
				else if ((firstValue.instanceOfType('xs:decimal') || firstValue.instanceOfType('xs:float')) &&
						(secondValue.instanceOfType('xs:decimal') || secondValue.instanceOfType('xs:float'))) {
					firstValue = FloatValue.cast(firstValue);
					secondValue = FloatValue.cast(secondValue);
				}
				else if ((firstValue.instanceOfType('xs:decimal') || firstValue.instanceOfType('xs:float') || firstValue.instanceOfType('xs:double')) &&
						(secondValue.instanceOfType('xs:decimal') || secondValue.instanceOfType('xs:float') || secondValue.instanceOfType('xs:double'))) {
					firstValue = DoubleValue.cast(firstValue);
					secondValue = DoubleValue.cast(secondValue);
				}
				else {
					throw new Error('XPTY0004: Values to compare are not of the same type');
				}
			}

			switch (operator) {
				case 'eq':
					return firstValue.value === secondValue.value;
				case 'ne':
					return firstValue.value !== secondValue.value;
				case 'lt':
					return firstValue.value < secondValue.value;
				case 'le':
					return firstValue.value <= secondValue.value;
				case 'gt':
					return firstValue.value > secondValue.value;
				case 'ge':
					return firstValue.value >= secondValue.value;
			}
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(49)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		NumericValue
	) {
		'use strict';

		function FloatValue (initialValue) {
			NumericValue.call(this, initialValue);
		}

		FloatValue.prototype = Object.create(NumericValue.prototype);
		FloatValue.prototype.constructor = FloatValue;

		FloatValue.cast = function (value) {
			if (value instanceof FloatValue) {
				return new FloatValue(value.value);
			}

			// In JavaScript, doubles are the same as decimals
			var decimalValue = NumericValue.cast(value);
			return new FloatValue(parseFloat(decimalValue.value, 10));
		};

		FloatValue.primitiveTypeName = FloatValue.prototype.primitiveTypeName = 'xs:float';

		FloatValue.prototype.instanceOfType = function (simpleTypeName) {
			return simpleTypeName === this.primitiveTypeName ||
				NumericValue.prototype.instanceOfType.call(this, simpleTypeName);
		};


		return FloatValue;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(11),
		__webpack_require__(18),
		__webpack_require__(19)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Sequence,
		BooleanValue,
		Selector
	) {
		'use strict';

		function InstanceOfOperator (expression, typeTest, multiplicity) {
			Selector.call(
				this,
				expression.specificity,
				Selector.RESULT_ORDER_UNSORTED
			);

			this._expression = expression;
			this._typeTest = typeTest;
			this._multiplicity = multiplicity;
		}

		InstanceOfOperator.prototype = Object.create(Selector.prototype);
		InstanceOfOperator.prototype.constructor = InstanceOfOperator;

		InstanceOfOperator.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof InstanceOfOperator &&
				this._multiplicity === otherSelector._multiplicity &&
				this._expression.equals(otherSelector._expression) &&
				this._typeTest.equals(otherSelector._typeTest);
		};

		InstanceOfOperator.prototype.evaluate = function (dynamicContext) {
			var evaluatedExpression = this._expression.evaluate(dynamicContext);

			switch (this._multiplicity) {
				case '?':
					if (!evaluatedExpression.isEmpty() && !evaluatedExpression.isSingleton()) {
						return Sequence.singleton(BooleanValue.FALSE);
					}
					break;

				case '+':
					if (evaluatedExpression.isEmpty()) {
						return Sequence.singleton(BooleanValue.FALSE);
					}
					break;

				case '*':
					break;

				default:
					if (!evaluatedExpression.isSingleton()) {
						return Sequence.singleton(BooleanValue.FALSE);
					}
			}

			var isInstanceOf = evaluatedExpression.value.every(function (argumentItem) {
				var scopedContext = dynamicContext.createScopedContext({ contextItem: Sequence.singleton(argumentItem) });
				return this._typeTest.evaluate(scopedContext).getEffectiveBooleanValue();
			}.bind(this));

			return Sequence.singleton(isInstanceOf ? BooleanValue.TRUE : BooleanValue.FALSE);
		};

		return InstanceOfOperator;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(18),
		__webpack_require__(11)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		BooleanValue,
		Sequence
	) {
		'use strict';

		function QuantifiedExpression (quantifier, inClauses, satisfiesExpr) {
			var specificity = inClauses.reduce(
					function (specificity, inClause) {
						return specificity.add(inClause[1].specificity);
					}, satisfiesExpr.specificity);
			Selector.call(this, specificity, Selector.RESULT_ORDER_SORTED);

			this._quantifier = quantifier;
			this._inClauses = inClauses;
			this._satisfiesExpr = satisfiesExpr;
		}

		QuantifiedExpression.prototype = Object.create(Selector.prototype);
		QuantifiedExpression.prototype.constructor = QuantifiedExpression;

		QuantifiedExpression.prototype.equals = function (otherSelector) {
			if (otherSelector === this) {
				return true;
			}

			if (this._inClauses.length !== otherSelector._inClauses.length) {
				return false;
			}

			return otherSelector instanceof QuantifiedExpression &&
				this._quantifier === otherSelector._quantifier &&
				this._satisfiesExpr.equals(otherSelector._satisfiesExpr) &&
				this._inClauses.every(function (inClause, index) {
					return inClause[0] === otherSelector._inClauses[index][0] &&
						inClause[1].equals(otherSelector._inClauses[index][1]);
				});
		};

		QuantifiedExpression.prototype.evaluate = function (dynamicContext) {
			var evaluatedInClauses = this._inClauses.map(function (inClause) {
					return {
						name: inClause[0],
						valueSequence: inClause[1].evaluate(dynamicContext)
					};
				});

			var indices = new Array(evaluatedInClauses.length).fill(0);
			indices[0] = -1;

			var hasOverflowed = true;
			while (hasOverflowed) {
				hasOverflowed = false;
				for (var i in indices) {
					if (++indices[i] > evaluatedInClauses[i].valueSequence.value.length - 1) {
						indices[i] = 0;
						continue;
					}

					var variables = Object.create(null);

					for (var y = 0; y < indices.length; y++) {
						var value = evaluatedInClauses[y].valueSequence.value[indices[y]];
						variables[evaluatedInClauses[y].name] = Sequence.singleton(value);
					}

					var context = dynamicContext.createScopedContext({
							variables: variables
						});

					var result = this._satisfiesExpr.evaluate(context);

					if (result.getEffectiveBooleanValue() && this._quantifier === 'some') {
						return Sequence.singleton(BooleanValue.TRUE);
					}
					else if (!result.getEffectiveBooleanValue() && this._quantifier === 'every') {
						return Sequence.singleton(BooleanValue.FALSE);
					}
					hasOverflowed = true;
					break;
				}
			}

			// An every quantifier is true if all items match, a some is false if none of the items match
			return Sequence.singleton(this._quantifier === 'every' ? BooleanValue.TRUE : BooleanValue.FALSE);
		};

		return QuantifiedExpression;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector
	) {
		'use strict';

		function IfExpression (testExpression, thenExpression, elseExpression) {
			var specificity = testExpression.specificity
				.add(thenExpression.specificity)
				.add(elseExpression.specificity);
			Selector.call(
				this,
				specificity,
				thenExpression.expectedResultOrder === elseExpression.expectedResultOrder ?
					thenExpression.expectedResultOrder : this.RESULT_ORDER_UNSORTED);

			this._testExpression = testExpression;
			this._thenExpression = thenExpression;
			this._elseExpression = elseExpression;
		}

		IfExpression.prototype = Object.create(Selector.prototype);
		IfExpression.prototype.constructor = IfExpression;

		IfExpression.prototype.equals = function (otherSelector) {
			if (otherSelector === this) {
				return true;
			}

			return otherSelector instanceof IfExpression &&
				this._testExpression.equals(otherSelector._testExpression) &&
				this._thenExpression.equals(otherSelector._thenExpression) &&
				this._elseExpression.equals(otherSelector._elseExpression);
		};

		IfExpression.prototype.evaluate = function (dynamicContext) {
			if (this._testExpression.evaluate(dynamicContext).getEffectiveBooleanValue()) {
				return this._thenExpression.evaluate(dynamicContext);
			}
			return this._elseExpression.evaluate(dynamicContext);
		};

		return IfExpression;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(18),
		__webpack_require__(51),
		__webpack_require__(48),
		__webpack_require__(52),
		__webpack_require__(14),

		__webpack_require__(10),
		__webpack_require__(19),
		__webpack_require__(11)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		BooleanValue,
		DecimalValue,
		DoubleValue,
		IntegerValue,
		StringValue,

		Specificity,
		Selector,
		Sequence
	) {
		'use strict';

		function Literal (value, type) {
			Selector.call(this, new Specificity({}), Selector.RESULT_ORDER_UNSORTED);
			this._type = type;

			var typedValue;
			switch (type) {
				case 'xs:integer':
					typedValue = new IntegerValue(value);
					break;
				case 'xs:string':
					typedValue = new StringValue(value);
					break;
				case 'xs:decimal':
					typedValue = new DecimalValue(value);
					break;
				case 'xs:double':
					typedValue = new DoubleValue(value);
					break;
				default:
					throw new TypeError('Type ' + type + ' not expected in a literal');
			}

			this._valueSequence = Sequence.singleton(typedValue);
		}

		Literal.prototype = Object.create(Selector.prototype);
		Literal.prototype.constructor = Literal;

		Literal.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof Literal &&
				this._type === otherSelector._type &&
				this._valueSequence.length === otherSelector._valueSequence.length &&
				this._valueSequence.value.every(function (xPathValue, i) {
					return otherSelector._valueSequence.value[i].primitiveTypeName === xPathValue.primitiveTypeName &&
						otherSelector._valueSequence.value[i].value === xPathValue.value;
				});
		};

		Literal.prototype.evaluate = function (dynamicContext) {
			return this._valueSequence;
		};

		return Literal;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector
	) {
		'use strict';

		/**
		 * @param  {String}    rangeVariable
		 * @param  {Selector}  bindingSequence
		 * @param  {Selector}  returnExpression
		 */
		function LetExpression (rangeVariable, bindingSequence, returnExpression) {
			Selector.call(
				this, bindingSequence.specificity.add(returnExpression.specificity),
				returnExpression.expectedResultOrder);

			this._rangeVariable = rangeVariable;
			this._bindingSequence = bindingSequence;
			this._returnExpression = returnExpression;
		}

		LetExpression.prototype = Object.create(Selector.prototype);
		LetExpression.prototype.constructor = LetExpression;

		LetExpression.prototype.equals = function (otherSelector) {
			if (otherSelector === this) {
				return true;
			}

			return otherSelector instanceof LetExpression &&
				this._rangeVariable === otherSelector._rangeVariable &&
				this._bindingSequence.equals(otherSelector._bindingSequence) &&
				this._returnExpression.equals(otherSelector._returnExpression);
		};

		LetExpression.prototype.evaluate = function (dynamicContext) {
			var newVariables = Object.create(null);
			newVariables[this._rangeVariable] = this._bindingSequence.evaluate(dynamicContext);
			return this._returnExpression.evaluate(
				dynamicContext.createScopedContext({
					variables: newVariables
				}));
		};

		return LetExpression;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(10),
		__webpack_require__(11),
		__webpack_require__(63),
		__webpack_require__(64)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Specificity,
		Sequence,
		FunctionItem,
		functionRegistry
	) {
		'use strict';

		function NamedFunctionRef (functionName, arity) {
			Selector.call(this, new Specificity({external: 1}), Selector.RESULT_ORDER_UNSORTED);

			this._functionName = functionName;
			this._arity = arity;

			var functionProperties = functionRegistry.getFunctionByArity(this._functionName, this._arity);

			if (!functionProperties) {
				throw new Error('XPST0017: Function ' + functionName + ' with arity of ' + arity + ' not registered. ' + functionRegistry.getAlternativesAsStringFor(functionName));
			}

			this._functionItem = new FunctionItem(
				functionProperties.callFunction,
				functionProperties.argumentTypes,
				arity,
				functionProperties.returnType);
		}

		NamedFunctionRef.prototype = Object.create(Selector.prototype);
		NamedFunctionRef.prototype.constructor = NamedFunctionRef;

		NamedFunctionRef.prototype.equals = function (otherSelector) {
			if (this === otherSelector) {
				return true;
			}

			return otherSelector instanceof NamedFunctionRef &&
				this._functionName === otherSelector._functionName &&
				this._arity === otherSelector._arity;
		};

		NamedFunctionRef.prototype.evaluate = function (dynamicContext) {
			return Sequence.singleton(this._functionItem);
		};

		return NamedFunctionRef;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(12)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Item
	) {
		'use strict';

		function FunctionItem (value, argumentTypes, arity, returnType) {
			Item.call(this, value);

			this._argumentTypes = argumentTypes;
			this._arity = arity;
			this._returnType = returnType;
		}

		FunctionItem.prototype = Object.create(Item.prototype);
		FunctionItem.prototype.constructor = FunctionItem;

		FunctionItem.prototype.atomize = function () {
			throw new Error('FOTY0013: Not supported on this type');
		};

		FunctionItem.prototype.getEffectiveBooleanValue = function () {
			throw new Error('FORG0006: Not supported on this type');
		};

		FunctionItem.prototype.instanceOfType = function (simpleTypeName) {
			return simpleTypeName === 'function(*)' ||
				Item.prototype.instanceOfType.call(this, simpleTypeName);
		};

		FunctionItem.prototype.getArgumentTypes = function () {
			return this._argumentTypes;
		};

		FunctionItem.prototype.getReturnType = function () {
			return this._returnType;
		};

		FunctionItem.prototype.getArity = function () {
			return this._arity;
		};

		return FunctionItem;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(65),

		__webpack_require__(18),
		__webpack_require__(11),

		__webpack_require__(68)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		builtInFunctions,

		BooleanValue,
		Sequence,

		customTestsByName
	) {
		'use strict';

		var registeredFunctionsByName = Object.create(null);

		function computeLevenshteinDistance (a, b) {
			var computedDistances = [];
			for (var i = 0; i < a.length + 1; ++i) {
				computedDistances[i] = [];
			}
			return (function computeStep (aLen, bLen) {
				if (aLen === 0) {
					// At the end of the a string, need to add / delete b characters
					return bLen;
				}
				if (bLen === 0) {
					// At the end of the b string, need to add / delete bLen characters
					return aLen;
				}

				if (computedDistances[aLen][bLen] !== undefined) {
					return computedDistances[aLen][bLen];
				}

				var cost = 0;
				if (a[aLen - 1] !== b[bLen - 1]) {
					// need to change this character
					cost = 1;
				}

				// Return the minimum of deleting from a, deleting from b or deleting from both
				var distance = Math.min(
						computeStep(aLen - 1, bLen) + 1,
						computeStep(aLen, bLen - 1) + 1,
						computeStep(aLen - 1, bLen - 1) + cost);

				computedDistances[aLen][bLen] = distance;
				return distance;
			})(a.length, b.length);
		}

		function getAlternativesAsStringFor (functionName) {
			var alternativeFunctions;
			if (!registeredFunctionsByName[functionName]) {
				// Get closest functions by levenstein distance
				alternativeFunctions = Object.keys(registeredFunctionsByName)
					.map(function (alternativeName) {
						return {
							name: alternativeName,
							distance: computeLevenshteinDistance(functionName, alternativeName)
						};
					})
					.sort(function (a, b) {
						return a.distance - b.distance;
					})
					.slice(0, 5)
					.filter(function (alternativeNameWithScore) {
						// If we need to change more than half the string, it cannot be a match
						return alternativeNameWithScore.distance < functionName.length / 2;
					})
					.reduce(function (alternatives, alternativeNameWithScore) {
						return alternatives.concat(registeredFunctionsByName[alternativeNameWithScore.name]);
					}, [])
					.slice(0, 5);
			}
			else {
				alternativeFunctions = registeredFunctionsByName[functionName];
			}

			if (!alternativeFunctions.length) {
				return 'No similar functions found.';
			}

			return alternativeFunctions.map(function (functionDeclaration) {
				return '"' + functionDeclaration.name + '(' + functionDeclaration.argumentTypes.join(', ') + ')"';
			}).reduce(function (accumulator, functionName, index, array) {
				if (index === 0) {
					return accumulator + functionName;
				}
				return accumulator += ((index !== array.length - 1) ? ', ' : ' or ')  + functionName;
			}, 'Did you mean ') + '?';
		}

		// Deprecated
		function getCustomTestByArity (functionName, arity) {
			var customFunctionViaCustomTestsByName = customTestsByName[functionName];

			if (customFunctionViaCustomTestsByName) {
				var callFunction = function () {
					var args = Array.from(arguments),
						dynamicContext = args.shift(),
						result = customFunctionViaCustomTestsByName.apply(
							undefined,
							args.map(function (arg) { return arg.value[0].value; }).concat(
								[dynamicContext.contextItem.value[0].value,
								dynamicContext.domFacade]));

					return Sequence.singleton(result ? BooleanValue.TRUE : BooleanValue.FALSE);
				};

				return {
						callFunction: callFunction,
						argumentTypes: new Array(arity).fill('xs:string'),
						returnType: 'xs:boolean'
					};
			}

			return null;
		}

		function getBuiltinOrCustomFunctionByArity (functionName, arity) {
			var matchingFunctions = registeredFunctionsByName[functionName];

			if (!matchingFunctions) {
				return null;
			}

			var matchingFunction = matchingFunctions.find(function (functionDeclaration) {
				var indexOfRest = functionDeclaration.argumentTypes.indexOf('...');
				if (indexOfRest > -1) {
					return indexOfRest <= arity;
				}
				return functionDeclaration.argumentTypes.length === arity;
			});

			if (!matchingFunction) {
				return null;
			}

			return {
					callFunction: matchingFunction.callFunction,
					argumentTypes: matchingFunction.argumentTypes,
					returnType: matchingFunction.returnType
				};
		}

		function getFunctionByArity (functionName, arity) {
			var fn = getBuiltinOrCustomFunctionByArity(functionName, arity);

			// Deprecated
			if (!fn && functionName.startsWith('fonto:')) {
				var test = getCustomTestByArity(functionName, arity);
				if (test) {
					return test;
				}
			}

			return fn;
		}

		function registerFunction (name, argumentTypes, returnType, callFunction) {
			if (!registeredFunctionsByName[name]) {
				registeredFunctionsByName[name] = [];
			}
			registeredFunctionsByName[name].push({name: name, argumentTypes: argumentTypes, returnType: returnType, callFunction: callFunction});
		}

		// bootstrap builtin functions
		builtInFunctions.forEach(function (builtInFunction) {
			registerFunction(builtInFunction.name, builtInFunction.argumentTypes, builtInFunction.returnType, builtInFunction.callFunction);
		});

		return {
			getAlternativesAsStringFor: getAlternativesAsStringFor,
			getFunctionByArity: getFunctionByArity,
			registerFunction: registerFunction
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(66),

		__webpack_require__(18),
		__webpack_require__(48),
		__webpack_require__(56),
		__webpack_require__(52),
		__webpack_require__(13),
		__webpack_require__(67),
		__webpack_require__(11),
		__webpack_require__(14),
		__webpack_require__(23)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		aggregateBuiltinFunctions,

		BooleanValue,
		DoubleValue,
		FloatValue,
		IntegerValue,
		NodeValue,
		QNameValue,
		Sequence,
		StringValue,
		sortNodeValues
	) {
		'use strict';

		function contextItemAsFirstArgument (fn, dynamicContext) {
			return fn(dynamicContext, dynamicContext.contextItem);
		}

		function fnBoolean (dynamicContext, sequence) {
			return Sequence.singleton(sequence.getEffectiveBooleanValue() ? BooleanValue.TRUE : BooleanValue.FALSE);
		}

		function fnConcat (dynamicContext) {
			var stringSequences = Array.from(arguments).slice(1);
			stringSequences = stringSequences.map(function (sequence) { return sequence.atomize(); });
			var strings = stringSequences.map(function (sequence) {
					if (sequence.isEmpty()) {
						return '';
					}
					return sequence.value[0].value;
				});
			return Sequence.singleton(new StringValue(strings.join('')));
		}

		function fnFalse () {
			return Sequence.singleton(BooleanValue.FALSE);
		}

		function findDescendants (domFacade, node, isMatch) {
			var results = domFacade.getChildNodes(node)
				.reduce(function (matchingNodes, childNode) {
					Array.prototype.push.apply(matchingNodes, findDescendants(domFacade, childNode, isMatch));
					return matchingNodes;
				}, []);
			if (isMatch(node)) {
				results.unshift(node);
			}
			return results;
		}

		function fnId (dynamicContext, idrefSequence, targetNodeSequence) {
			var targetNodeValue = targetNodeSequence.value[0];
			if (!targetNodeValue.instanceOfType('node()')) {
				return Sequence.empty();
			}
			var domFacade = dynamicContext.domFacade;
			// TODO: Index ids to optimize this lookup
			var isMatchingIdById = idrefSequence.value.reduce(function (byId, idrefValue) {
					idrefValue.value.split(/\s+/).forEach(function (id) {
						byId[id] = true;
					});
					return byId;
				}, Object.create(null));
			var documentNode = targetNodeValue.value.nodeType === targetNodeValue.value.DOCUMENT_NODE ?
				targetNodeValue.value : targetNodeValue.value.ownerDocument;

			var matchingNodes = findDescendants(
					domFacade,
					documentNode,
					function (node) {
						// TODO: use the is-id property of attributes / elements
						if (node.nodeType !== node.ELEMENT_NODE) {
							return false;
						}
						var idAttribute = domFacade.getAttribute(node, 'id');
						if (!idAttribute) {
							return false;
						}
						if (!isMatchingIdById[idAttribute]) {
							return false;
						}
						// Only return the first match, per id
						isMatchingIdById[idAttribute] = false;
						return true;
					}, true);
			return new Sequence(matchingNodes.map(function (node) {
				return new NodeValue(domFacade, node);
			}));
		}

		function fnIdref (dynamicContext, idSequence, targetNodeSequence) {
			var targetNodeValue = targetNodeSequence.value[0];
			if (!targetNodeValue.instanceOfType('node()')) {
				return Sequence.empty();
			}
			var domFacade = dynamicContext.domFacade;
			var isMatchingIdRefById = idSequence.value.reduce(function (byId, idValue) {
					byId[idValue.value] = true;
					return byId;
				}, Object.create(null));
			var documentNode = targetNodeValue.value.nodeType === targetNodeValue.value.DOCUMENT_NODE ?
				targetNodeValue.value : targetNodeValue.value.ownerDocument;
			// TODO: Index idrefs to optimize this lookup
			var matchingNodes = findDescendants(
					domFacade,
					documentNode,
					function (node) {
						// TODO: use the is-idrefs property of attributes / elements
						if (node.nodeType !== node.ELEMENT_NODE) {
							return false;
						}
						var idAttribute = domFacade.getAttribute(node, 'idref');
						if (!idAttribute) {
							return false;
						}
						var idRefs = idAttribute.split(/\s+/);
						return idRefs.some(function (idRef) {
							return isMatchingIdRefById[idRef];
						});
					}, true);
			return new Sequence(matchingNodes.map(function (node) {
				return new NodeValue(domFacade, node);
			}));
		}

		function fnLast (dynamicContext) {
			return Sequence.singleton(new IntegerValue(dynamicContext.contextSequence.value.length));
		}

		function fnName (dynamicContext, sequence) {
			if (sequence.isEmpty()) {
				return sequence;
			}
			return fnString(dynamicContext, fnNodeName(dynamicContext, sequence));
		}

		function fnNodeName (dynamicContext, sequence) {
			if (sequence.isEmpty()) {
				return sequence;
			}
			var nodeName = sequence.value[0].nodeName;
			if (nodeName === null) {
				return Sequence.empty();
			}
			return Sequence.singleton(new QNameValue(nodeName));
		}

		function fnNormalizeSpace (dynamicContext, arg) {
			if (arg.isEmpty()) {
				return Sequence.singleton(new StringValue(''));
			}
			var string = arg.value[0].value.trim();
			return Sequence.singleton(new StringValue(string.replace(/\s+/g, ' ')));
		}

		function fnNumber (dynamicContext, sequence) {
			if (sequence.isEmpty()) {
				return Sequence.singleton(new DoubleValue(NaN));
			}
			return Sequence.singleton(DoubleValue.cast(sequence.value[0]));
		}

		function fnPosition (dynamicContext) {
			// Note: +1 because XPath is one-based
			return Sequence.singleton(new IntegerValue(dynamicContext.contextSequence.value.indexOf(dynamicContext.contextItem.value[0]) + 1));
		}

		function fnReverse (dynamicContext, sequence) {
			return new Sequence(sequence.value.reverse());
		}

		function fnStartsWith (dynamicContext, arg1, arg2) {
			var startsWith = !arg2.isEmpty() ? arg2.value[0].value : '';
			if (startsWith.length === 0) {
				return Sequence.singleton(BooleanValue.TRUE);
			}
			var stringToTest = !arg1.isEmpty() ? arg1.value[0].value : '';
			if (stringToTest.length === 0) {
				return Sequence.singleton(BooleanValue.FALSE);
			}
			// TODO: choose a collation, this defines whether eszett (ß) should equal 'ss'
			if (stringToTest.startsWith(startsWith)) {
				return Sequence.singleton(BooleanValue.TRUE);
			}
			return Sequence.singleton(BooleanValue.FALSE);
		}

		function fnEndsWith (dynamicContext, arg1, arg2) {
			var endsWith = !arg2.isEmpty() ? arg2.value[0].value : '';
			if (endsWith.length === 0) {
				return Sequence.singleton(BooleanValue.TRUE);
			}
			var stringToTest = !arg1.isEmpty() ? arg1.value[0].value : '';
			if (stringToTest.length === 0) {
				return Sequence.singleton(BooleanValue.FALSE);
			}
			// TODO: choose a collation, this defines whether eszett (ß) should equal 'ss'
			if (stringToTest.endsWith(endsWith)) {
				return Sequence.singleton(BooleanValue.TRUE);
			}
			return Sequence.singleton(BooleanValue.FALSE);
		}

		function fnString (dynamicContext, sequence) {
			if (sequence.isEmpty()) {
				return Sequence.singleton(new StringValue(''));
			}
			if (sequence.value[0].instanceOfType('node()')) {
				return Sequence.singleton(sequence.value[0].getStringValue());
			}
			return Sequence.singleton(StringValue.cast(sequence.value[0]));
		}

		function fnStringJoin (dynamicContext, sequence, separator) {
			var separatorString = separator.value[0].value,
				joinedString = sequence.value.map(function (stringValue) {
					return stringValue.value;
				}).join(separatorString);
			return Sequence.singleton(new StringValue(joinedString));
		}

		function fnStringLength (dynamicContext, sequence) {
			if (sequence.isEmpty()) {
				return Sequence.singleton(new IntegerValue(0));
			}
			// In ES6, Array.from(💩).length === 1
			return Sequence.singleton(new IntegerValue(Array.from(sequence.value[0].value).length));
		}

		function fnTokenize (dynamicContext, input, pattern, flags) {
			if (input.isEmpty() || input.value[0].value.length === 0) {
				return Sequence.empty();
			}
			var string = input.value[0].value,
				patternString = pattern.value[0].value;
			return new Sequence(
				string.split(new RegExp(patternString))
					.map(function (token) {return new StringValue(token);}));
		}

		function fnTrue () {
			return Sequence.singleton(BooleanValue.TRUE);
		}

		function opTo (dynamicContext, fromValue, toValue) {
			var from = fromValue.value[0].value,
				to = toValue.value[0].value;
			if (from > to) {
				return Sequence.empty();
			}
			// RangeExpr is inclusive: 1 to 3 will make (1,2,3)
			return new Sequence(
				Array.apply(null, {length: to - from + 1})
					.map(function (_, i) {
						return new IntegerValue(from+i);
					}));
		}

		function opExcept (dynamicContext, firstNodes, secondNodes) {
			var allNodes = firstNodes.value.filter(function (nodeA) {
					return secondNodes.value.every(function (nodeB) {
						return nodeA !== nodeB;
					});
				});
			return new Sequence(sortNodeValues(dynamicContext.domFacade, allNodes));
		}

		function opIntersect (dynamicContext, firstNodes, secondNodes) {
			var allNodes = firstNodes.value.filter(function (nodeA) {
					return secondNodes.value.some(function (nodeB) {
						return nodeA === nodeB;
					});
				});
			return new Sequence(sortNodeValues(dynamicContext.domFacade, allNodes));
		}

		function fnNot (dynamicContext, sequence) {
			return Sequence.singleton(sequence.getEffectiveBooleanValue() ? BooleanValue.FALSE : BooleanValue.TRUE);
		}

		return [
			{
				name: 'boolean',
				argumentTypes: ['item()*'],
				returnType: 'xs:boolean',
				callFunction: fnBoolean
			},

			{
				name: 'concat',
				argumentTypes: ['xs:anyAtomicType?', 'xs:anyAtomicType?', '...'],
				returnType: 'xs:string',
				callFunction: fnConcat
			},

			{
				name: 'ends-with',
				argumentTypes: ['xs:string?', 'xs:string?'],
				returnType: 'xs:boolean',
				callFunction: fnEndsWith
			},

			{
				name: 'ends-with',
				argumentTypes: ['xs:string?', 'xs:string?', 'xs:string'],
				returnType: 'xs:boolean',
				callFunction: function () {
					throw new Error('Not implemented: Specifying a collation is not supported');
				}
			},

			{
				name: 'false',
				argumentTypes: [],
				returnType: 'xs:boolean',
				callFunction: fnFalse
			},

			{
				name: 'id',
				argumentTypes: ['xs:string*', 'node()'],
				returnType: 'element()*',
				callFunction: fnId
			},

			{
				name: 'id',
				argumentTypes: ['xs:string*'],
				returnType: 'element()*',
				callFunction: function (dynamicContext, strings) {
					return fnId(dynamicContext, strings, dynamicContext.contextItem);
				}
			},

			{
				name: 'idref',
				argumentTypes: ['xs:string*', 'node()'],
				returnType: 'node()*',
				callFunction: fnIdref
			},

			{
				name: 'idref',
				argumentTypes: ['xs:string*'],
				returnType: 'node()*',
				callFunction: function (dynamicContext, strings) {
					return fnIdref(dynamicContext, strings, dynamicContext.contextItem);
				}
			},

			{
				name: 'last',
				argumentTypes: [],
				returnType: 'xs:integer',
				callFunction: fnLast
			},

			{
				name: 'name',
				argumentTypes: ['node()?'],
				returnType: 'xs:string',
				callFunction: fnName
			},

			{
				name: 'name',
				argumentTypes: [],
				returnType: 'xs:string',
				callFunction: contextItemAsFirstArgument.bind(undefined, fnName)
			},

			{
				name: 'node-name',
				argumentTypes: ['node()?'],
				returnType: 'xs:QName?',
				callFunction: fnNodeName
			},

			{
				name: 'node-name',
				argumentTypes: [],
				returnType: 'xs:QName?',
				callFunction: contextItemAsFirstArgument.bind(undefined, fnNodeName)
			},

			{
				name: 'normalize-space',
				argumentTypes: ['xs:string?'],
				returnType: 'xs:string',
				callFunction: fnNormalizeSpace
			},

			{
				name: 'normalize-space',
				argumentTypes: [],
				returnType: 'xs:string',
				callFunction: function (dynamicContext) {
					return fnNormalizeSpace(dynamicContext, fnString(dynamicContext, dynamicContext.contextItem));
				}
			},

			{
				name: 'not',
				argumentTypes: ['item()*'],
				returnType: 'xs:boolean',
				callFunction: fnNot
			},

			{
				name: 'number',
				argumentTypes: ['xs:anyAtomicType?'],
				returnType: 'xs:double',
				callFunction: fnNumber
			},

			{
				name: 'number',
				argumentTypes: [],
				returnType: 'xs:double',
				callFunction: contextItemAsFirstArgument.bind(undefined, fnNumber)
			},

			{
				name: 'op:except',
				argumentTypes: ['node()*', 'node()*'],
				returnType: 'node()*',
				callFunction: opExcept
			},

			{
				name: 'op:intersect',
				argumentTypes: ['node()*', 'node()*'],
				returnType: 'node()*',
				callFunction: opIntersect
			},

			{
				name: 'op:to',
				argumentTypes: ['xs:integer', 'xs:integer'],
				returnType: 'xs:integer*',
				callFunction: opTo
			},

			{
				name: 'position',
				argumentTypes: [],
				returnType: 'xs:integer',
				callFunction: fnPosition
			},

			{
				name: 'reverse',
				argumentTypes: ['item()*'],
				returnType: 'item()*',
				callFunction: fnReverse
			},

			{
				name: 'starts-with',
				argumentTypes: ['xs:string?', 'xs:string?'],
				returnType: 'xs:boolean',
				callFunction: fnStartsWith
			},

			{
				name: 'starts-with',
				argumentTypes: ['xs:string?', 'xs:string?', 'xs:string'],
				returnType: 'xs:boolean',
				callFunction: function () {
					throw new Error('Not implemented: Specifying a collation is not supported');
				}
			},

			{
				name: 'string',
				argumentTypes: ['item()?'],
				returnType: 'xs:string',
				callFunction: fnString
			},

			{
				name: 'string',
				argumentTypes: [],
				returnType: 'xs:string',
				callFunction: contextItemAsFirstArgument.bind(undefined, fnString)
			},

			{
				name: 'string-join',
				argumentTypes: ['xs:string*', 'xs:string'],
				returnType: 'xs:string',
				callFunction: fnStringJoin
			},

			{
				name: 'string-join',
				argumentTypes: ['xs:string*'],
				returnType: 'xs:string',
				callFunction: function (dynamicContext, arg1) {
					return fnStringJoin(dynamicContext, arg1, Sequence.singleton(new StringValue('')));
				}
			},

			{
				name: 'string-length',
				argumentTypes: ['xs:string?'],
				returnType: 'xs:integer',
				callFunction: fnStringLength
			},

			{
				name: 'string-length',
				argumentTypes: [],
				returnType: 'xs:integer',
				callFunction: function (dynamicContext) {
					return fnStringLength(dynamicContext, fnString(dynamicContext, dynamicContext.contextItem));
				}
			},

			{
				name: 'tokenize',
				argumentTypes: ['xs:string?', 'xs:string', 'xs:string'],
				returnType: 'xs:string*',
				callFunction: function (dynamicContext, input, pattern, flags) {
					throw new Error('Not implemented: Using flags in tokenize is not supported');
				}
			},

			{
				name: 'tokenize',
				argumentTypes: ['xs:string?', 'xs:string'],
				returnType: 'xs:string*',
				callFunction: fnTokenize
			},

			{
				name: 'tokenize',
				argumentTypes: ['xs:string?'],
				returnType: 'xs:string*',
				callFunction: function (dynamicContext, input) {
					return fnTokenize(dynamicContext, fnNormalizeSpace(dynamicContext, input), Sequence.singleton(new StringValue(' ')));
				}
			},

			{
				name: 'true',
				argumentTypes: [],
				returnType: 'xs:boolean',
				callFunction: fnTrue
			}
		].concat(aggregateBuiltinFunctions);
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(18),
		__webpack_require__(51),
		__webpack_require__(48),
		__webpack_require__(56),
		__webpack_require__(52),
		__webpack_require__(11),
		__webpack_require__(14)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		BooleanValue,
		DecimalValue,
		DoubleValue,
		FloatValue,
		IntegerValue,
		Sequence,
		StringValue
	) {
		'use strict';

		/**
		 * Promote all given (numeric) items to single common type
		 * https://www.w3.org/TR/xpath-31/#promotion
		 */
		function convertItemsToCommonType (items) {
			if (items.every(function (item) {
				// xs:integer is the only numeric type with inherits from another numeric type
				return item.instanceOfType('xs:integer');
			})) {
				// They are all integers, we do not have to convert them to decimals
				return items;
			}
			var commonTypeName = items.map(function (item) {
					return item.primitiveTypeName;
				}).reduce(function (commonTypeName, itemType) {
					return itemType === commonTypeName ? commonTypeName : null;
				});

			if (commonTypeName !== null) {
				// All items are already of the same type
				return items;
			}

			// If each value is an instance of one of the types xs:string or xs:anyURI, then all the values are cast to type xs:string
			if (items.every(function (item) {
				return item.instanceOfType('xs:string') ||
					item.instanceOfType('xs:anyURI');
			})) {
				return items.map(StringValue.cast);
			}

			// If each value is an instance of one of the types xs:decimal or xs:float, then all the values are cast to type xs:float.
			if (items.every(function (item) {
				return item.instanceOfType('xs:decimal') ||
					item.instanceOfType('xs:float');
			})) {
				return items.map(FloatValue.cast);
			}
			// If each value is an instance of one of the types xs:decimal, xs:float, or xs:double, then all the values are cast to type xs:double.
			if (items.every(function (item) {
				return item.instanceOfType('xs:decimal') ||
					item.instanceOfType('xs:float') ||
					item.instanceOfType('xs:double');
			})) {
				return items.map(DoubleValue.cast);
			}

			// Otherwise, a type error is raised [err:FORG0006].
			throw new Error('FORG0006: Incompatible types to be converted to a common type');
		}

		function castUntypedItemsToDouble (items) {
			return items.map(function (item) {
					if (item.instanceOfType('xs:untypedAtomic')) {
						return DoubleValue.cast(item);
					}
					return item;
				});
		}

		function castItemsForMinMax (items) {
			// Values of type xs:untypedAtomic in $arg are cast to xs:double.
			items = castUntypedItemsToDouble(items);

			if (items.some(function (item) {
				return Number.isNaN(item.value);
			})) {
				return [new DoubleValue(NaN)];
			}

			return convertItemsToCommonType(items);
		}

		function fnMax (dynamicContext, sequence) {
			if (sequence.isEmpty()) {
				return sequence;
			}

			var items = castItemsForMinMax(sequence.value);

			// Use first element in array as initial value
			return Sequence.singleton(
				items.reduce(function (max, item) {
					return max.value < item.value ? item : max;
				}));
		}

		function fnMin (dynamicContext, sequence) {
			if (sequence.isEmpty()) {
				return sequence;
			}

			var items = castItemsForMinMax(sequence.value);

			// Use first element in array as initial value
			return Sequence.singleton(
				items.reduce(function (min, item) {
					return min.value > item.value ? item: min;
				}));
		}

		function fnAvg (dynamicContext, sequence) {
			if (sequence.isEmpty()) {
				return sequence;
			}

			// TODO: throw FORG0006 if the items contain both yearMonthDurations and dayTimeDurations
			var items = castUntypedItemsToDouble(sequence.value);
			items = convertItemsToCommonType(items);

			var resultValue = items.reduce(function (sum, item) {
					return sum + item.value;
				}, 0) / sequence.value.length;

			if (items.every(function (item) {
				return item.instanceOfType('xs:integer') || item.instanceOfType('xs:double');
			})) {
				return Sequence.singleton(new DoubleValue(resultValue));
			}

			if (items.every(function (item) {
				return item.instanceOfType('xs:decimal');
			})) {
				return Sequence.singleton(new DecimalValue(resultValue));
			}

			return Sequence.singleton(new FloatValue(resultValue));
		}

		function fnSum (dynamicContext, sequence, zero) {
			// TODO: throw FORG0006 if the items contain both yearMonthDurations and dayTimeDurations
			if (sequence.isEmpty()) {
				return zero;
			}

			var items = castUntypedItemsToDouble(sequence.value);
			items = convertItemsToCommonType(items);
			var resultValue = items.reduce(function (sum, item) {
					return sum + item.value;
				}, 0);

			if (items.every(function (item) {
				return item.instanceOfType('xs:integer');
			})) {
				return Sequence.singleton(new IntegerValue(resultValue));
			}

			if (items.every(function (item) {
				return item.instanceOfType('xs:double');
			})) {
				return Sequence.singleton(new DoubleValue(resultValue));
			}

			if (items.every(function (item) {
				return item.instanceOfType('xs:decimal');
			})) {
				return Sequence.singleton(new DecimalValue(resultValue));
			}

			return Sequence.singleton(new FloatValue(resultValue));
		}

		function fnCount (dynamicContext, sequence) {
			return Sequence.singleton(new IntegerValue(sequence.value.length));
		}

		return [
			{
				name: 'avg',
				argumentTypes: ['xs:anyAtomicType*'],
				returnType: 'xs:anyAtomicType?',
				callFunction: fnAvg
			},

			{
				name: 'count',
				argumentTypes: ['item()*'],
				returnType: 'xs:integer',
				callFunction: fnCount
			},

			{
				name: 'max',
				argumentTypes: ['xs:anyAtomicType*'],
				returnType: 'xs:anyAtomicType?',
				callFunction: fnMax
			},

			{
				name: 'max',
				argumentTypes: ['xs:anyAtomicType*', 'xs:string'],
				returnType: 'xs:anyAtomicType?',
				callFunction: function () {
					throw new Error('Calling the max function with a non-default collation is not supported at this moment');
				}
			},

			{
				name: 'min',
				argumentTypes: ['xs:anyAtomicType*'],
				returnType: 'xs:anyAtomicType?',
				callFunction: fnMin
			},

			{
				name: 'min',
				argumentTypes: ['xs:anyAtomicType*', 'xs:string'],
				returnType: 'xs:anyAtomicType?',
				callFunction: function () {
					throw new Error('Calling the min function with a non-default collation is not supported at this moment');
				}
			},

			{
				name: 'sum',
				argumentTypes: ['xs:anyAtomicType*'],
				returnType: 'xs:anyAtomicType',
				callFunction: function (dynamicContext, sequence) {
					return fnSum(dynamicContext, sequence, Sequence.singleton(new IntegerValue(0)));
				}
			},

			{
				name: 'sum',
				argumentTypes: ['xs:anyAtomicType*', 'xs:anyAtomicType?'],
				returnType: 'xs:anyAtomicType?',
				callFunction: fnSum
			}
		];
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(15)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		AnyAtomicTypeValue
	) {
		'use strict';

		function QNameValue (value) {
			AnyAtomicTypeValue.call(this, value);
		}

		QNameValue.prototype = Object.create(AnyAtomicTypeValue.prototype);
		QNameValue.prototype.constructor = QNameValue;

		QNameValue.cast = function (value) {
			return new QNameValue(AnyAtomicTypeValue.cast(value).value);
		};

		QNameValue.prototype.getEffectiveBooleanValue = function () {
			return this.value.length > 0;
		};

		QNameValue.primitiveTypeName = QNameValue.prototype.primitiveTypeName = 'xs:QName';

		QNameValue.prototype.instanceOfType = function (simpleTypeName) {
			return simpleTypeName === this.primitiveTypeName ||
				AnyAtomicTypeValue.prototype.instanceOfType.call(this, simpleTypeName);
		};

		return QNameValue;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
		'use strict';
		return Object.create(null);
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(19),
		__webpack_require__(10)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Selector,
		Specificity
	) {
		'use strict';

		/**
		 * @param  {String}  variableName
		 */
		function VarRef (variableName) {
			Selector.call(this, new Specificity({}), Selector.RESULT_ORDER_UNSORTED);

			this._variableName = variableName;
		}

		VarRef.prototype = Object.create(Selector.prototype);
		VarRef.prototype.constructor = VarRef;

		VarRef.prototype.equals = function (otherSelector) {
			return otherSelector instanceof VarRef &&
				this._variableName === otherSelector._variableName;
		};

		VarRef.prototype.evaluate = function (dynamicContext) {
			var value = dynamicContext.variables[this._variableName];
			if (!value) {
				throw new Error('XPST0008, The variable ' + this._variableName + ' is not in scope.');
			}

			return value;
		};

		return VarRef;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
	) {
		'use strict';

		return Object.create(null);
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(11),

		__webpack_require__(18),
		__webpack_require__(51),
		__webpack_require__(48),
		__webpack_require__(56),
		__webpack_require__(52),
		__webpack_require__(14)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		Sequence,

		BooleanValue,
		DecimalValue,
		DoubleValue,
		FloatValue,
		IntegerValue,
		StringValue
	) {
		function adaptItemToXPathValue (value) {
			switch(typeof value) {
				case 'boolean':
					return value ? BooleanValue.TRUE : BooleanValue.FALSE;
				case 'number':
					return new DecimalValue(value);
				case 'string':
					return new StringValue(value);
				default:
					throw new Error('Value ' + value + ' of type ' + typeof value + ' is not adaptable to an XPath value.');
			}
		}

		function adaptJavaScriptValueToXPathValue (type, value) {
			switch (type) {
				case 'xs:boolean':
					return value ? BooleanValue.TRUE : BooleanValue.FALSE;
				case 'xs:string':
					return new StringValue(value + '');
				case 'xs:double':
				case 'xs:numeric':
					return new DoubleValue(+value);
				case 'xs:decimal':
					return new DecimalValue(+value);
				case 'xs:integer':
					return new IntegerValue(value | 0);
				case 'xs:float':
					return new FloatValue(+value);
				case 'node()':
					throw new Error('XPath custom functions should not return a node, use traversals instead.');
				case 'item()':
					return adaptItemToXPathValue(value);
				default:
					throw new Error('Values of the type ' + type + ' is not expected to be returned from custom function.');
			}
		}

		return function adaptJavaScriptValueToXPath (value, expectedType) {
			expectedType = expectedType || 'item()';

			var parts = expectedType.match(/^([^+?*]*)([\+\*\?])?$/),
				type = parts[1],
				multiplicity = parts[2];

			switch (multiplicity) {
				case '?':
					if (value === null) {
						return Sequence.empty();
					}
					return Sequence.singleton(adaptJavaScriptValueToXPathValue(type, value));

				case '+':
				case '*':
					return new Sequence(value.map(adaptJavaScriptValueToXPathValue.bind(undefined, type)));

				default:
					return Sequence.singleton(adaptJavaScriptValueToXPathValue(type, value));
			}
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(2)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		evaluateXPath
	) {
		'use strict';

		/**
		 * Evaluates an XPath on the given contextNode. Returns the first node result.
		 *
		 * @param  {Selector|String}   XPathSelector  The selector to execute. Supports XPath 3.1.
		 * @param  {Node}              contextNode    The node from which to run the XPath.
		 * @param  {Blueprint}         blueprint      The blueprint (or DomFacade like interface) for retrieving relations.
		 * @param  {[Object]}          variables      Extra variables (name=>value). Values can be number / string or boolean.
		 *
		 * @return  {Node}             The first matching node, in the order defined by the XPath
		 */
		return function evaluateXPathToFirstNode (selector, contextNode, blueprint, variables) {
			return evaluateXPath(selector, contextNode, blueprint, variables, evaluateXPath.FIRST_NODE_TYPE);
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(2)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		evaluateXPath
	) {
		'use strict';

		/**
		 * Evaluates an XPath on the given contextNode. Returns the first node result.
		 * Returns result in the order defined in the XPath. The path operator ('/'), the union operator ('union' and '|') will sort.
		 * This implies (//A, //B) resolves to all A nodes, followed by all B nodes, both in document order, but not merged.
		 * However: (//A | //B) resolves to all A and B nodes in document order.
		 *
		 * @param  {Selector|String}   XPathSelector  The selector to execute. Supports XPath 3.1.
		 * @param  {Node}              contextNode    The node from which to run the XPath.
		 * @param  {Blueprint}         blueprint      The blueprint (or DomFacade like interface) for retrieving relations.
		 * @param  {[Object]}          variables      Extra variables (name=>value). Values can be number / string or boolean.
		 *
		 * @return  {Node}             Al matching Nodes, in the order defined by the XPath
		 */

		return function evaluateXPathToNodes (selector, contextNode, blueprint, variables) {
			return evaluateXPath(selector, contextNode, blueprint, variables, evaluateXPath.NODES_TYPE);
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(2)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		evaluateXPath
	) {
		'use strict';

		/**
		 * Evaluates an XPath on the given contextNode. Returns the numeric result.
		 *
		 * @param  {Selector|String}   XPathSelector  The selector to execute. Supports XPath 3.1.
		 * @param  {Node}              contextNode    The node from which to run the XPath.
		 * @param  {Blueprint}         blueprint      The blueprint (or DomFacade like interface) for retrieving relations.
		 * @param  {[Object]}          variables      Extra variables (name=>value). Values can be number / string or boolean.
		 *
		 * @return  {Number}             The numerical result.
		 */
		return function evaluateXPathToNumber (selector, contextNode, blueprint, variables) {
			return evaluateXPath(selector, contextNode, blueprint, variables, evaluateXPath.NUMBER_TYPE);
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(2)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		evaluateXPath
	) {
		'use strict';

		/**
		 * Evaluates an XPath on the given contextNode. Returns the string result as if the XPath is wrapped in string(...).
		 *
		 * @param  {Selector|String}   XPathSelector  The selector to execute. Supports XPath 3.1.
		 * @param  {Node}              contextNode    The node from which to run the XPath.
		 * @param  {Blueprint}         blueprint      The blueprint (or DomFacade like interface) for retrieving relations.
		 * @param  {[Object]}          variables      Extra variables (name=>value). Values can be number / string or boolean.
		 *
		 * @return  {String}           The string result.
		 */
		return function evaluateXPathToString (selector, contextNode, blueprint, variables) {
			return evaluateXPath(selector, contextNode, blueprint, variables, evaluateXPath.STRING_TYPE);
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(2)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (
		evaluateXPath
	) {
		'use strict';

		/**
		 * Evaluates an XPath on the given contextNode. Returns the string result as if the XPath is wrapped in string(...).
		 *
		 * @param  {Selector|String}   XPathSelector  The selector to execute. Supports XPath 3.1.
		 * @param  {Node}              contextNode    The node from which to run the XPath.
		 * @param  {Blueprint}         blueprint      The blueprint (or DomFacade like interface) for retrieving relations.
		 * @param  {[Object]}          variables      Extra variables (name=>value). Values can be number / string or boolean.
		 *
		 * @return  {String[]}         The string result.
		 */
		return function evaluateXPathToString (selector, contextNode, blueprint, variables) {
			return evaluateXPath(selector, contextNode, blueprint, variables, evaluateXPath.STRINGS_TYPE);
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }
/******/ ])));
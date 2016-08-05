define([
	'fontoxml-blueprints',
	'fontoxml-dom-utils',

	'../selectors/PathSelector',
	'../selectors/AbsolutePathSelector',
	'../selectors/axes/AttributeSelector',
	'../selectors/axes/HasAncestorSelector',
	'../selectors/axes/HasChildSelector',
	'../selectors/axes/HasDescendantSelector',
	'../selectors/axes/HasFollowingSiblingSelector',
	'../selectors/axes/HasParentSelector',
	'../selectors/axes/HasPrecedingSiblingSelector',
	'../selectors/axes/SelfSelector',
	'../selectors/tests/NodeNameSelector',
	'../selectors/tests/NodePredicateSelector',
	'../selectors/tests/NodeTypeSelector',
	'../selectors/tests/ProcessingInstructionTargetSelector',
	'../selectors/operators/CompositeSelector',
	'../selectors/operators/OrCombiningSelector',
	'../selectors/operators/UniversalSelector',
	'../selectors/operators/InvertedSelector',

	'./xPathParser',

	'./customTestsByName'
], function (
	blueprints,
	domUtils,

	PathSelector,
	AbsolutePathSelector,
	AttributeSelector,
	HasAncestorSelector,
	HasChildSelector,
	HasDescendantSelector,
	HasFollowingSiblingSelector,
	HasParentSelector,
	HasPrecedingSiblingSelector,
	SelfSelector,
	NodeNameSelector,
	NodePredicateSelector,
	NodeTypeSelector,
	ProcessingInstructionTargetSelector,
	CompositeSelector,
	OrCombiningSelector,
	UniversalSelector,
	InvertedSelector,

	xPathParser,

	customTestsByName
) {
	'use strict';

	// Basic and incomplete implementation of single steps as defined in XPATH 1.0 (http://www.w3.org/TR/xpath/)
	// Only single steps are allowed, because that's what selectors offer. Anyway: all paths have synonyms as (nested) predicates.
	// Missing:
	//  * various functions, such as:
	//    * last()
	//    * first()
	//    * position()
	//    * name()
	//  * variables
	function compile (ast) {
		var args = ast.slice(1);
		switch (ast[0]) {
			// Operators
			case 'and':
				return and(args);
			case 'or':
				return or(args);
			case 'not':
				return not(args);

			// Tests
			case 'nameTest':
				return nameTest(args);
			case 'nodeType':
				return nodeType(args);
			case 'customTest':
				return customTest(args);
			case 'true':
				return trueTest(args);
			case 'false':
				return falseTest(args);

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


			default:
				throw new Error('No selector counterpart for: ' + ast[0] + '.');
		}
	}

	function absolutePath (args) {
		return new AbsolutePathSelector(compile(args[0]));
	}

	function ancestor (args) {
		return new HasAncestorSelector(compile(args[0]));
	}

	function ancestorOrSelf (args) {
		var subSelector = compile(args[0]);
		return new OrCombiningSelector(
			new SelfSelector(subSelector),
			new HasAncestorSelector(subSelector));
	}

	function and (args) {
		var a = compile(args[0]),
			b = compile(args[1]);
		return new CompositeSelector(a, b);
	}

	function attribute (args) {
		// Assume this is a nameTest: ['nameTest', name(, value?)]
		// Since we cannot express most compare operators.
		var value = args[0][2];
		return new AttributeSelector(args[0][1], value && [value]);
	}

	function child (args) {
		return new HasChildSelector(compile(args[0]));
	}

	function descendant (args) {
		return new HasDescendantSelector(compile(args[0]));
	}

	function descendantOrSelf (args) {
		var subSelector = compile(args[0]);
		return new OrCombiningSelector(
			new SelfSelector(subSelector),
			new HasDescendantSelector(subSelector));
	}

	function falseTest (args) {
		return new InvertedSelector(new UniversalSelector());
	}

	function followingSibling (args) {
		return new HasFollowingSiblingSelector(compile(args[0]));
	}

	function nameTest (args) {
		var nodeName = args[0];
		return nodeName === '*' ? new NodeTypeSelector(1) : new NodeNameSelector(nodeName);
	}

	function nodeType (args) {
		switch (args[0]) {
			case 'node':
				return new UniversalSelector();
			case 'comment':
				return new NodeTypeSelector(8);
			case 'processing-instruction':
				if (args.length > 1) {
					return new ProcessingInstructionTargetSelector(args[1]);
				}
				return new NodeTypeSelector(7);
			case 'text':
				return new NodeTypeSelector(3);
			default:
				throw new Error('Unrecognized nodeType: ' + args[0]);
		}
	}

	function not (args) {
		return new InvertedSelector(compile(args[0]));
	}

	function or (args) {
		return new OrCombiningSelector(compile(args[0]), compile(args[1]));
	}

	function parent (args) {
		return new HasParentSelector(compile(args[0]));
	}

	function path (args) {
		var a = compile(args[0]),
			b = compile(args[1]);
		return new PathSelector([a, b]);
	}

	function precedingSibling (args) {
		return new HasPrecedingSiblingSelector(compile(args[0]));
	}

	function self (args) {
		return new SelfSelector(compile(args[0]));
	}

	function trueTest (args) {
		return new UniversalSelector();
	}

	// Custom tests are nodePredicates, and nodePredicates can not always be compared.
	// Therefore we should get the same instance of selectors wherever possible.
	var customSelectorsByName = Object.create(null);
	function customTest (args) {
		var name = args[0],
			params = args[1];
		// Roughly approximate function call, to allow memoization
		var key = name + '(' + (params ? ('"' + params.join('", ') + '"') : '') + ')';
		if (customSelectorsByName[key]) {
			return customSelectorsByName[key];
		}
		var test = customTestsByName[name];
		if (!test) {
			throw new Error('No such custom test ' + name + '.');
		}
		// Optionally bind the test, if there are arguments
		var boundTest = params ? test.bind.apply(test, [undefined].concat(params)): test;
		var selector = new NodePredicateSelector(boundTest);
		customSelectorsByName[key] = selector;
		return selector;
	}

	// Hold a cache containing earlier created selectors, to prevent recompiling
	var selectorCache = Object.create(null);

	/**
	 * Parse an XPath string to a selector.
	 * Only single step paths can be compiled
	 *
	 * @param  {string}  xPathString      The string to parse
	 */
	return function parseSelector (xPathString) {
		if (!selectorCache[xPathString]) {
			var ast = xPathParser.parse(xPathString);
			selectorCache[xPathString] = compile(ast);
		}
		return selectorCache[xPathString];
	};
});

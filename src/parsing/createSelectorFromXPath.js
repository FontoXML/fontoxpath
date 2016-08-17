define([
	'fontoxml-blueprints',
	'fontoxml-dom-utils',

	'./WrappingSelector',

	'../selectors/PathSelector',
	'../selectors/AbsolutePathSelector',
	'../selectors/Filter',
	'../selectors/axes/AttributeAxis',
	'../selectors/axes/AncestorAxis',
	'../selectors/axes/ChildAxis',
	'../selectors/axes/DescendantAxis',
	'../selectors/axes/FollowingSiblingAxis',
	'../selectors/axes/ParentAxis',
	'../selectors/axes/PrecedingSiblingAxis',
	'../selectors/axes/SelfAxis',
	'../selectors/tests/NodeNameSelector',
	'../selectors/tests/NodePredicateSelector',
	'../selectors/tests/NodeTypeSelector',
	'../selectors/tests/ProcessingInstructionTargetSelector',

	'../selectors/operators/boolean/AndOperator',
	'../selectors/operators/boolean/OrOperator',
	'../selectors/operators/UniversalSelector',
	'../selectors/operators/boolean/NotOperator',
	'../selectors/operators/Union',
	'../selectors/operators/numeric/Unary',
	'../selectors/operators/numeric/BinaryNumericOperator',
	'../selectors/operators/compares/Compare',

	'../selectors/literals/Literal',

	'./xPathParser',

	'./customTestsByName',
	'./functionsByName'
], function (
	blueprints,
	domUtils,

	WrappingSelector,
	PathSelector,
	AbsolutePathSelector,
	Filter,
	AttributeSelector,
	AncestorAxis,
	ChildAxis,
	DescendantAxis,
	FollowingSiblingAxis,
	ParentAxis,
	PrecedingSiblingAxis,
	SelfSelector,
	NodeNameSelector,
	NodePredicateSelector,
	NodeTypeSelector,
	ProcessingInstructionTargetSelector,
	AndOperator,
	OrOperator,
	UniversalSelector,
	NotOperator,
	Union,
	Unary,
	BinaryNumericOperator,
	Compare,

	Literal,

	xPathParser,

	customTestsByName,
	functionsByName
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

			// Tests
			case 'nameTest':
				return nameTest(args);
			case 'kindTest':
				return nodeType(args);
			case 'functionCall':
				return functionCall(args);

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

			case 'filter':
				return filter(args);

			case 'literal':
				return literal(args);

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
		return new Union(
			new SelfSelector(subSelector),
			new AncestorAxis(subSelector));
	}

	function and (args) {
		var a = compile(args[0]),
			b = compile(args[1]);
		return new AndOperator(a, b);
	}

	function attribute (args) {
		// Assume this is a nameTest: ['nameTest', name(, value?)]
		// Since we cannot express most compare operators.
		var value = args[0][2];
		return new AttributeSelector(args[0][1], value && [value]);
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
		return new Union(
			new SelfSelector(subSelector),
			new DescendantAxis(subSelector));
	}

	// Binary compare (=, !=, le, is, etc)
	function compare (args) {
		return new Compare(args[0], compile(args[1]), compile(args[2]));
	}

	function filter (args) {
		return new Filter(compile(args.shift()), args.map(compile));
	}

	function followingSibling (args) {
		return new FollowingSiblingAxis(compile(args[0]));
	}

	function functionCall (args) {
		var functionName = args[0];

		var createFunction = functionsByName[functionName];
		if (createFunction) {
			return createFunction(args.slice(1).map(compile));
		}

		return customTest(args);
	}

	function literal (args) {
		return new Literal(args[0], args[1]);
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

	function or (args) {
		return new OrOperator(compile(args[0]), compile(args[1]));
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

	function self (args) {
		return new SelfSelector(compile(args[0]));
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

	// Custom tests are nodePredicates, and nodePredicates can not always be compared.
	// Therefore we should get the same instance of selectors wherever possible.
	var customSelectorsByName = Object.create(null);
	function customTest (args) {
		var name = args.shift(),
			params = args.map(compile);
		// Roughly approximate function call, to allow memoization
		var key = name + '(' + (params ? ('"' + params.join('", ') + '"') : '') + ')';
		if (customSelectorsByName[key]) {
			return customSelectorsByName[key];
		}
		var test = customTestsByName[name];
		if (!test) {
			test = customTestsByName[name.replace('fonto-', 'fonto:')];
			if (!test) {
				throw new Error('No such custom test ' + name + '.');
			}
		}
		// Optionally bind the test, if there are arguments
		var paramValues;
		if (params) {
			// Evaluate the params. Assume them being able to be statically evaluated to strings
			paramValues = params.map(function (param) {
				var resultSequence = param.evaluate(null, null);
				return resultSequence.value[0].value;
			});
		}
		var boundTest = paramValues ? test.bind.apply(test, [undefined].concat(paramValues)): test;
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
		return new WrappingSelector(selectorCache[xPathString]);
	};
});

define([
	'../selectors/path/PathSelector',
	'../selectors/path/AbsolutePathSelector',
	'../selectors/postfix/Filter',
	'../selectors/axes/AttributeAxis',
	'../selectors/axes/AncestorAxis',
	'../selectors/axes/ChildAxis',
	'../selectors/axes/DescendantAxis',
	'../selectors/axes/FollowingSiblingAxis',
	'../selectors/axes/ParentAxis',
	'../selectors/axes/PrecedingSiblingAxis',
	'../selectors/axes/SelfAxis',
	'../selectors/tests/NodeNameSelector',
	'../selectors/tests/NodeTypeSelector',
	'../selectors/tests/ProcessingInstructionTargetSelector',
	'../selectors/tests/TypeTest',

	'../selectors/functions/FunctionCall',
	'../selectors/operators/boolean/AndOperator',
	'../selectors/operators/boolean/OrOperator',
	'../selectors/operators/UniversalSelector',
	'../selectors/operators/Union',
	'../selectors/operators/SequenceOperator',
	'../selectors/operators/SimpleMapOperator',
	'../selectors/operators/numeric/Unary',
	'../selectors/operators/numeric/BinaryNumericOperator',
	'../selectors/operators/compares/Compare',
	'../selectors/operators/types/InstanceOfOperator',
	'../selectors/quantified/QuantifiedExpression',
	'../selectors/conditional/IfExpression',
	'../selectors/maps/MapConstructor',
	'../selectors/arrays/ArrayConstructor',

	'../selectors/literals/Literal',
	'../selectors/LetExpression',
	'../selectors/NamedFunctionRef',
	'../selectors/VarRef'
], function (
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

	MapConstructor,
	ArrayConstructor,

	Literal,
	LetExpression,
	NamedFunctionRef,
	VarRef
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

			case 'mapConstructor':
				return mapConstructor(args);

			case 'arrayConstructor':
				return arrayConstructor(args);

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
		return new AncestorAxis(subSelector, { inclusive: true });
	}

	function and (args) {
		return new AndOperator(args.map(compile));
	}

	function arrayConstructor (args) {
		return new ArrayConstructor(args[0], args.slice(1).map(compile));
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
		return new DescendantAxis(subSelector, { inclusive: true });
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

	function mapConstructor (args) {
		return new MapConstructor(args.map(function (keyValuePair) {
			return {
				key: compile(keyValuePair[0]),
				value: compile(keyValuePair[1])
			};
		}));
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
		return compile(xPathAst);
	};
});

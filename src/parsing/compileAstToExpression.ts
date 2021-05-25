import CurlyArrayConstructor from '../expressions/arrays/CurlyArrayConstructor';
import SquareArrayConstructor from '../expressions/arrays/SquareArrayConstructor';
import AncestorAxis from '../expressions/axes/AncestorAxis';
import AttributeAxis from '../expressions/axes/AttributeAxis';
import ChildAxis from '../expressions/axes/ChildAxis';
import DescendantAxis from '../expressions/axes/DescendantAxis';
import FollowingAxis from '../expressions/axes/FollowingAxis';
import FollowingSiblingAxis from '../expressions/axes/FollowingSiblingAxis';
import ParentAxis from '../expressions/axes/ParentAxis';
import PrecedingAxis from '../expressions/axes/PrecedingAxis';
import PrecedingSiblingAxis from '../expressions/axes/PrecedingSiblingAxis';
import SelfAxis from '../expressions/axes/SelfAxis';
import IfExpression from '../expressions/conditional/IfExpression';
import Value, {
	SequenceMultiplicity,
	SequenceType,
	ValueType,
} from '../expressions/dataTypes/Value';
import QName from '../expressions/dataTypes/valueTypes/QName';
import StackTraceGenerator, { SourceRange } from '../expressions/debug/StackTraceGenerator';
import Expression, { RESULT_ORDERINGS } from '../expressions/Expression';
import FlworExpression from '../expressions/FlworExpression';
import ForExpression from '../expressions/ForExpression';
import FunctionCall from '../expressions/functions/FunctionCall';
import InlineFunction from '../expressions/functions/InlineFunction';
import LetExpression from '../expressions/LetExpression';
import Literal from '../expressions/literals/Literal';
import MapConstructor from '../expressions/maps/MapConstructor';
import NamedFunctionRef from '../expressions/NamedFunctionRef';
import BinaryOperator, {
	generateBinaryOperatorFunction,
} from '../expressions/operators/arithmetic/BinaryOperator';
import Unary from '../expressions/operators/arithmetic/Unary';
import AndOperator from '../expressions/operators/boolean/AndOperator';
import OrOperator from '../expressions/operators/boolean/OrOperator';
import Compare from '../expressions/operators/compares/Compare';
import IntersectExcept from '../expressions/operators/IntersectExcept';
import SequenceOperator from '../expressions/operators/SequenceOperator';
import SimpleMapOperator from '../expressions/operators/SimpleMapOperator';
import CastableAsOperator from '../expressions/operators/types/CastableAsOperator';
import CastAsOperator from '../expressions/operators/types/CastAsOperator';
import InstanceOfOperator from '../expressions/operators/types/InstanceOfOperator';
import Union from '../expressions/operators/Union';
import OrderByExpression from '../expressions/OrderByExpression';
import AbsolutePathExpression from '../expressions/path/AbsolutePathExpression';
import ContextItemExpression from '../expressions/path/ContextItemExpression';
import PathExpression from '../expressions/path/PathExpression';
import PossiblyUpdatingExpression from '../expressions/PossiblyUpdatingExpression';
import Filter from '../expressions/postfix/Filter';
import Lookup from '../expressions/postfix/Lookup';
import UnaryLookup from '../expressions/postfix/UnaryLookup';
import QuantifiedExpression from '../expressions/quantified/QuantifiedExpression';
import KindTest from '../expressions/tests/KindTest';
import NameTest from '../expressions/tests/NameTest';
import PITest from '../expressions/tests/PITest';
import TestAbstractExpression from '../expressions/tests/TestAbstractExpression';
import TypeTest from '../expressions/tests/TypeTest';
import VarRef from '../expressions/VarRef';
import WhereExpression from '../expressions/WhereExpression';
import DeleteExpression from '../expressions/xquery-update/DeleteExpression';
import InsertExpression, { TargetChoice } from '../expressions/xquery-update/InsertExpression';
import RenameExpression from '../expressions/xquery-update/RenameExpression';
import ReplaceExpression from '../expressions/xquery-update/ReplaceExpression';
import TransformExpression from '../expressions/xquery-update/TransformExpression';
import AttributeConstructor from '../expressions/xquery/AttributeConstructor';
import CommentConstructor from '../expressions/xquery/CommentConstructor';
import ElementConstructor from '../expressions/xquery/ElementConstructor';
import PIConstructor from '../expressions/xquery/PIConstructor';
import TextConstructor from '../expressions/xquery/TextConstructor';
import TypeSwitchExpression from '../expressions/xquery/TypeSwitchExpression';
import { BinaryEvaluationFunction } from '../typeInference/binaryEvaluationFunction';
import astHelper, { IAST } from './astHelper';

const COMPILATION_OPTIONS = {
	XPATH_MODE: { allowXQuery: false, allowUpdating: false },
	XQUERY_MODE: { allowXQuery: true, allowUpdating: false },
	XQUERY_UPDATING_MODE: { allowXQuery: true, allowUpdating: true },
};

function disallowUpdating(compilationOptions: CompilationOptions) {
	if (!compilationOptions.allowXQuery) {
		return COMPILATION_OPTIONS.XPATH_MODE;
	}
	if (!compilationOptions.allowUpdating) {
		return COMPILATION_OPTIONS.XQUERY_MODE;
	}
	return COMPILATION_OPTIONS.XQUERY_UPDATING_MODE;
}

type CompilationOptions = { allowUpdating?: boolean; allowXQuery?: boolean };

function compile(ast: IAST, compilationOptions: CompilationOptions): Expression {
	const name = ast[0];
	switch (name) {
		// Operators
		case 'andOp':
			return andOp(ast, compilationOptions);
		case 'orOp':
			return orOp(ast, compilationOptions);
		case 'unaryPlusOp':
			return unaryPlus(ast, compilationOptions);
		case 'unaryMinusOp':
			return unaryMinus(ast, compilationOptions);
		case 'addOp':
		case 'subtractOp':
		case 'multiplyOp':
		case 'divOp':
		case 'idivOp':
		case 'modOp':
			return binaryOperator(ast, compilationOptions);
		case 'sequenceExpr':
			return sequence(ast, compilationOptions);
		case 'unionOp':
			return unionOp(ast, compilationOptions);
		case 'exceptOp':
		case 'intersectOp':
			return intersectExcept(ast, compilationOptions);
		case 'stringConcatenateOp':
			return stringConcatenateOp(ast, compilationOptions);
		case 'rangeSequenceExpr':
			return rangeSequenceExpr(ast, compilationOptions);

		// Compares
		case 'equalOp':
		case 'notEqualOp':
		case 'lessThanOrEqualOp':
		case 'lessThanOp':
		case 'greaterThanOrEqualOp':
		case 'greaterThanOp':
		case 'eqOp':
		case 'neOp':
		case 'ltOp':
		case 'leOp':
		case 'gtOp':
		case 'geOp':
		case 'isOp':
		case 'nodeBeforeOp':
		case 'nodeAfterOp':
			return compare(ast, compilationOptions);

		// Path
		case 'pathExpr':
			return pathExpr(ast, compilationOptions);
		case 'contextItemExpr':
			return new ContextItemExpression();

		// Functions
		case 'functionCallExpr':
			return functionCall(ast, compilationOptions);
		case 'inlineFunctionExpr':
			return inlineFunction(ast, compilationOptions);
		case 'arrowExpr':
			return arrowExpr(ast, compilationOptions);
		case 'dynamicFunctionInvocationExpr':
			return dynamicFunctionInvocationExpr(ast, compilationOptions);
		case 'namedFunctionRef':
			return namedFunctionRef(ast, compilationOptions);

		// Literals
		case 'integerConstantExpr':
			return integerConstantExpr(ast, compilationOptions);
		case 'stringConstantExpr':
			return stringConstantExpr(ast, compilationOptions);
		case 'decimalConstantExpr':
			return decimalConstantExpr(ast, compilationOptions);
		case 'doubleConstantExpr':
			return doubleConstantExpr(ast, compilationOptions);

		// Variables
		case 'varRef':
			return varRef(ast, compilationOptions);
		case 'flworExpr':
			return flworExpression(ast, compilationOptions);

		// Quantified
		case 'quantifiedExpr':
			return quantified(ast, compilationOptions);

		// Conditional
		case 'ifThenElseExpr':
			return IfThenElseExpr(ast, compilationOptions);

		case 'instanceOfExpr':
			return instanceOf(ast, compilationOptions);
		case 'castExpr':
			return castAs(ast, compilationOptions);
		case 'castableExpr':
			return castableAs(ast, compilationOptions);

		case 'simpleMapExpr':
			return simpleMap(ast, compilationOptions);

		case 'mapConstructor':
			return mapConstructor(ast, compilationOptions);

		case 'arrayConstructor':
			return arrayConstructor(ast, compilationOptions);

		case 'unaryLookup':
			return new UnaryLookup(compileLookup(ast, compilationOptions));

		case 'typeswitchExpr':
			return typeswitchExpr(ast, compilationOptions);

		// XQuery node constructors
		case 'elementConstructor':
			return dirElementConstructor(ast, compilationOptions);
		case 'attributeConstructor':
			return attributeConstructor(ast, compilationOptions);
		case 'computedAttributeConstructor':
			return computedAttributeConstructor(ast, compilationOptions);
		case 'computedCommentConstructor':
			return computedCommentConstructor(ast, compilationOptions);
		case 'computedTextConstructor':
			return computedTextConstructor(ast, compilationOptions);
		case 'computedElementConstructor':
			return computedElementConstructor(ast, compilationOptions);
		case 'computedPIConstructor':
			return computedPIConstructor(ast, compilationOptions);
		case 'CDataSection':
			return CDataSection(ast, compilationOptions);

		// XQuery update facility
		case 'deleteExpr':
			return deleteExpression(ast, compilationOptions);
		case 'insertExpr':
			return insertExpression(ast, compilationOptions);
		case 'renameExpr':
			return renameExpression(ast, compilationOptions);
		case 'replaceExpr':
			return replaceExpression(ast, compilationOptions);
		case 'transformExpr':
			return transformExpression(ast, compilationOptions);

		case 'x:stackTrace':
			return stackTrace(ast, compilationOptions);

		default:
			return compileTest(ast, compilationOptions);
	}
}

function compileTest(ast: IAST, compilationOptions: CompilationOptions): TestAbstractExpression {
	switch (ast[0]) {
		// Tests
		case 'nameTest':
			return nameTest(ast, compilationOptions);
		case 'piTest':
			return piTest(ast, compilationOptions);
		case 'commentTest':
			return commentTest(ast, compilationOptions);
		case 'textTest':
			return textTest(ast, compilationOptions);
		case 'documentTest':
			return documentTest(ast, compilationOptions);
		case 'attributeTest':
			return attributeTest(ast, compilationOptions);
		case 'elementTest':
			return elementTest(ast, compilationOptions);
		case 'anyKindTest':
			return anyKindTest();
		case 'anyMapTest':
			return anyMapTest(ast, compilationOptions);
		case 'anyArrayTest':
			return anyArrayTest(ast, compilationOptions);
		case 'Wildcard':
			return wildcard(ast, compilationOptions);
		case 'atomicType':
			return typeTest(ast, compilationOptions);
		case 'anyItemType':
			return anyItemTest();
		default:
			throw new Error('No selector counterpart for: ' + ast[0] + '.');
	}
}

function stackTrace(ast: IAST, compilationOptions: CompilationOptions) {
	const location = ast[1] as SourceRange;
	const innerExpression = ast[2] as IAST;

	let nextCompilableExpression: IAST = innerExpression;
	while (nextCompilableExpression[0] === 'x:stackTrace') {
		nextCompilableExpression = nextCompilableExpression[2] as IAST;
	}

	return new StackTraceGenerator(
		location,
		nextCompilableExpression[0],
		compile(nextCompilableExpression, compilationOptions)
	);
}

function arrayConstructor(ast: IAST, compilationOptions: CompilationOptions) {
	const arrConstructor = astHelper.getFirstChild(ast, '*');
	const members = astHelper
		.getChildren(arrConstructor, 'arrayElem')
		.map((arrayElem) =>
			compile(astHelper.getFirstChild(arrayElem, '*'), disallowUpdating(compilationOptions))
		);
	switch (arrConstructor[0]) {
		case 'curlyArray':
			return new CurlyArrayConstructor(members);
		case 'squareArray':
			return new SquareArrayConstructor(members);
		default:
			throw new Error('Unrecognized arrayType: ' + arrConstructor[0]);
	}
}

function mapConstructor(ast: IAST, compilationOptions: CompilationOptions) {
	return new MapConstructor(
		astHelper.getChildren(ast, 'mapConstructorEntry').map((keyValuePair) => ({
			key: compile(
				astHelper.followPath(keyValuePair, ['mapKeyExpr', '*']),
				disallowUpdating(compilationOptions)
			),
			value: compile(
				astHelper.followPath(keyValuePair, ['mapValueExpr', '*']),
				disallowUpdating(compilationOptions)
			),
		}))
	);
}

function unwrapBinaryOperator(
	operatorName: string,
	ast: IAST,
	compilationOptions: CompilationOptions
) {
	const compiledAstNodes = [];
	function unwrapInner(innerAst: IAST) {
		const firstOperand = astHelper.getFirstChild(innerAst, 'firstOperand')[1] as IAST;
		const secondOperand = astHelper.getFirstChild(innerAst, 'secondOperand')[1] as IAST;

		if (firstOperand[0] === operatorName) {
			unwrapInner(firstOperand);
		} else {
			compiledAstNodes.push(compile(firstOperand as IAST, compilationOptions));
		}
		if (secondOperand[0] === operatorName) {
			unwrapInner(secondOperand);
		} else {
			compiledAstNodes.push(compile(secondOperand as IAST, compilationOptions));
		}
	}
	unwrapInner(ast);

	return compiledAstNodes;
}

function andOp(ast: IAST, compilationOptions: CompilationOptions) {
	const typeNode = astHelper.followPath(ast, ['type']);
	return new AndOperator(
		unwrapBinaryOperator('andOp', ast, disallowUpdating(compilationOptions)),
		typeNode ? (typeNode[1] as SequenceType) : undefined
	);
}

function orOp(ast: IAST, compilationOptions: CompilationOptions) {
	const typeNode = astHelper.followPath(ast, ['type']);
	return new OrOperator(
		unwrapBinaryOperator('orOp', ast, disallowUpdating(compilationOptions)),
		typeNode ? (typeNode[1] as SequenceType) : undefined
	);
}

function binaryOperator(ast: IAST, compilationOptions: CompilationOptions) {
	const kind = ast[0];
	const a = compile(
		astHelper.followPath(ast, ['firstOperand', '*']),
		disallowUpdating(compilationOptions)
	);
	const b = compile(
		astHelper.followPath(ast, ['secondOperand', '*']),
		disallowUpdating(compilationOptions)
	);

	const attributeType = astHelper.getAttribute(ast, 'type');
	const first = astHelper.getAttribute(
		astHelper.followPath(ast, ['firstOperand', '*']),
		'type'
	) as SequenceType;
	const second = astHelper.getAttribute(
		astHelper.followPath(ast, ['secondOperand', '*']),
		'type'
	) as SequenceType;

	let evaluateFunction: BinaryEvaluationFunction;
	if (first && second && astHelper.getAttribute(ast, 'type')) {
		evaluateFunction = generateBinaryOperatorFunction(kind, first.type, second.type);
	}

	return new BinaryOperator(kind, a, b, attributeType as SequenceType, evaluateFunction);
}

function compileLookup(ast: IAST, compilationOptions: CompilationOptions): '*' | Expression {
	const keyExpression = astHelper.getFirstChild(ast, '*');
	switch (keyExpression[0]) {
		case 'NCName':
			return new Literal(astHelper.getTextContent(keyExpression), {
				type: ValueType.XSSTRING,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			});
		case 'star':
			return '*';
		default:
			return compile(keyExpression, disallowUpdating(compilationOptions));
	}
}

function castAs(ast: IAST, compilationOptions: CompilationOptions) {
	const expression = compile(
		astHelper.getFirstChild(astHelper.getFirstChild(ast, 'argExpr'), '*'),
		disallowUpdating(compilationOptions)
	);

	const singleType = astHelper.getFirstChild(ast, 'singleType');
	const targetType = astHelper.getQName(astHelper.getFirstChild(singleType, 'atomicType'));
	const optional = astHelper.getFirstChild(singleType, 'optional') !== null;

	return new CastAsOperator(expression, targetType, optional);
}

function castableAs(ast: IAST, compilationOptions: CompilationOptions) {
	const expression = compile(
		astHelper.getFirstChild(astHelper.getFirstChild(ast, 'argExpr'), '*'),
		disallowUpdating(compilationOptions)
	);

	const singleType = astHelper.getFirstChild(ast, 'singleType');
	const targetType = astHelper.getQName(astHelper.getFirstChild(singleType, 'atomicType'));
	const optional = astHelper.getFirstChild(singleType, 'optional') !== null;

	return new CastableAsOperator(expression, targetType, optional);
}

// Binary compare (=, !=, le, is, <<, >>, etc)
function compare(ast: IAST, compilationOptions: CompilationOptions) {
	return new Compare(
		ast[0],
		compile(
			astHelper.followPath(ast, ['firstOperand', '*']),
			disallowUpdating(compilationOptions)
		),
		compile(
			astHelper.followPath(ast, ['secondOperand', '*']),
			disallowUpdating(compilationOptions)
		)
	);
}

function IfThenElseExpr(ast: IAST, compilationOptions: CompilationOptions) {
	return new IfExpression(
		compile(
			astHelper.getFirstChild(astHelper.getFirstChild(ast, 'ifClause'), '*'),
			disallowUpdating(compilationOptions)
		),
		compile(
			astHelper.getFirstChild(astHelper.getFirstChild(ast, 'thenClause'), '*'),
			compilationOptions
		) as PossiblyUpdatingExpression,
		compile(
			astHelper.getFirstChild(astHelper.getFirstChild(ast, 'elseClause'), '*'),
			compilationOptions
		) as PossiblyUpdatingExpression
	);
}

function forClause(
	expressionClause: IAST,
	compilationOptions: CompilationOptions,
	returnClauseExpression: PossiblyUpdatingExpression | FlworExpression
): ForExpression {
	const forClauseItems = astHelper.getChildren(expressionClause, '*');
	let returnExpr = returnClauseExpression;

	for (let i = forClauseItems.length - 1; i >= 0; --i) {
		const forClauseItem = forClauseItems[i];
		const expression = astHelper.followPath(forClauseItem, ['forExpr', '*']);
		const positionalVariableBinding = astHelper.getFirstChild(
			forClauseItem,
			'positionalVariableBinding'
		);

		returnExpr = new ForExpression(
			astHelper.getQName(
				astHelper.followPath(forClauseItem, ['typedVariableBinding', 'varName'])
			),
			compile(expression, disallowUpdating(compilationOptions)),
			positionalVariableBinding ? astHelper.getQName(positionalVariableBinding) : null,
			returnExpr
		);
	}

	return returnExpr as ForExpression;
}

function letClause(
	expressionClause: IAST,
	compilationOptions: CompilationOptions,
	returnClauseExpression: PossiblyUpdatingExpression | FlworExpression
): LetExpression {
	const letClauseItems = astHelper.getChildren(expressionClause, '*');
	let returnExpr = returnClauseExpression;

	for (let i = letClauseItems.length - 1; i >= 0; --i) {
		const letClauseItem = letClauseItems[i];
		const expression = astHelper.followPath(letClauseItem, ['letExpr', '*']);
		returnExpr = new LetExpression(
			astHelper.getQName(
				astHelper.followPath(letClauseItem, ['typedVariableBinding', 'varName'])
			),
			compile(expression, disallowUpdating(compilationOptions)),
			returnExpr
		);
	}

	return returnExpr as LetExpression;
}

function whereClause(
	expressionClause: IAST,
	compilationOptions: CompilationOptions,
	returnClauseExpression: PossiblyUpdatingExpression | FlworExpression
): WhereExpression {
	const whereClauseItems = astHelper.getChildren(expressionClause, '*');
	let returnExpr = returnClauseExpression;

	for (let i = whereClauseItems.length - 1; i >= 0; --i) {
		const whereClauseItem = whereClauseItems[i];
		returnExpr = new WhereExpression(compile(whereClauseItem, compilationOptions), returnExpr);
	}

	return returnExpr as WhereExpression;
}

function orderByClause(
	expressionClause: IAST,
	compilationOptions: CompilationOptions,
	returnClauseExpression: PossiblyUpdatingExpression
): OrderByExpression {
	const orderBySpecs = astHelper.getChildren(expressionClause, '*');
	return new OrderByExpression(
		orderBySpecs
			.filter((spec) => spec[0] !== 'stable')
			.map((spec) => {
				const orderModifier = astHelper.getFirstChild(spec, 'orderModifier');
				const kind = orderModifier
					? astHelper.getFirstChild(orderModifier, 'orderingKind')
					: null;
				const mode = orderModifier
					? astHelper.getFirstChild(orderModifier, 'emptyOrderingMode')
					: null;

				const isAscending = kind ? astHelper.getTextContent(kind) === 'ascending' : true;
				const isEmptyLeast = mode ? astHelper.getTextContent(mode) === 'empty least' : true;

				return {
					expression: compile(
						astHelper.followPath(spec, ['orderByExpr', '*']),
						compilationOptions
					),
					isAscending,
					isEmptyLeast,
				};
			}),
		returnClauseExpression
	);
}

function flworExpression(ast: IAST, compilationOptions: CompilationOptions) {
	const clausesAndReturnClause = astHelper.getChildren(ast, '*');
	const returnClauseExpression = astHelper.getFirstChild(
		clausesAndReturnClause[clausesAndReturnClause.length - 1],
		'*'
	);

	// Return intermediate and initial clauses handling
	const clauses = clausesAndReturnClause.slice(0, -1);

	// We have to check if there are any intermediate clauses before compiling them.
	if (clauses.length > 1) {
		if (!compilationOptions.allowXQuery) {
			throw new Error('XPST0003: Use of XQuery FLWOR expressions in XPath is no allowed');
		}
	}

	return clauses.reduceRight(
		(returnOfPreviousExpression: PossiblyUpdatingExpression, flworExpressionClause: IAST) => {
			switch (flworExpressionClause[0]) {
				case 'forClause':
					return forClause(
						flworExpressionClause,
						compilationOptions,
						returnOfPreviousExpression
					);
				case 'letClause':
					return letClause(
						flworExpressionClause,
						compilationOptions,
						returnOfPreviousExpression
					);
				case 'whereClause':
					return whereClause(
						flworExpressionClause,
						compilationOptions,
						returnOfPreviousExpression
					);
				case 'windowClause':
					throw new Error(
						`Not implemented: ${flworExpressionClause[0]} is not implemented yet.`
					);
				case 'groupByClause':
					throw new Error(
						`Not implemented: ${flworExpressionClause[0]} is not implemented yet.`
					);
				case 'orderByClause':
					return orderByClause(
						flworExpressionClause,
						compilationOptions,
						returnOfPreviousExpression
					);
				case 'countClause':
					throw new Error(
						`Not implemented: ${flworExpressionClause[0]} is not implemented yet.`
					);
				default:
					throw new Error(
						`Not implemented: ${flworExpressionClause[0]} is not supported in a flwor expression`
					);
			}
		},
		compile(returnClauseExpression, compilationOptions)
	);
}

function functionCall(
	ast: IAST,
	compilationOptions: { allowUpdating?: boolean; allowXQuery?: boolean }
) {
	const functionName = astHelper.getFirstChild(ast, 'functionName');
	const functionArguments = astHelper.getChildren(astHelper.getFirstChild(ast, 'arguments'), '*');

	const returnType = astHelper.followPath(ast, ['type']);

	return new FunctionCall(
		new NamedFunctionRef(astHelper.getQName(functionName), functionArguments.length),
		functionArguments.map((arg) =>
			arg[0] === 'argumentPlaceholder' ? null : compile(arg, compilationOptions)
		),
		returnType ? (returnType[1] as SequenceType) : undefined
	);
}

function arrowExpr(ast: IAST, compilationOptions: CompilationOptions) {
	const argExpr = astHelper.followPath(ast, ['argExpr', '*']);

	// Each part an EQName, expression, or arguments passed to the previous part
	const parts = astHelper.getChildren(ast, '*').slice(1);

	let args = [compile(argExpr, compilationOptions)];
	for (let i = 0; i < parts.length; i++) {
		if (parts[i][0] === 'arguments') {
			continue;
		}
		if (parts[i + 1][0] === 'arguments') {
			const functionArguments = astHelper.getChildren(parts[i + 1], '*');
			args = args.concat(
				functionArguments.map((arg) =>
					arg[0] === 'argumentPlaceholder' ? null : compile(arg, compilationOptions)
				)
			);
		}

		const func =
			parts[i][0] === 'EQName'
				? new NamedFunctionRef(astHelper.getQName(parts[i]), args.length)
				: compile(parts[i], disallowUpdating(compilationOptions));
		args = [new FunctionCall(func, args)];
	}
	return args[0];
}

function dynamicFunctionInvocationExpr(ast: IAST, compilationOptions: CompilationOptions) {
	const functionItemContent = astHelper.followPath(ast, ['functionItem', '*']);

	const argumentsAst = astHelper.getFirstChild(ast, 'arguments');
	let args = [];
	if (argumentsAst) {
		const functionArguments = astHelper.getChildren(argumentsAst, '*');
		args = functionArguments.map((arg) =>
			arg[0] === 'argumentPlaceholder' ? null : compile(arg, compilationOptions)
		);
	}

	return new FunctionCall(compile(functionItemContent, compilationOptions), args);
}

function namedFunctionRef(ast: IAST, _compilationOptions: CompilationOptions) {
	const functionName = astHelper.getFirstChild(ast, 'functionName');
	const arity = astHelper.getTextContent(
		astHelper.followPath(ast, ['integerConstantExpr', 'value'])
	);
	return new NamedFunctionRef(astHelper.getQName(functionName), parseInt(arity, 10));
}

function inlineFunction(
	ast: IAST,
	compilationOptions: { allowUpdating?: boolean; allowXQuery?: boolean }
) {
	const params = astHelper.getChildren(astHelper.getFirstChild(ast, 'paramList'), '*');
	const functionBody = astHelper.followPath(ast, ['functionBody', '*']);

	return new InlineFunction(
		params.map((param) => {
			const td: {
				name: QName;
				type: SequenceType;
			} = {
				name: astHelper.getQName(astHelper.getFirstChild(param, 'varName')),
				type: astHelper.getTypeDeclaration(param),
			};
			return td;
		}),
		astHelper.getTypeDeclaration(ast),
		functionBody
			? (compile(functionBody, compilationOptions) as PossiblyUpdatingExpression)
			: new SequenceOperator([])
	);
}

function instanceOf(
	ast: IAST,
	compilationOptions: { allowUpdating?: boolean; allowXQuery?: boolean }
) {
	const expression = compile(astHelper.followPath(ast, ['argExpr', '*']), compilationOptions);
	const sequenceType = astHelper.followPath(ast, ['sequenceType', '*']);
	const occurrence = astHelper.followPath(ast, ['sequenceType', 'occurrenceIndicator']);

	return new InstanceOfOperator(
		expression,
		compile(sequenceType, disallowUpdating(compilationOptions)),
		occurrence ? astHelper.getTextContent(occurrence) : ''
	);
}

function integerConstantExpr(ast: IAST, _compilationOptions: CompilationOptions) {
	return new Literal(astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')), {
		type: ValueType.XSINTEGER,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	});
}

function stringConstantExpr(ast: IAST, _compilationOptions: CompilationOptions) {
	return new Literal(astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')), {
		type: ValueType.XSSTRING,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	});
}

function decimalConstantExpr(ast: IAST, _compilationOptions: CompilationOptions) {
	return new Literal(astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')), {
		type: ValueType.XSDECIMAL,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	});
}

function doubleConstantExpr(ast: IAST, _compilationOptions: CompilationOptions) {
	return new Literal(astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')), {
		type: ValueType.XSDOUBLE,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	});
}

function nameTest(ast: IAST, _compilationOptions: CompilationOptions) {
	return new NameTest(astHelper.getQName(ast));
}

function anyKindTest() {
	return new TypeTest({ prefix: '', namespaceURI: null, localName: 'node()' });
}

function anyItemTest() {
	return new TypeTest({ prefix: '', namespaceURI: null, localName: 'item()' });
}

function pathExpr(ast: IAST, compilationOptions: CompilationOptions) {
	const typeNode = astHelper.followPath(ast, ['type']);
	const rawSteps = astHelper.getChildren(ast, 'stepExpr');
	let hasAxisStep = false;
	const steps = rawSteps.map((step) => {
		const axis = astHelper.getFirstChild(step, 'xpathAxis');

		let stepExpression: Expression;

		if (axis) {
			hasAxisStep = true;
			const test = astHelper.getFirstChild(step, [
				'attributeTest',
				'anyElementTest',
				'piTest',
				'documentTest',
				'elementTest',
				'commentTest',
				'namespaceTest',
				'anyKindTest',
				'textTest',
				'anyFunctionTest',
				'typedFunctionTest',
				'schemaAttributeTest',
				'atomicType',
				'anyItemType',
				'parenthesizedItemType',
				'typedMapTest',
				'typedArrayTest',
				'nameTest',
				'Wildcard',
			]);

			const testExpression = compileTest(test, disallowUpdating(compilationOptions));
			switch (astHelper.getTextContent(axis)) {
				case 'ancestor':
					stepExpression = new AncestorAxis(testExpression, { inclusive: false });
					break;
				case 'ancestor-or-self':
					stepExpression = new AncestorAxis(testExpression, { inclusive: true });
					break;
				case 'attribute':
					stepExpression = new AttributeAxis(testExpression);
					break;
				case 'child':
					stepExpression = new ChildAxis(testExpression);
					break;
				case 'descendant':
					stepExpression = new DescendantAxis(testExpression, { inclusive: false });
					break;
				case 'descendant-or-self':
					stepExpression = new DescendantAxis(testExpression, { inclusive: true });
					break;
				case 'parent':
					stepExpression = new ParentAxis(testExpression);
					break;
				case 'following-sibling':
					stepExpression = new FollowingSiblingAxis(testExpression);
					break;
				case 'preceding-sibling':
					stepExpression = new PrecedingSiblingAxis(testExpression);
					break;
				case 'following':
					stepExpression = new FollowingAxis(testExpression);
					break;
				case 'preceding':
					stepExpression = new PrecedingAxis(testExpression);
					break;
				case 'self':
					stepExpression = new SelfAxis(testExpression);
					break;
			}
		} else {
			// We must be a filter expression
			const filterExpr = astHelper.followPath(step, ['filterExpr', '*']);
			stepExpression = compile(filterExpr, disallowUpdating(compilationOptions));
		}

		const children = astHelper.getChildren(step, '*');

		for (const child of children) {
			switch (child[0]) {
				case 'lookup':
					stepExpression = new Lookup(
						stepExpression,
						compileLookup(child, compilationOptions)
					);
					break;
				case 'predicate':
				case 'predicates':
					stepExpression = astHelper
						.getChildren(child, '*')
						.reduce(
							(innerStep, predicate) =>
								new Filter(
									innerStep,
									compile(predicate, disallowUpdating(compilationOptions))
								),
							stepExpression
						);
					break;
			}
		}

		stepExpression.type = typeNode ? (typeNode[1] as SequenceType) : undefined;
		return stepExpression;
	});

	const isAbsolute = astHelper.getFirstChild(ast, 'rootExpr');
	// If an path has no axis steps, we should skip sorting. The path
	// is probably a chain of filter expressions or lookups
	const requireSorting = hasAxisStep || isAbsolute !== null || rawSteps.length > 1;

	// Directly use expressions which are not path expression
	if (!requireSorting && steps.length === 1) {
		return steps[0];
	}

	// We do not have to sort the result of steps expressions when
	// they already result to a ordered set
	if (
		!isAbsolute &&
		steps.length === 1 &&
		steps[0].expectedResultOrder === RESULT_ORDERINGS.SORTED
	) {
		return steps[0];
	}

	if (isAbsolute && steps.length === 0) {
		return new AbsolutePathExpression(null);
	}
	const pathExpression = new PathExpression(steps, requireSorting);
	if (isAbsolute) {
		return new AbsolutePathExpression(pathExpression);
	}
	return pathExpression;
}

function piTest(ast: IAST, _compilationOptions: CompilationOptions) {
	const piTarget = astHelper.getFirstChild(ast, 'piTarget');
	if (piTarget) {
		return new PITest(astHelper.getTextContent(piTarget));
	}
	return new KindTest(7);
}

function commentTest(_ast: IAST, _compilationOptions: CompilationOptions) {
	return new KindTest(8);
}

function documentTest(_ast: IAST, _compilationOptions: CompilationOptions) {
	return new KindTest(9);
}

function elementTest(ast: IAST, _compilationOptions: CompilationOptions) {
	const elementName = astHelper.getFirstChild(ast, 'elementName');
	const star = elementName && astHelper.getFirstChild(elementName, 'star');
	if (!elementName || star) {
		return new KindTest(1);
	}
	return new NameTest(astHelper.getQName(astHelper.getFirstChild(elementName, 'QName')), {
		kind: 1,
	});
}

function attributeTest(ast: IAST, _compilationOptions: CompilationOptions) {
	const attributeName = astHelper.getFirstChild(ast, 'attributeName');
	const star = attributeName && astHelper.getFirstChild(attributeName, 'star');
	if (!attributeName || star) {
		return new KindTest(2);
	}
	return new NameTest(astHelper.getQName(astHelper.getFirstChild(attributeName, 'QName')), {
		kind: 2,
	});
}

function textTest(_ast: IAST, _compilationOptions: CompilationOptions) {
	return new KindTest(3);
}

function quantified(ast: IAST, compilationOptions: CompilationOptions) {
	const quantifier = astHelper.getTextContent(astHelper.getFirstChild(ast, 'quantifier'));
	const predicateExpr = astHelper.followPath(ast, ['predicateExpr', '*']);
	const quantifierInClauses = astHelper
		.getChildren(ast, 'quantifiedExprInClause')
		.map((inClause) => {
			const name = astHelper.getQName(
				astHelper.followPath(inClause, ['typedVariableBinding', 'varName'])
			);
			const sourceExpr = astHelper.followPath(inClause, ['sourceExpr', '*']);

			return { name, sourceExpr: compile(sourceExpr, disallowUpdating(compilationOptions)) };
		});

	return new QuantifiedExpression(
		quantifier,
		quantifierInClauses,
		compile(predicateExpr, disallowUpdating(compilationOptions))
	);
}

function sequence(ast: IAST, compilationOptions: CompilationOptions) {
	const childExpressions = astHelper
		.getChildren(ast, '*')
		.map((arg) => compile(arg, compilationOptions));
	if (childExpressions.length === 1) {
		return childExpressions[0];
	}

	const typeNode = astHelper.followPath(ast, ['type']);
	return new SequenceOperator(
		astHelper.getChildren(ast, '*').map((arg) => compile(arg, compilationOptions)),
		typeNode ? (typeNode[1] as SequenceType) : undefined
	);
}

function simpleMap(ast: IAST, compilationOptions: CompilationOptions) {
	return astHelper.getChildren(ast, '*').reduce((lhs: Expression, rhs: IAST) => {
		if (lhs === null) {
			return compile(rhs, disallowUpdating(compilationOptions));
		}
		return new SimpleMapOperator(lhs, compile(rhs, disallowUpdating(compilationOptions)));
	}, null);
}

function stringConcatenateOp(ast: IAST, compilationOptions: CompilationOptions) {
	const typeNode = astHelper.followPath(ast, ['type']);
	const args = [
		astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST,
		astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST,
	];
	return new FunctionCall(
		new NamedFunctionRef(
			{
				localName: 'concat',
				namespaceURI: 'http://www.w3.org/2005/xpath-functions',
				prefix: '',
			},
			args.length
		),
		args.map((arg) => compile(arg, disallowUpdating(compilationOptions))),
		typeNode ? (typeNode[1] as SequenceType) : undefined
	);
}

function rangeSequenceExpr(ast: IAST, compilationOptions: CompilationOptions) {
	const typeNode = astHelper.followPath(ast, ['type']);
	const args = [
		astHelper.getFirstChild(ast, 'startExpr')[1] as IAST,
		astHelper.getFirstChild(ast, 'endExpr')[1] as IAST,
	];

	const ref = new NamedFunctionRef(
		{
			localName: 'to',
			namespaceURI: 'http://fontoxpath/operators',
			prefix: '',
		},
		args.length
	);

	return new FunctionCall(
		ref,
		args.map((arg) => compile(arg, disallowUpdating(compilationOptions))),
		typeNode ? (typeNode[1] as SequenceType) : undefined
	);
}

function typeTest(ast: IAST, _compilationOptions: CompilationOptions) {
	const type = astHelper.getQName(ast);
	return new TypeTest(type);
}

function anyMapTest(_ast: IAST, _compilationOptions: CompilationOptions) {
	return new TypeTest({ prefix: '', namespaceURI: null, localName: 'map(*)' });
}

function anyArrayTest(_ast: IAST, _compilationOptions: CompilationOptions) {
	return new TypeTest({ prefix: '', namespaceURI: null, localName: 'array(*)' });
}

function unaryPlus(
	ast: IAST,
	compilationOptions: { allowUpdating?: boolean; allowXQuery?: boolean }
) {
	const operand = astHelper.getFirstChild(astHelper.getFirstChild(ast, 'operand'), '*');
	const typeNode = astHelper.followPath(ast, ['type']);
	return new Unary(
		'+',
		compile(operand, compilationOptions),
		typeNode ? (typeNode[1] as SequenceType) : undefined
	);
}

function unaryMinus(
	ast: IAST,
	compilationOptions: { allowUpdating?: boolean; allowXQuery?: boolean }
) {
	const operand = astHelper.getFirstChild(astHelper.getFirstChild(ast, 'operand'), '*');
	const typeNode = astHelper.followPath(ast, ['type']);
	return new Unary(
		'-',
		compile(operand, compilationOptions),
		typeNode ? (typeNode[1] as SequenceType) : undefined
	);
}

function unionOp(ast: IAST, compilationOptions: CompilationOptions) {
	const typeNode = astHelper.followPath(ast, ['type']);
	return new Union(
		[
			compile(
				astHelper.followPath(ast, ['firstOperand', '*']),
				disallowUpdating(compilationOptions)
			),
			compile(
				astHelper.followPath(ast, ['secondOperand', '*']),
				disallowUpdating(compilationOptions)
			),
		],
		typeNode ? (typeNode[1] as SequenceType) : undefined
	);
}

function intersectExcept(ast: IAST, compilationOptions: CompilationOptions) {
	const typeNode = astHelper.followPath(ast, ['type']);
	return new IntersectExcept(
		ast[0],
		compile(
			astHelper.followPath(ast, ['firstOperand', '*']),
			disallowUpdating(compilationOptions)
		),
		compile(
			astHelper.followPath(ast, ['secondOperand', '*']),
			disallowUpdating(compilationOptions)
		),
		typeNode ? (typeNode[1] as SequenceType) : undefined
	);
}

function varRef(ast: IAST, _compilationOptions: CompilationOptions) {
	const { prefix, namespaceURI, localName } = astHelper.getQName(
		astHelper.getFirstChild(ast, 'name')
	);
	return new VarRef(prefix, namespaceURI, localName);
}

function wildcard(ast: IAST, _compilationOptions: CompilationOptions) {
	if (!astHelper.getFirstChild(ast, 'star')) {
		return new NameTest({
			localName: '*',
			namespaceURI: null,
			prefix: '*',
		});
	}
	const uri = astHelper.getFirstChild(ast, 'uri');
	if (uri) {
		return new NameTest({
			localName: '*',
			namespaceURI: astHelper.getTextContent(uri),
			prefix: '',
		});
	}

	// Either the prefix or the localName are 'starred', find out which one
	const ncName = astHelper.getFirstChild(ast, 'NCName');
	if (astHelper.getFirstChild(ast, '*')[0] === 'star') {
		// The prefix is 'starred'
		return new NameTest({
			localName: astHelper.getTextContent(ncName),
			namespaceURI: null,
			prefix: '*',
		});
	}

	// The localName is 'starred'
	return new NameTest({
		localName: '*',
		namespaceURI: null,
		prefix: astHelper.getTextContent(ncName),
	});
}

// XQuery Node constructors
function dirElementConstructor(ast: IAST, compilationOptions: CompilationOptions) {
	if (!compilationOptions.allowXQuery) {
		throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
	}
	const name = astHelper.getQName(astHelper.getFirstChild(ast, 'tagName'));

	const attList = astHelper.getFirstChild(ast, 'attributeList');
	const attributes = attList
		? astHelper
				.getChildren(attList, 'attributeConstructor')
				.map((attr) => compile(attr, disallowUpdating(compilationOptions)))
		: [];

	const namespaceDecls = attList
		? astHelper.getChildren(attList, 'namespaceDeclaration').map((namespaceDecl) => {
				const prefixElement = astHelper.getFirstChild(namespaceDecl, 'prefix');
				return {
					prefix: prefixElement ? astHelper.getTextContent(prefixElement) : '',
					uri: astHelper.getTextContent(astHelper.getFirstChild(namespaceDecl, 'uri')),
				};
		  })
		: [];

	const content = astHelper.getFirstChild(ast, 'elementContent');
	const contentExpressions = content
		? astHelper
				.getChildren(content, '*')
				.map((child) => compile(child, disallowUpdating(compilationOptions)))
		: [];

	return new ElementConstructor(
		name,
		attributes as AttributeConstructor[],
		namespaceDecls,
		contentExpressions
	);
}

function CDataSection(ast: IAST, _compilationOptions: CompilationOptions) {
	// Walks like a stringliteral, talks like a stringliteral, it's a stringliteral
	return new Literal(astHelper.getTextContent(ast), {
		type: ValueType.XSSTRING,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	});
}

function attributeConstructor(ast: IAST, compilationOptions: CompilationOptions) {
	if (!compilationOptions.allowXQuery) {
		throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
	}
	const attrName = astHelper.getQName(astHelper.getFirstChild(ast, 'attributeName'));
	const attrValueElement = astHelper.getFirstChild(ast, 'attributeValue');
	const attrValue = attrValueElement ? astHelper.getTextContent(attrValueElement) : null;
	const attrValueExprElement = astHelper.getFirstChild(ast, 'attributeValueExpr');
	const attrValueExpressions = attrValueExprElement
		? astHelper
				.getChildren(attrValueExprElement, '*')
				.map((expr) => compile(expr, disallowUpdating(compilationOptions)))
		: null;
	return new AttributeConstructor(attrName, {
		value: attrValue,
		valueExprParts: attrValueExpressions,
	});
}

function computedAttributeConstructor(ast: IAST, compilationOptions: CompilationOptions) {
	const tagName = astHelper.getFirstChild(ast, 'tagName');
	let name: { expr: Expression } | { localName: string; namespaceURI: string; prefix: string };
	if (tagName) {
		name = astHelper.getQName(tagName);
	} else {
		const tagNameExpr = astHelper.getFirstChild(ast, 'tagNameExpr');
		name = {
			expr: compile(
				astHelper.getFirstChild(tagNameExpr, '*'),
				disallowUpdating(compilationOptions)
			),
		};
	}

	const valueExpr = compile(
		astHelper.getFirstChild(astHelper.getFirstChild(ast, 'valueExpr'), '*'),
		disallowUpdating(compilationOptions)
	);

	return new AttributeConstructor(name, {
		valueExprParts: [valueExpr],
	});
}

function computedCommentConstructor(ast: IAST, compilationOptions: CompilationOptions) {
	if (!compilationOptions.allowXQuery) {
		throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
	}
	const argExpr = astHelper.getFirstChild(ast, 'argExpr');
	const expr = argExpr
		? compile(astHelper.getFirstChild(argExpr, '*'), disallowUpdating(compilationOptions))
		: null;
	return new CommentConstructor(expr);
}

function computedTextConstructor(ast: IAST, compilationOptions: CompilationOptions) {
	if (!compilationOptions.allowXQuery) {
		throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
	}
	const argExpr = astHelper.getFirstChild(ast, 'argExpr');
	const expr = argExpr
		? compile(astHelper.getFirstChild(argExpr, '*'), disallowUpdating(compilationOptions))
		: null;
	return new TextConstructor(expr);
}

function computedElementConstructor(ast: IAST, compilationOptions: CompilationOptions) {
	const tagName = astHelper.getFirstChild(ast, 'tagName');
	let name: { expr: Expression } | { localName: string; namespaceURI: string; prefix: string };
	if (tagName) {
		name = astHelper.getQName(tagName);
	} else {
		const tagNameExpr = astHelper.getFirstChild(ast, 'tagNameExpr');
		name = {
			expr: compile(
				astHelper.getFirstChild(tagNameExpr, '*'),
				disallowUpdating(compilationOptions)
			),
		};
	}

	const content = astHelper.getFirstChild(ast, 'contentExpr');
	const contentExpressions = content
		? astHelper
				.getChildren(content, '*')
				.map((child) => compile(child, disallowUpdating(compilationOptions)))
		: [];

	return new ElementConstructor(name, [], [], contentExpressions);
}

function computedPIConstructor(ast: IAST, compilationOptions: CompilationOptions) {
	if (!compilationOptions.allowXQuery) {
		throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
	}

	const targetExpr = astHelper.getFirstChild(ast, 'piTargetExpr');
	const target = astHelper.getFirstChild(ast, 'piTarget');
	const piValueExpr = astHelper.getFirstChild(ast, 'piValueExpr');

	return new PIConstructor(
		{
			targetExpr: targetExpr
				? compile(
						astHelper.getFirstChild(targetExpr, '*'),
						disallowUpdating(compilationOptions)
				  )
				: null,
			targetValue: target ? astHelper.getTextContent(target) : null,
		},
		piValueExpr
			? compile(
					astHelper.getFirstChild(piValueExpr, '*'),
					disallowUpdating(compilationOptions)
			  )
			: new SequenceOperator([])
	);
}

function deleteExpression(
	ast: IAST,
	compilationOptions: { allowUpdating?: boolean; allowXQuery?: boolean }
) {
	const targetExpr = compile(astHelper.followPath(ast, ['targetExpr', '*']), compilationOptions);
	return new DeleteExpression(targetExpr);
}

function insertExpression(ast: IAST, compilationOptions: CompilationOptions) {
	const sourceExpr = compile(astHelper.followPath(ast, ['sourceExpr', '*']), compilationOptions);
	let targetChoice: TargetChoice;
	const insertTargetChoice = astHelper.getChildren(ast, '*')[1];
	switch (insertTargetChoice[0]) {
		case 'insertAfter':
			targetChoice = TargetChoice.INSERT_AFTER;
			break;
		case 'insertBefore':
			targetChoice = TargetChoice.INSERT_BEFORE;
			break;
		case 'insertInto': {
			const insertAfterChoice = astHelper.getFirstChild(insertTargetChoice, '*');
			if (insertAfterChoice) {
				targetChoice =
					insertAfterChoice[0] === 'insertAsFirst'
						? TargetChoice.INSERT_INTO_AS_FIRST
						: TargetChoice.INSERT_INTO_AS_LAST;
			} else {
				targetChoice = TargetChoice.INSERT_INTO;
			}
			break;
		}
	}
	const targetExpr = compile(astHelper.followPath(ast, ['targetExpr', '*']), compilationOptions);
	return new InsertExpression(sourceExpr, targetChoice, targetExpr);
}

function renameExpression(ast: IAST, compilationOptions: CompilationOptions) {
	const targetExpr = compile(astHelper.followPath(ast, ['targetExpr', '*']), compilationOptions);
	const newNameExpr = compile(
		astHelper.followPath(ast, ['newNameExpr', '*']),
		compilationOptions
	);
	return new RenameExpression(targetExpr, newNameExpr);
}

function replaceExpression(ast: IAST, compilationOptions: CompilationOptions) {
	const isReplaceValue = !!astHelper.getFirstChild(ast, 'replaceValue');
	const targetExpr = compile(astHelper.followPath(ast, ['targetExpr', '*']), compilationOptions);
	const replacementExpr = compile(
		astHelper.followPath(ast, ['replacementExpr', '*']),
		compilationOptions
	);
	return new ReplaceExpression(isReplaceValue, targetExpr, replacementExpr);
}

function transformExpression(ast: IAST, compilationOptions: CompilationOptions) {
	const transformCopies = astHelper
		.getChildren(astHelper.getFirstChild(ast, 'transformCopies'), 'transformCopy')
		.map((transformCopy) => {
			const varName = astHelper.getQName(
				astHelper.getFirstChild(astHelper.getFirstChild(transformCopy, 'varRef'), 'name')
			);
			const sourceExpr = compile(
				astHelper.getFirstChild(astHelper.getFirstChild(transformCopy, 'copySource'), '*'),
				compilationOptions
			);
			return {
				sourceExpr,
				varRef: new QName(varName.prefix, varName.namespaceURI, varName.localName),
			};
		});
	const modifyExpr = compile(
		astHelper.getFirstChild(astHelper.getFirstChild(ast, 'modifyExpr'), '*'),
		compilationOptions
	);
	const returnExpr = compile(
		astHelper.getFirstChild(astHelper.getFirstChild(ast, 'returnExpr'), '*'),
		compilationOptions
	);
	return new TransformExpression(transformCopies, modifyExpr, returnExpr);
}

function typeswitchExpr(ast: IAST, compilationOptions: CompilationOptions) {
	if (!compilationOptions.allowXQuery) {
		throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
	}

	const argExpr = compile(
		astHelper.getFirstChild(astHelper.getFirstChild(ast, 'argExpr'), '*'),
		compilationOptions
	);

	const caseClause = astHelper.getChildren(ast, 'typeswitchExprCaseClause');

	const caseClauseExpressions = caseClause.map((caseClauseExpression) => {
		let sequenceTypesAstNodes: IAST[];
		if (astHelper.getChildren(caseClauseExpression, 'sequenceTypeUnion').length === 0) {
			sequenceTypesAstNodes = [astHelper.getFirstChild(caseClauseExpression, 'sequenceType')];
		} else {
			sequenceTypesAstNodes = astHelper.getChildren(
				astHelper.getFirstChild(caseClauseExpression, 'sequenceTypeUnion'),
				'sequenceType'
			);
		}

		const resultExpression = compile(
			astHelper.followPath(caseClauseExpression, ['resultExpr', '*']),
			compilationOptions
		) as PossiblyUpdatingExpression;

		return {
			caseClauseExpression: resultExpression,
			typeTests: sequenceTypesAstNodes.map((sequenceTypeAstNode: IAST) => {
				const occurrenceIndicator = astHelper.getFirstChild(
					sequenceTypeAstNode,
					'occurrenceIndicator'
				);
				return {
					occurrenceIndicator: (occurrenceIndicator
						? astHelper.getTextContent(occurrenceIndicator)
						: '') as '*' | '?' | '+' | '',
					typeTest: compile(
						astHelper.getFirstChild(sequenceTypeAstNode, '*'),
						compilationOptions
					),
				};
			}),
		};
	});

	const defaultExpression = compile(
		astHelper.followPath(ast, ['typeswitchExprDefaultClause', 'resultExpr', '*']),
		compilationOptions
	) as PossiblyUpdatingExpression;

	return new TypeSwitchExpression(argExpr, caseClauseExpressions, defaultExpression);
}

export default function (xPathAst: IAST, compilationOptions: CompilationOptions): Expression {
	return compile(xPathAst, compilationOptions);
}

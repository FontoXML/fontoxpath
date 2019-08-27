import Expression, { RESULT_ORDERINGS } from '../expressions/Expression';
import TestAbstractExpression from '../expressions/tests/TestAbstractExpression';

import astHelper, { IAST } from './astHelper';

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
import StackTraceGenerator, { SourceRange } from '../expressions/debug/StackTraceGenerator';
import ForExpression from '../expressions/ForExpression';
import FunctionCall from '../expressions/functions/FunctionCall';
import InlineFunction from '../expressions/functions/InlineFunction';
import LetExpression from '../expressions/LetExpression';
import Literal from '../expressions/literals/Literal';
import MapConstructor from '../expressions/maps/MapConstructor';
import NamedFunctionRef from '../expressions/NamedFunctionRef';
import BinaryOperator from '../expressions/operators/arithmetic/BinaryOperator';
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
import AbsolutePathExpression from '../expressions/path/AbsolutePathExpression';
import ContextItemExpression from '../expressions/path/ContextItemExpression';
import PathExpression from '../expressions/path/PathExpression';
import Filter from '../expressions/postfix/Filter';
import QuantifiedExpression from '../expressions/quantified/QuantifiedExpression';
import KindTest from '../expressions/tests/KindTest';
import NameTest from '../expressions/tests/NameTest';
import PITest from '../expressions/tests/PITest';
import TypeTest from '../expressions/tests/TypeTest';
import VarRef from '../expressions/VarRef';

import AttributeConstructor from '../expressions/xquery/AttributeConstructor';
import CommentConstructor from '../expressions/xquery/CommentConstructor';
import ElementConstructor from '../expressions/xquery/ElementConstructor';
import PIConstructor from '../expressions/xquery/PIConstructor';
import TypeSwitchExpr from '../expressions/xquery/TypeSwitchExpression';

import DeleteExpression from '../expressions/xquery-update/DeleteExpression';
import InsertExpression, { TargetChoice } from '../expressions/xquery-update/InsertExpression';
import RenameExpression from '../expressions/xquery-update/RenameExpression';
import ReplaceExpression from '../expressions/xquery-update/ReplaceExpression';
import TransformExpression from '../expressions/xquery-update/TransformExpression';

import TypeDeclaration from '../expressions/dataTypes/TypeDeclaration';
import QName from '../expressions/dataTypes/valueTypes/QName';
import PossiblyUpdatingExpression from '../expressions/PossiblyUpdatingExpression';

const COMPILATION_OPTIONS = {
	XPATH_MODE: { allowXQuery: false, allowUpdating: false },
	XQUERY_MODE: { allowXQuery: true, allowUpdating: false },
	XQUERY_UPDATING_MODE: { allowXQuery: true, allowUpdating: true }
};

function disallowUpdating(compilationOptions) {
	if (!compilationOptions.allowXQuery) {
		return COMPILATION_OPTIONS.XPATH_MODE;
	}
	if (!compilationOptions.allowUpdating) {
		return COMPILATION_OPTIONS.XQUERY_MODE;
	}
	return COMPILATION_OPTIONS.XQUERY_UPDATING_MODE;
}

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

function arrayConstructor(ast, compilationOptions) {
	const arrConstructor = astHelper.getFirstChild(ast, '*');
	const members = astHelper
		.getChildren(arrConstructor, 'arrayElem')
		.map(arrayElem =>
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

function mapConstructor(ast, compilationOptions) {
	return new MapConstructor(
		astHelper.getChildren(ast, 'mapConstructorEntry').map(keyValuePair => ({
			key: compile(
				astHelper.followPath(keyValuePair, ['mapKeyExpr', '*']),
				disallowUpdating(compilationOptions)
			),
			value: compile(
				astHelper.followPath(keyValuePair, ['mapValueExpr', '*']),
				disallowUpdating(compilationOptions)
			)
		}))
	);
}

function unwrapBinaryOperator(operatorName, ast, compilationOptions) {
	const compiledAstNodes = [];
	function unwrapInner(innerAst) {
		const firstOperand = astHelper.getFirstChild(innerAst, 'firstOperand')[1];
		const secondOperand = astHelper.getFirstChild(innerAst, 'secondOperand')[1];

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

function andOp(ast, compilationOptions) {
	return new AndOperator(
		unwrapBinaryOperator('andOp', ast, disallowUpdating(compilationOptions))
	);
}

function orOp(ast, compilationOptions) {
	return new OrOperator(unwrapBinaryOperator('orOp', ast, disallowUpdating(compilationOptions)));
}

function binaryOperator(ast, compilationOptions) {
	const kind = ast[0];
	const a = compile(
		astHelper.followPath(ast, ['firstOperand', '*']),
		disallowUpdating(compilationOptions)
	);
	const b = compile(
		astHelper.followPath(ast, ['secondOperand', '*']),
		disallowUpdating(compilationOptions)
	);

	return new BinaryOperator(kind, a, b);
}

function castAs(ast, compilationOptions) {
	const expression = compile(
		astHelper.getFirstChild(astHelper.getFirstChild(ast, 'argExpr'), '*'),
		disallowUpdating(compilationOptions)
	);

	const singleType = astHelper.getFirstChild(ast, 'singleType');
	const targetType = astHelper.getQName(astHelper.getFirstChild(singleType, 'atomicType'));
	const optional = astHelper.getFirstChild(singleType, 'optional') !== null;

	return new CastAsOperator(expression, targetType, optional);
}

function castableAs(ast, compilationOptions) {
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
function compare(ast, compilationOptions) {
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

function IfThenElseExpr(ast, compilationOptions) {
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

function flworExpression(ast, compilationOptions) {
	const [initialClause, ...intermediateClausesAndReturnClause] = astHelper.getChildren(ast, '*');
	const returnClauseExpression = astHelper.getFirstChild(
		intermediateClausesAndReturnClause[intermediateClausesAndReturnClause.length - 1],
		'*'
	);
	const intermediateClauses = intermediateClausesAndReturnClause.slice(0, -1);

	if (intermediateClauses.length) {
		if (!compilationOptions.allowXQuery) {
			throw new Error('XPST0003: Use of XQuery FLWOR expressions in XPath is no allowed');
		}
		throw new Error(
			'Not implemented: Intermediate clauses in flwor expressions are not implemented yet'
		);
	}

	if (initialClause[0] === 'forClause') {
		const forClauseItems = astHelper.getChildren(initialClause, '*');
		return forClauseItems.reduceRight((returnExpr, forClauseItem) => {
			const expression = astHelper.followPath(forClauseItem, ['forExpr', '*']);
			return new ForExpression(
				astHelper.getQName(
					astHelper.followPath(forClauseItem, ['typedVariableBinding', 'varName'])
				),
				compile(expression, disallowUpdating(compilationOptions)),
				returnExpr
			);
		}, compile(returnClauseExpression, compilationOptions));
	}

	if (initialClause[0] === 'letClause') {
		const letClauseItems = astHelper.getChildren(initialClause, '*');
		return letClauseItems.reduceRight((returnExpr, letClauseItem) => {
			const expression = astHelper.followPath(letClauseItem, ['letExpr', '*']);
			return new LetExpression(
				astHelper.getQName(
					astHelper.followPath(letClauseItem, ['typedVariableBinding', 'varName'])
				),
				compile(expression, disallowUpdating(compilationOptions)),
				returnExpr
			);
		}, compile(returnClauseExpression, compilationOptions));
	}

	throw new Error(`Not implemented: ${initialClause[0]} is not supported in a flwor expression`);
}

function functionCall(ast, compilationOptions) {
	const functionName = astHelper.getFirstChild(ast, 'functionName');
	const functionArguments = astHelper.getChildren(astHelper.getFirstChild(ast, 'arguments'), '*');
	return new FunctionCall(
		new NamedFunctionRef(astHelper.getQName(functionName), functionArguments.length),
		functionArguments.map(arg =>
			arg[0] === 'argumentPlaceholder' ? null : compile(arg, compilationOptions)
		)
	);
}

function arrowExpr(ast, compilationOptions) {
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
				functionArguments.map(arg =>
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
		args = functionArguments.map(arg =>
			arg[0] === 'argumentPlaceholder' ? null : compile(arg, compilationOptions)
		);
	}

	return new FunctionCall(compile(functionItemContent, compilationOptions), args);
}

function namedFunctionRef(ast, _compilationOptions) {
	const functionName = astHelper.getFirstChild(ast, 'functionName');
	const arity = astHelper.getTextContent(
		astHelper.followPath(ast, ['integerConstantExpr', 'value'])
	);
	return new NamedFunctionRef(astHelper.getQName(functionName), parseInt(arity, 10));
}

function typeDeclarationToType(typeDeclarationAst: IAST): TypeDeclaration {
	const rawType = astHelper.getFirstChild(typeDeclarationAst, '*');
	let typeName;
	switch (rawType[0]) {
		case 'atomicType': {
			const returnTypeQName = astHelper.getQName(rawType);
			typeName = returnTypeQName.prefix
				? returnTypeQName.prefix + ':' + returnTypeQName.localName
				: returnTypeQName.localName;
			break;
		}
		case 'anyKindTest':
			typeName = 'node()';
			break;
		case 'anyItemType':
			typeName = 'item()';
			break;
		case 'textTest':
			typeName = 'text()';
			break;
		default:
			throw new Error(`Unrecognized type "${rawType[0]}".`);
	}
	const occurrence = astHelper.getFirstChild(typeDeclarationAst, 'occurrenceIndicator');

	return {
		occurrence: occurrence
			? (astHelper.getTextContent(occurrence) as '' | '?' | '+' | '*')
			: '',
		type: typeName
	};
}

function inlineFunction(ast, compilationOptions) {
	const params = astHelper.getChildren(astHelper.getFirstChild(ast, 'paramList'), '*');
	const returnTypeDecl = astHelper.getFirstChild(ast, 'typeDeclaration');
	const functionBody = astHelper.followPath(ast, ['functionBody', '*']);

	return new InlineFunction(
		params.map(param => {
			const paramTypeDecl = astHelper.getFirstChild(param, 'typeDeclaration');
			const td: {
				name: QName;
				type: TypeDeclaration;
			} = {
				name: astHelper.getQName(astHelper.getFirstChild(param, 'varName')),
				type: paramTypeDecl
					? typeDeclarationToType(paramTypeDecl)
					: { type: 'item()', occurrence: '*' }
			};
			return td;
		}),
		returnTypeDecl
			? typeDeclarationToType(returnTypeDecl)
			: { type: 'item()', occurrence: '*' },
		functionBody ? compile(functionBody, compilationOptions) : new SequenceOperator([])
	);
}

function instanceOf(ast, compilationOptions) {
	const expression = compile(astHelper.followPath(ast, ['argExpr', '*']), compilationOptions);
	const sequenceType = astHelper.followPath(ast, ['sequenceType', '*']);
	const occurrence = astHelper.followPath(ast, ['sequenceType', 'occurrenceIndicator']);

	return new InstanceOfOperator(
		expression,
		compile(sequenceType, disallowUpdating(compilationOptions)),
		occurrence ? astHelper.getTextContent(occurrence) : ''
	);
}

function integerConstantExpr(ast, _compilationOptions) {
	return new Literal(
		astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')),
		'xs:integer'
	);
}

function stringConstantExpr(ast, _compilationOptions) {
	return new Literal(
		astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')),
		'xs:string'
	);
}

function decimalConstantExpr(ast, _compilationOptions) {
	return new Literal(
		astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')),
		'xs:decimal'
	);
}

function doubleConstantExpr(ast, _compilationOptions) {
	return new Literal(
		astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')),
		'xs:double'
	);
}

function nameTest(ast, _compilationOptions) {
	return new NameTest(astHelper.getQName(ast));
}

function anyKindTest() {
	return new TypeTest({ prefix: '', namespaceURI: null, localName: 'node()' });
}

function anyItemTest() {
	return new TypeTest({ prefix: '', namespaceURI: null, localName: 'item()' });
}

function pathExpr(ast, compilationOptions) {
	const rawSteps = astHelper.getChildren(ast, 'stepExpr');
	let hasAxisStep = false;
	const steps = rawSteps.map(step => {
		const axis = astHelper.getFirstChild(step, 'xpathAxis');

		const predicates = astHelper.getFirstChild(step, 'predicates');
		let stepExpression;

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
				'Wildcard'
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

		if (!predicates) {
			return stepExpression;
		}
		return astHelper
			.getChildren(predicates, '*')
			.reduce(
				(innerStep, predicate) =>
					new Filter(innerStep, compile(predicate, disallowUpdating(compilationOptions))),
				stepExpression
			);
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

function piTest(ast, _compilationOptions) {
	const piTarget = astHelper.getFirstChild(ast, 'piTarget');
	if (piTarget) {
		return new PITest(astHelper.getTextContent(piTarget));
	}
	return new KindTest(7);
}

function commentTest(_ast, _compilationOptions) {
	return new KindTest(8);
}

function documentTest(_ast, _compilationOptions) {
	return new KindTest(9);
}

function elementTest(ast, _compilationOptions) {
	const elementName = astHelper.getFirstChild(ast, 'elementName');
	const star = elementName && astHelper.getFirstChild(elementName, 'star');
	if (!elementName || star) {
		return new KindTest(1);
	}
	return new NameTest(astHelper.getQName(astHelper.getFirstChild(elementName, 'QName')), {
		kind: 1
	});
}

function attributeTest(ast, _compilationOptions) {
	const attributeName = astHelper.getFirstChild(ast, 'attributeName');
	const star = attributeName && astHelper.getFirstChild(attributeName, 'star');
	if (!attributeName || star) {
		return new KindTest(2);
	}
	return new NameTest(astHelper.getQName(astHelper.getFirstChild(attributeName, 'QName')), {
		kind: 2
	});
}

function textTest(_ast, _compilationOptions) {
	return new KindTest(3);
}

function quantified(ast, compilationOptions) {
	const quantifier = astHelper.getTextContent(astHelper.getFirstChild(ast, 'quantifier'));
	const predicateExpr = astHelper.followPath(ast, ['predicateExpr', '*']);
	const quantifierInClauses = astHelper
		.getChildren(ast, 'quantifiedExprInClause')
		.map(inClause => {
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

function sequence(ast, compilationOptions) {
	const childExpressions = astHelper
		.getChildren(ast, '*')
		.map(arg => compile(arg, compilationOptions));
	if (childExpressions.length === 1) {
		return childExpressions[0];
	}
	return new SequenceOperator(
		astHelper.getChildren(ast, '*').map(arg => compile(arg, compilationOptions))
	);
}

function simpleMap(ast, compilationOptions) {
	return astHelper.getChildren(ast, '*').reduce((lhs: Expression, rhs: IAST) => {
		if (lhs === null) {
			return compile(rhs, disallowUpdating(compilationOptions));
		}
		return new SimpleMapOperator(lhs, compile(rhs, disallowUpdating(compilationOptions)));
	}, null);
}

function stringConcatenateOp(ast, compilationOptions) {
	const args = [
		astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST,
		astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST
	];
	return new FunctionCall(
		new NamedFunctionRef(
			{
				localName: 'concat',
				namespaceURI: 'http://www.w3.org/2005/xpath-functions',
				prefix: ''
			},
			args.length
		),
		args.map(arg => compile(arg, disallowUpdating(compilationOptions)))
	);
}

function rangeSequenceExpr(ast, compilationOptions) {
	const args = [
		astHelper.getFirstChild(ast, 'startExpr')[1] as IAST,
		astHelper.getFirstChild(ast, 'endExpr')[1] as IAST
	];

	const ref = new NamedFunctionRef(
		{
			localName: 'to',
			namespaceURI: 'http://fontoxpath/operators',
			prefix: ''
		},
		args.length
	);

	return new FunctionCall(
		ref,
		args.map(arg => compile(arg, disallowUpdating(compilationOptions)))
	);
}

function typeTest(ast, _compilationOptions) {
	const type = astHelper.getQName(ast);
	return new TypeTest(type);
}

function anyMapTest(_ast, _compilationOptions) {
	return new TypeTest({ prefix: '', namespaceURI: null, localName: 'map(*)' });
}

function anyArrayTest(_ast, _compilationOptions) {
	return new TypeTest({ prefix: '', namespaceURI: null, localName: 'array(*)' });
}

function unaryPlus(ast, compilationOptions) {
	const operand = astHelper.getFirstChild(astHelper.getFirstChild(ast, 'operand'), '*');
	return new Unary('+', compile(operand, compilationOptions));
}

function unaryMinus(ast, compilationOptions) {
	const operand = astHelper.getFirstChild(astHelper.getFirstChild(ast, 'operand'), '*');
	return new Unary('-', compile(operand, compilationOptions));
}

function unionOp(ast, compilationOptions) {
	return new Union([
		compile(
			astHelper.followPath(ast, ['firstOperand', '*']),
			disallowUpdating(compilationOptions)
		),
		compile(
			astHelper.followPath(ast, ['secondOperand', '*']),
			disallowUpdating(compilationOptions)
		)
	]);
}

function intersectExcept(ast, compilationOptions) {
	return new IntersectExcept(
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

function varRef(ast, _compilationOptions) {
	const { prefix, namespaceURI, localName } = astHelper.getQName(
		astHelper.getFirstChild(ast, 'name')
	);
	return new VarRef(prefix, namespaceURI, localName);
}

function wildcard(ast, _compilationOptions) {
	if (!astHelper.getFirstChild(ast, 'star')) {
		return new NameTest({
			localName: '*',
			namespaceURI: null,
			prefix: '*'
		});
	}
	const uri = astHelper.getFirstChild(ast, 'uri');
	if (uri) {
		return new NameTest({
			localName: '*',
			namespaceURI: astHelper.getTextContent(uri),
			prefix: ''
		});
	}

	// Either the prefix or the localName are 'starred', find out which one
	const ncName = astHelper.getFirstChild(ast, 'NCName');
	if (astHelper.getFirstChild(ast, '*')[0] === 'star') {
		// The prefix is 'starred'
		return new NameTest({
			localName: astHelper.getTextContent(ncName),
			namespaceURI: null,
			prefix: '*'
		});
	}

	// The localName is 'starred'
	return new NameTest({
		localName: '*',
		namespaceURI: null,
		prefix: astHelper.getTextContent(ncName)
	});
}

// XQuery Node constructors
function dirElementConstructor(ast, compilationOptions) {
	if (!compilationOptions.allowXQuery) {
		throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
	}
	const name = astHelper.getQName(astHelper.getFirstChild(ast, 'tagName'));

	const attList = astHelper.getFirstChild(ast, 'attributeList');
	const attributes = attList
		? astHelper
				.getChildren(attList, 'attributeConstructor')
				.map(attr => compile(attr, disallowUpdating(compilationOptions)))
		: [];

	const namespaceDecls = attList
		? astHelper.getChildren(attList, 'namespaceDeclaration').map(namespaceDecl => {
				const prefixElement = astHelper.getFirstChild(namespaceDecl, 'prefix');
				return {
					prefix: prefixElement ? astHelper.getTextContent(prefixElement) : '',
					uri: astHelper.getTextContent(astHelper.getFirstChild(namespaceDecl, 'uri'))
				};
		  })
		: [];

	const content = astHelper.getFirstChild(ast, 'elementContent');
	const contentExpressions = content
		? astHelper
				.getChildren(content, '*')
				.map(child => compile(child, disallowUpdating(compilationOptions)))
		: [];

	return new ElementConstructor(
		name,
		attributes as AttributeConstructor[],
		namespaceDecls,
		contentExpressions
	);
}

function CDataSection(ast, _compilationOptions) {
	// Walks like a stringliteral, talks like a stringliteral, it's a stringliteral
	return new Literal(astHelper.getTextContent(ast), 'xs:string');
}

function attributeConstructor(ast, compilationOptions) {
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
				.map(expr => compile(expr, disallowUpdating(compilationOptions)))
		: null;
	return new AttributeConstructor(attrName, {
		value: attrValue,
		valueExprParts: attrValueExpressions
	});
}

function computedAttributeConstructor(ast, compilationOptions) {
	const tagName = astHelper.getFirstChild(ast, 'tagName');
	let name;
	if (tagName) {
		name = astHelper.getQName(tagName);
	} else {
		const tagNameExpr = astHelper.getFirstChild(ast, 'tagNameExpr');
		name = {
			expr: compile(
				astHelper.getFirstChild(tagNameExpr, '*'),
				disallowUpdating(compilationOptions)
			)
		};
	}

	const valueExpr = compile(
		astHelper.getFirstChild(astHelper.getFirstChild(ast, 'valueExpr'), '*'),
		disallowUpdating(compilationOptions)
	);

	return new AttributeConstructor(name, {
		valueExprParts: [valueExpr]
	});
}

function computedCommentConstructor(ast, compilationOptions) {
	if (!compilationOptions.allowXQuery) {
		throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
	}
	const argExpr = astHelper.getFirstChild(ast, 'argExpr');
	const expr = argExpr
		? compile(astHelper.getFirstChild(argExpr, '*'), disallowUpdating(compilationOptions))
		: null;
	return new CommentConstructor(expr);
}

function computedElementConstructor(ast, compilationOptions) {
	const tagName = astHelper.getFirstChild(ast, 'tagName');
	let name;
	if (tagName) {
		name = astHelper.getQName(tagName);
	} else {
		const tagNameExpr = astHelper.getFirstChild(ast, 'tagNameExpr');
		name = {
			expr: compile(
				astHelper.getFirstChild(tagNameExpr, '*'),
				disallowUpdating(compilationOptions)
			)
		};
	}

	const content = astHelper.getFirstChild(ast, 'contentExpr');
	const contentExpressions = content
		? astHelper
				.getChildren(content, '*')
				.map(child => compile(child, disallowUpdating(compilationOptions)))
		: [];

	return new ElementConstructor(name, [], [], contentExpressions);
}

function computedPIConstructor(ast, compilationOptions) {
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
			targetValue: target ? astHelper.getTextContent(target) : null
		},
		piValueExpr
			? compile(
					astHelper.getFirstChild(piValueExpr, '*'),
					disallowUpdating(compilationOptions)
			  )
			: new SequenceOperator([])
	);
}

function deleteExpression(ast, compilationOptions) {
	const targetExpr = compile(astHelper.followPath(ast, ['targetExpr', '*']), compilationOptions);
	return new DeleteExpression(targetExpr);
}

function insertExpression(ast, compilationOptions) {
	const sourceExpr = compile(astHelper.followPath(ast, ['sourceExpr', '*']), compilationOptions);
	let targetChoice;
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

function renameExpression(ast, compilationOptions) {
	const targetExpr = compile(astHelper.followPath(ast, ['targetExpr', '*']), compilationOptions);
	const newNameExpr = compile(
		astHelper.followPath(ast, ['newNameExpr', '*']),
		compilationOptions
	);
	return new RenameExpression(targetExpr, newNameExpr);
}

function replaceExpression(ast: IAST, compilationOptions) {
	const isReplaceValue = !!astHelper.getFirstChild(ast, 'replaceValue');
	const targetExpr = compile(astHelper.followPath(ast, ['targetExpr', '*']), compilationOptions);
	const replacementExpr = compile(
		astHelper.followPath(ast, ['replacementExpr', '*']),
		compilationOptions
	);
	return new ReplaceExpression(isReplaceValue, targetExpr, replacementExpr);
}

function transformExpression(ast, compilationOptions) {
	const transformCopies = astHelper
		.getChildren(astHelper.getFirstChild(ast, 'transformCopies'), 'transformCopy')
		.map(transformCopy => {
			const varName = astHelper.getQName(
				astHelper.getFirstChild(astHelper.getFirstChild(transformCopy, 'varRef'), 'name')
			);
			const sourceExpr = compile(
				astHelper.getFirstChild(astHelper.getFirstChild(transformCopy, 'copySource'), '*'),
				compilationOptions
			);
			return {
				sourceExpr,
				varRef: new QName(varName.prefix, varName.namespaceURI, varName.localName)
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

	const caseClauseExpressions = caseClause.map(caseClauseExpression => {
		let sequenceTypesAstNodes;
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
			typeTests: sequenceTypesAstNodes.map(sequenceTypeAstNode => {
				const occurrenceIndicator = astHelper.getFirstChild(
					sequenceTypeAstNode,
					'occurrenceIndicator'
				);
				return {
					occurrenceIndicator: occurrenceIndicator
						? astHelper.getTextContent(occurrenceIndicator)
						: '',
					typeTest: compile(
						astHelper.getFirstChild(sequenceTypeAstNode, '*'),
						compilationOptions
					)
				};
			})
		};
	});

	const defaultExpression = compile(
		astHelper.followPath(ast, ['typeswitchExprDefaultClause', 'resultExpr', '*']),
		compilationOptions
	) as PossiblyUpdatingExpression;

	return new TypeSwitchExpr(argExpr, caseClauseExpressions, defaultExpression);
}

type CompilationOptions = { allowUpdating?: boolean; allowXQuery?: boolean };

export default function(xPathAst: IAST, compilationOptions: CompilationOptions): Expression {
	return compile(xPathAst, compilationOptions);
}

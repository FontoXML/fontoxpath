import Expression from '../expressions/Expression';
import TestAbstractExpression from '../expressions/tests/TestAbstractExpression';

import astHelper from './astHelper';

import PathExpression from '../expressions/path/PathExpression';
import ForExpression from '../expressions/ForExpression';
import MapConstructor from '../expressions/maps/MapConstructor';
import CurlyArrayConstructor from '../expressions/arrays/CurlyArrayConstructor';
import SquareArrayConstructor from '../expressions/arrays/SquareArrayConstructor';
import AbsolutePathExpression from '../expressions/path/AbsolutePathExpression';
import Filter from '../expressions/postfix/Filter';
import AttributeAxis from '../expressions/axes/AttributeAxis';
import AncestorAxis from '../expressions/axes/AncestorAxis';
import ChildAxis from '../expressions/axes/ChildAxis';
import ContextItemExpression from '../expressions/path/ContextItemExpression';
import DescendantAxis from '../expressions/axes/DescendantAxis';
import FollowingAxis from '../expressions/axes/FollowingAxis';
import FollowingSiblingAxis from '../expressions/axes/FollowingSiblingAxis';
import ParentAxis from '../expressions/axes/ParentAxis';
import PrecedingAxis from '../expressions/axes/PrecedingAxis';
import PrecedingSiblingAxis from '../expressions/axes/PrecedingSiblingAxis';
import SelfExpression from '../expressions/axes/SelfAxis';
import NameTest from '../expressions/tests/NameTest';
import KindTest from '../expressions/tests/KindTest';
import PITest from '../expressions/tests/PITest';
import TypeTest from '../expressions/tests/TypeTest';
import FunctionCall from '../expressions/functions/FunctionCall';
import InlineFunction from '../expressions/functions/InlineFunction';
import AndOperator from '../expressions/operators/boolean/AndOperator';
import OrOperator from '../expressions/operators/boolean/OrOperator';
import UniversalExpression from '../expressions/operators/UniversalExpression';
import Union from '../expressions/operators/Union';
import IntersectExcept from '../expressions/operators/IntersectExcept';
import SequenceOperator from '../expressions/operators/SequenceOperator';
import SimpleMapOperator from '../expressions/operators/SimpleMapOperator';
import Unary from '../expressions/operators/arithmetic/Unary';
import BinaryOperator from '../expressions/operators/arithmetic/BinaryOperator';
import Compare from '../expressions/operators/compares/Compare';
import InstanceOfOperator from '../expressions/operators/types/InstanceOfOperator';
import CastAsOperator from '../expressions/operators/types/CastAsOperator';
import CastableAsOperator from '../expressions/operators/types/CastableAsOperator';
import QuantifiedExpression from '../expressions/quantified/QuantifiedExpression';
import IfExpression from '../expressions/conditional/IfExpression';
import Literal from '../expressions/literals/Literal';
import LetExpression from '../expressions/LetExpression';
import NamedFunctionRef from '../expressions/NamedFunctionRef';
import VarRef from '../expressions/VarRef';

import DirElementConstructor from '../expressions/xquery/DirElementConstructor';
import AttributeConstructor from '../expressions/xquery/AttributeConstructor';
import DirCommentConstructor from '../expressions/xquery/DirCommentConstructor';
import DirPIConstructor from '../expressions/xquery/DirPIConstructor';

/**
 * @param   {Array<?>}                ast
 * @param   {{allowXQuery:boolean}}   compilationOptions
 * @return  {!Expression}
 */
function compile (ast, compilationOptions) {
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

			// Postfix operators
		case 'filter':
			return filter(ast, compilationOptions);

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

			// XQuery node constructors
		case 'elementConstructor':
			return dirElementConstructor(ast, compilationOptions);
		case 'attributeConstructor':
			return attributeConstructor(ast, compilationOptions);
		case 'computedCommentConstructor':
			return computedCommentConstructor(ast, compilationOptions);
		case 'computedPIConstructor':
			return computedPIConstructor(ast, compilationOptions);
		case 'CDataSection':
			return CDataSection(ast, compilationOptions);
		default:
			return compileTest(ast, compilationOptions);
	}
}

function compileTest (ast, compilationOptions) {
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
		case 'attributeTest':
			return attributeTest(ast, compilationOptions);
		case 'elementTest':
			return elementTest(ast, compilationOptions);
		case 'anyKindTest':
			return anyKindTest(ast, compilationOptions);
		case 'anyMapTest':
			return anyMapTest(ast, compilationOptions);
		case 'anyArrayTest':
			return anyArrayTest(ast, compilationOptions);
		case 'Wildcard':
			return wildcard(ast, compilationOptions);
		case 'atomicType':
			return typeTest(ast, compilationOptions);
		default:
			throw new Error('No selector counterpart for: ' + ast[0] + '.');
	}
}

function arrayConstructor (ast, compilationOptions) {
	const arrConstructor = astHelper.getFirstChild(ast, '*');
	const members = astHelper.getChildren(arrConstructor, 'arrayElem').map(arrayElem => compile(astHelper.getFirstChild(arrayElem, '*'), compilationOptions));
	switch (arrConstructor[0]) {
		case 'curlyArray':
			return new CurlyArrayConstructor(members);
		case 'squareArray':
			return new SquareArrayConstructor(members);
		default:
			throw new Error('Unrecognized arrayType: ' + arrConstructor[0]);
	}
}

function mapConstructor (ast, compilationOptions) {
	return new MapConstructor(
		astHelper.getChildren(ast, 'mapConstructorEntry')
			.map(keyValuePair => ({
				key: compile(astHelper.followPath(keyValuePair, ['mapKeyExpr', '*']), compilationOptions),
				value: compile(astHelper.followPath(keyValuePair, ['mapValueExpr', '*']), compilationOptions)
			})));
}

function andOp (ast, compilationOptions) {
	return new AndOperator([
		compile(astHelper.getFirstChild(ast, 'firstOperand')[1], compilationOptions),
		compile(astHelper.getFirstChild(ast, 'secondOperand')[1], compilationOptions)
	]);
}

function binaryOperator (ast, compilationOptions) {
	const kind = ast[0];
	const a = compile(astHelper.followPath(ast, ['firstOperand', '*']), compilationOptions);
	const b = compile(astHelper.followPath(ast, ['secondOperand', '*']), compilationOptions);

	return new BinaryOperator(kind, a, b);
}

function castAs (ast, compilationOptions) {
	const expression = compile(astHelper.getFirstChild(astHelper.getFirstChild(ast, 'argExpr'), '*'), compilationOptions);

	const singleType = astHelper.getFirstChild(ast, 'singleType');
	const targetType = astHelper.getQName(astHelper.getFirstChild(singleType, 'atomicType'));
	const optional = astHelper.getFirstChild(singleType, 'optional') !== null;

	return new CastAsOperator(expression, targetType, optional);
}

function castableAs (ast, compilationOptions) {
	const expression = compile(astHelper.getFirstChild(astHelper.getFirstChild(ast, 'argExpr'), '*'), compilationOptions);

	const singleType = astHelper.getFirstChild(ast, 'singleType');
	const targetType = astHelper.getQName(astHelper.getFirstChild(singleType, 'atomicType'));
	const optional = astHelper.getFirstChild(singleType, 'optional') !== null;

	return new CastableAsOperator(expression, targetType, optional);
}

// Binary compare (=, !=, le, is, <<, >>, etc)
function compare (ast, compilationOptions) {
	return new Compare(
		ast[0],
		compile(astHelper.followPath(ast, ['firstOperand', '*']), compilationOptions),
		compile(astHelper.followPath(ast, ['secondOperand', '*']), compilationOptions));
}

function IfThenElseExpr (ast, compilationOptions) {
	return new IfExpression(
		compile(astHelper.getFirstChild(astHelper.getFirstChild(ast, 'ifClause'), '*'), compilationOptions),
		compile(astHelper.getFirstChild(astHelper.getFirstChild(ast, 'thenClause'), '*'), compilationOptions),
		compile(astHelper.getFirstChild(astHelper.getFirstChild(ast, 'elseClause'), '*'), compilationOptions));
}

function filter (ast, compilationOptions) {
	return new Filter(compile(ast[1], compilationOptions), compile(ast[0], compilationOptions));
}

function flworExpression (ast, compilationOptions) {
	const [initialClause, ...intermediateClausesAndReturnClause] = astHelper.getChildren(ast, '*');
	const returnClauseExpression = astHelper.getFirstChild(intermediateClausesAndReturnClause[intermediateClausesAndReturnClause.length - 1], '*');
	const intermediateClauses = intermediateClausesAndReturnClause.slice(0, -1);

	if (intermediateClauses.length) {
		throw new Error('Not implemented: Intermediate clauses in flwor expressions are not implemented yet');
	}

	if (initialClause[0] === 'forClause') {
		const forClauseItems = astHelper.getChildren(initialClause, '*');
		return forClauseItems
			.reduceRight(
				(returnExpr, forClauseItem) => {
					const expression = 	astHelper.followPath(forClauseItem, ['forExpr', '*']);
					return new ForExpression(
						astHelper.getQName(astHelper.followPath(forClauseItem, ['typedVariableBinding', 'varName'])),
						compile(expression, compilationOptions),
						returnExpr);
				},
				compile(returnClauseExpression, compilationOptions));
	}

	if (initialClause[0] === 'letClause') {
		const letClauseItems = astHelper.getChildren(initialClause, '*');
		return letClauseItems
			.reduceRight(
				(returnExpr, letClauseItem) => {
					const expression = 	astHelper.followPath(letClauseItem, ['letExpr', '*']);
					return new LetExpression(
						astHelper.getQName(astHelper.followPath(letClauseItem, ['typedVariableBinding', 'varName'])),
						compile(expression, compilationOptions),
						returnExpr);
				},
				compile(returnClauseExpression, compilationOptions));
	}

	throw new Error(`Not implemented: ${initialClause[0]} is not supported in a flwor expression`);
}

function functionCall (ast, compilationOptions) {
	const functionName = astHelper.getFirstChild(ast, 'functionName');
	const functionArguments = astHelper.getChildren(astHelper.getFirstChild(ast, 'arguments'), '*');
	return new FunctionCall(
		new NamedFunctionRef(
			astHelper.getQName(functionName),
			functionArguments.length),
		functionArguments.map(arg => arg[0] === 'argumentPlaceholder' ? null : compile(arg, compilationOptions)));
}

function arrowExpr (ast, compilationOptions) {
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
			args = args.concat(functionArguments.map(arg => arg[0] === 'argumentPlaceholder' ? null : compile(arg, compilationOptions)));
		}

		const func = parts[i][0] === 'EQName' ?
			new NamedFunctionRef(astHelper.getQName(parts[i]), args.length) :
			compile(parts[i], compilationOptions);
		args = [new FunctionCall(func, args)];

	}
	return args[0];
}

function dynamicFunctionInvocationExpr (ast, compilationOptions) {
	const functionItemContent = astHelper.followPath(ast, ['functionItem', '*']);

	const argumentsAst = astHelper.getFirstChild(ast, 'arguments');
	let args = [];
	if (argumentsAst) {
		const functionArguments = astHelper.getChildren(argumentsAst, '*');
		args = functionArguments.map(arg => arg[0] === 'argumentPlaceholder' ? null : compile(arg, compilationOptions));
	}

	return new FunctionCall(
		compile(functionItemContent, compilationOptions),
		args);
}

function namedFunctionRef (ast, _compilationOptions) {
	const functionName = astHelper.getFirstChild(ast, 'functionName');
	const arity = astHelper.getTextContent(astHelper.followPath(ast, ['integerConstantExpr', 'value']));
	return new NamedFunctionRef(astHelper.getQName(functionName), parseInt(arity, 10));
}

function typeDeclarationToType (typeDeclarationAst) {
	const rawType = astHelper.getFirstChild(typeDeclarationAst, '*');
	let typeName;
	switch (rawType[0]) {
		case 'atomicType': {
			const returnTypeQName = astHelper.getQName(rawType);
			typeName = returnTypeQName.prefix ?
				returnTypeQName.prefix + ':' + returnTypeQName.localName :
				returnTypeQName.localName;
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
			throw new Error('Unrecognized type');
	}
	const occurrence = astHelper.getFirstChild(typeDeclarationAst, 'occurrenceIndicator');

	return {
		type: typeName,
		occurrence: occurrence ? astHelper.getTextContent(occurrence) : ''
	};
}

function inlineFunction (ast, compilationOptions) {
	const params = astHelper.getChildren(astHelper.getFirstChild(ast, 'paramList'), '*');
	const returnTypeDecl = astHelper.getFirstChild(ast, 'typeDeclaration');
	const functionBody = astHelper.followPath(ast, ['functionBody', '*']);

	return new InlineFunction(
		params.map(param => {
			const paramTypeDecl = astHelper.getFirstChild(param, 'typeDeclaration');
			return {
				name: astHelper.getQName(astHelper.getFirstChild(param, 'varName')),
				type: paramTypeDecl ? typeDeclarationToType(paramTypeDecl) : { type: 'item()', occurrence: '*' }
			};
		}),
		returnTypeDecl ? typeDeclarationToType(returnTypeDecl) : { type: 'item()', occurrence: '*' },
		compile(functionBody, compilationOptions));
}

function instanceOf (ast, compilationOptions) {
	const expression = compile(astHelper.followPath(ast, ['argExpr', '*']), compilationOptions);
	const sequenceType = astHelper.followPath(ast, ['sequenceType', '*']);
	const occurrence = astHelper.followPath(ast, ['sequenceType', 'occurrenceIndicator']);

	return new InstanceOfOperator(
		expression,
		compile(sequenceType, compilationOptions),
		occurrence ? astHelper.getTextContent(occurrence) : '');
}

function integerConstantExpr (ast, _compilationOptions) {
	return new Literal(
		astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')),
		'xs:integer');
}

function stringConstantExpr (ast, _compilationOptions) {
	return new Literal(
		astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')),
		'xs:string');
}

function decimalConstantExpr (ast, _compilationOptions) {
	return new Literal(
		astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')),
		'xs:decimal');
}

function doubleConstantExpr (ast, _compilationOptions) {
	return new Literal(
		astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')),
		'xs:double');
}

function nameTest (ast, _compilationOptions) {
	return new NameTest(astHelper.getQName(ast));
}

function anyKindTest (ast, compilationOptions) {
	return new TypeTest({ prefix: '', namespaceURI: null, localName: 'node()' });
}

function orOp (ast, compilationOptions) {
	return new OrOperator([
		compile(astHelper.getFirstChild(ast, 'firstOperand')[1], compilationOptions),
		compile(astHelper.getFirstChild(ast, 'secondOperand')[1], compilationOptions)
	]);
}

function pathExpr (ast, compilationOptions) {
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

			switch (astHelper.getTextContent(axis)) {
				case 'ancestor':
					stepExpression = new AncestorAxis(compileTest(test, compilationOptions), { inclusive: false });
					break;
				case 'ancestor-or-self':
					stepExpression = new AncestorAxis(compileTest(test, compilationOptions), { inclusive: true });
					break;
				case 'attribute':
					stepExpression = new AttributeAxis(compileTest(test, compilationOptions));
					break;
				case 'child':
					stepExpression = new ChildAxis(compileTest(test, compilationOptions));
					break;
				case 'descendant':
					stepExpression = new DescendantAxis(compileTest(test, compilationOptions), { inclusive: false });
					break;
				case 'descendant-or-self':
					stepExpression = new DescendantAxis(compileTest(test, compilationOptions), { inclusive: true });
					break;
				case 'parent':
					stepExpression = new ParentAxis(compileTest(test, compilationOptions));
					break;
				case 'following-sibling':
					stepExpression = new FollowingSiblingAxis(compileTest(test, compilationOptions));
					break;
				case 'preceding-sibling':
					stepExpression = new PrecedingSiblingAxis(compileTest(test, compilationOptions));
					break;
				case 'following':
					stepExpression = new FollowingAxis(compileTest(test, compilationOptions));
					break;
				case 'preceding':
					stepExpression = new PrecedingAxis(compileTest(test, compilationOptions));
					break;
				case 'self':
					stepExpression = new SelfExpression(compileTest(test, compilationOptions));
					break;
			}
		}
		else {
			// We must be a filter expression
			const filterExpr = astHelper.followPath(step, ['filterExpr', '*']);
			stepExpression = compile(filterExpr, compilationOptions);
		}

		if (!predicates) {
			return stepExpression;
		}
		return astHelper.getChildren(predicates, '*')
			.reduce(
				(innerStep, predicate) => new Filter(innerStep, compile(predicate, compilationOptions)),
				stepExpression);

	});
	const isAbsolute = astHelper.getFirstChild(ast, 'rootExpr');
	// If an path has no axis steps, we should skip sorting. The path
	// is probably a chain of filter expressions or lookups
	const requireSorting = hasAxisStep || isAbsolute || rawSteps.length > 1;

	// Directly use expressions which are not path expression
	if (!requireSorting && steps.length === 1) {
		return steps[0];
	}

	if (isAbsolute && steps.length === 0) {
		return new AbsolutePathExpression(null);
	}
	const pathExpr = new PathExpression(steps, requireSorting);
	if (isAbsolute) {
		return new AbsolutePathExpression(pathExpr);
	}
	return pathExpr;
}

function piTest (ast, compilationOptions) {
	return new KindTest(7);
}

function commentTest (ast, compilationOptions) {
	return new KindTest(8);
}

function elementTest (ast, compilationOptions) {
	const elementName = astHelper.getFirstChild(ast, 'elementName');
	const star = elementName && astHelper.getFirstChild(elementName, 'star');
	if (!elementName || star) {
		return new KindTest(1);
	}
	return new NameTest(astHelper.getQName(astHelper.getFirstChild(elementName, 'QName')), {kind: 1});
}

function attributeTest (ast, compilationOptions) {
	const attributeName = astHelper.getFirstChild(ast, 'attributeName');
	const star = attributeName && astHelper.getFirstChild(attributeName, 'star');
	if (!attributeName || star) {
		return new KindTest(2);
	}
	return new NameTest(astHelper.getQName(astHelper.getFirstChild(attributeName, 'QName')), { kind: 2 });
}

function textTest (_ast, _compilationOptions) {
	return new KindTest(3);
}

function quantified (ast, compilationOptions) {
	const quantifier = astHelper.getTextContent(astHelper.getFirstChild(ast, 'quantifier'));
	const predicateExpr = astHelper.followPath(ast, ['predicateExpr', '*']);
	const quantifierInClauses = astHelper.getChildren(ast, 'quantifiedExprInClause')
		.map(inClause => {
			const name = astHelper.getQName(astHelper.followPath(inClause, ['typedVariableBinding', 'varName']));
			const sourceExpr = astHelper.followPath(inClause, ['sourceExpr', '*']);

			return { name, sourceExpr: compile(sourceExpr, compilationOptions) };
		});

	return new QuantifiedExpression(quantifier, quantifierInClauses, compile(predicateExpr, compilationOptions));
}

function sequence (ast, compilationOptions) {
	return new SequenceOperator(astHelper.getChildren(ast, '*').map(arg => compile(arg, compilationOptions)));
}

function simpleMap (ast, compilationOptions) {
	return astHelper.getChildren(ast, '*')
		.reduceRight((lhs, rhs) => {
			if (lhs === null) {
				return compile(rhs, compilationOptions);
			}
			return new SimpleMapOperator(compile(rhs, compilationOptions), lhs);
		}, null);
}

function stringConcatenateOp (ast, compilationOptions) {
	const args = [
		astHelper.getFirstChild(ast, 'firstOperand')[1],
		astHelper.getFirstChild(ast, 'secondOperand')[1]];
	return new FunctionCall(
		new NamedFunctionRef(
			{
				namespaceURI: 'http://www.w3.org/2005/xpath-functions',
				prefix: '',
				localName: 'concat'
			},
			args.length),
		args.map(arg => compile(arg, compilationOptions)));
}

function rangeSequenceExpr (ast, compilationOptions) {
	const args = [
		astHelper.getFirstChild(ast, 'startExpr')[1],
		astHelper.getFirstChild(ast, 'endExpr')[1]];
	return new FunctionCall(
		new NamedFunctionRef(
			{
				namespaceURI: 'http://fontoxpath/operators',
				prefix: '',
				localName: 'to'
			},
			args.length),
		args.map(arg => compile(arg, compilationOptions)));
}

function typeTest (ast, _compilationOptions) {
	const type = astHelper.getQName(ast);
	return new TypeTest(type);
}

function anyMapTest (_ast, _compilationOptions) {
	return new TypeTest({ prefix: '', namespaceURI: null, localName: 'map(*)' });
}

function anyArrayTest (_ast, _compilationOptions) {
	return new TypeTest({ prefix: '', namespaceURI: null, localName: 'array(*)' });
}

function unaryPlus (ast, compilationOptions) {
	const operand = astHelper.getFirstChild(astHelper.getFirstChild(ast, 'operand'), '*');
	return new Unary('+', compile(operand, compilationOptions));
}

function unaryMinus (ast, compilationOptions) {
	const operand = astHelper.getFirstChild(astHelper.getFirstChild(ast, 'operand'), '*');
	return new Unary('-', compile(operand, compilationOptions));
}

function unionOp (ast, compilationOptions) {
	return new Union([
		compile(astHelper.followPath(ast, ['firstOperand', '*']), compilationOptions),
		compile(astHelper.followPath(ast, ['secondOperand', '*']), compilationOptions)
	]);
}

function intersectExcept (ast, compilationOptions) {
	return new IntersectExcept(
		ast[0],
		compile(astHelper.followPath(ast, ['firstOperand', '*']), compilationOptions),
		compile(astHelper.followPath(ast, ['secondOperand', '*']), compilationOptions)
	);
}

function varRef (ast, _compilationOptions) {
	const { prefix, namespaceURI, localName } = astHelper.getQName(astHelper.getFirstChild(ast, 'name'));
	return new VarRef(prefix, namespaceURI, localName );
}

function wildcard (ast, compilationOptions) {
	if (!astHelper.getFirstChild(ast, 'star')) {
		return new NameTest({
			namespaceURI: null,
			prefix: '*',
			localName: '*'
		});
	}
	const uri = astHelper.getFirstChild(ast, 'uri');
	if (uri) {
		return new NameTest({
			prefix: '',
			namespaceURI: astHelper.getTextContent(uri),
			localName: '*'
		});
	}

	// Either the prefix or the localName are 'starred', find out which one
	const ncName = astHelper.getFirstChild(ast, 'NCName');
	if (astHelper.getFirstChild(ast, '*')[0] === 'star') {
		// The prefix is 'starred'
		return new NameTest({
		namespaceURI: null,
			prefix: '*',
			localName: astHelper.getTextContent(ncName)
		});
	}

	// The localName is 'starred'
	return new NameTest({
		namespaceURI: null,
		prefix: astHelper.getTextContent(ncName),
		localName: '*'
	});
}

// XQuery Node constructors
function dirElementConstructor (ast, compilationOptions) {
	if (!compilationOptions.allowXQuery) {
		throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
	}
	const name = astHelper.getQName(astHelper.getFirstChild(ast, 'tagName'));

	const attList = astHelper.getFirstChild(ast, 'attributeList');
	const attributes = attList ? astHelper
		.getChildren(attList, 'attributeConstructor')
		.map(attr => compile(attr, compilationOptions)) : [];
	const namespaceDecls = attList ? astHelper
		.getChildren(attList, 'namespaceDeclaration')
		.map(namespaceDecl => {
			const prefixElement = astHelper.getFirstChild(namespaceDecl, 'prefix');
			return {
				prefix: prefixElement ? astHelper.getTextContent(prefixElement) : null,
				uri: astHelper.getTextContent(astHelper.getFirstChild(namespaceDecl, 'uri'))
			};
		}) : [];

	const content = astHelper.getFirstChild(ast, 'elementContent');
	const contentExpressions = content ? astHelper.getChildren(content, '*')
		.map(content => compile(content, compilationOptions)) : [];

	return new DirElementConstructor(
		name,
		attributes,
		namespaceDecls,
		contentExpressions);
}

function CDataSection (ast, compilationOptions) {
	// Walks like a stringliteral, talks like a stringliteral, it's a stringliteral
	return new Literal(astHelper.getTextContent(ast), 'xs:string');
}

function attributeConstructor (ast, compilationOptions) {
	if (!compilationOptions.allowXQuery) {
		throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
	}
	const attrName = astHelper.getQName(astHelper.getFirstChild(ast, 'attributeName'));
	const attrValueElement = astHelper.getFirstChild(ast, 'attributeValue');
	const attrValue = attrValueElement ? astHelper.getTextContent(attrValueElement) : null;
	const attrValueExprElement = astHelper.getFirstChild(ast, 'attributeValueExpr');
	const attrValueExpressions = attrValueExprElement ?
		astHelper
			.getChildren(attrValueExprElement, '*')
			.map(expr => compile(expr, compilationOptions)) :
		null;
	return new AttributeConstructor(attrName, {
		value: attrValue,
		valueExprParts: attrValueExpressions
	});
}

function computedCommentConstructor (ast, compilationOptions) {
	if (!compilationOptions.allowXQuery) {
		throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
	}
	return new DirCommentConstructor(astHelper.getTextContent(astHelper.getFirstChild(astHelper.getFirstChild(astHelper.getFirstChild(ast, 'argExpr'), 'stringConstantExpr'), 'value')));
}

function computedPIConstructor (ast, compilationOptions) {
	if (!compilationOptions.allowXQuery) {
		throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
	}
	return new DirPIConstructor(
		astHelper.getTextContent(astHelper.getFirstChild(ast, 'piTarget')),
		astHelper.getTextContent(astHelper.getFirstChild(astHelper.getFirstChild(astHelper.getFirstChild(ast, 'piValueExpr'), 'stringConstantExpr'), 'value')));
	}

/**
 * @param   {!Array<?>}  xPathAst
 * @return  {!Expression}
 */
export default function (xPathAst, compilationOptions) {
	return compile(xPathAst, compilationOptions);
}

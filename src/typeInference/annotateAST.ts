import StaticContext from 'src/expressions/StaticContext';
import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { annotateArrayConstructor } from './annotateArrayConstructor';
import { annotateArrowExpr } from './annotateArrowExpr';
import { annotateBinOp } from './annotateBinaryOperator';
import { annotateCastableOperator, annotateCastOperator } from './annotateCastOperators';
import {
	annotateGeneralCompare,
	annotateNodeCompare,
	annotateValueCompare,
} from './annotateCompareOperator';
import { annotateContextItemExpr } from './annotateContextItemExpr';
import { annotateDynamicFunctionInvocationExpr } from './annotateDynamicFunctionInvocationExpr';
import { annotateFunctionCall } from './annotateFunctionCall';
import { annotateIfThenElseExpr } from './annotateIfThenElseExpr';
import { annotateInstanceOfExpr } from './annotateInstanceOfExpr';
import { annotateLogicalOperator } from './annotateLogicalOperator';
import { annotateMapConstructor } from './annotateMapConstructor';
import { annotateNamedFunctionRef } from './annotateNamedFunctionRef';
import { annotatePathExpr } from './annotatePathExpr';
import { annotateQuantifiedExpr } from './annotateQuantifiedExpr';
import { annotateRangeSequenceOperator } from './annotateRangeSequenceOperator';
import { annotateSequenceOperator } from './annotateSequenceOperator';
import { annotateSetOperator } from './annotateSetOperators';
import { annotateSimpleMapExpr } from './annotateSimpleMapExpr';
import { annotateStringConcatenateOperator } from './annotateStringConcatenateOperator';
import { annotateTypeSwitchOperator } from './annotateTypeSwitchOperator';
import { annotateUnaryLookup } from './annotateUnaryLookup';
import { annotateUnaryMinus, annotateUnaryPlus } from './annotateUnaryOperator';

export type AnnotationContext = {
	staticContext?: StaticContext;
	totalNodes: number;
	totalAnnotated: number[];
};

/**
 * Recursively traverse the AST in the depth first, pre-order to infer type and annotate AST;
 * Annotates as much type information as possible to the AST nodes.
 * Inserts attribute `type` to the corresponding node if type is inferred.
 *
 * @param ast The AST to annotate
 * @param context The static context used for function lookups
 */
export default function annotateAst(ast: IAST, context: AnnotationContext) {
	context.totalAnnotated.push(0);
	context.totalNodes = 0;

	annotate(ast, context);
}

/**
 * Recursively traverse the AST in the depth first, pre-order to infer type and annotate AST;
 * Annotates as much type information as possible to the AST nodes.
 * Inserts attribute `type` to the corresponding node if type is inferred.
 *
 * @param ast The AST to annotate.
 * @param context The static context to use for function lookups.
 * @throws errors when attempts to annotate fail.
 * @returns The type of the AST node or `undefined` when the type cannot be annotated.
 */
function annotate(ast: IAST, context: AnnotationContext): SequenceType | undefined {
	// Check if we actually have an AST
	if (!ast) {
		return undefined;
	}

	const astNodeName = ast[0];

	context.totalNodes++;

	// Switch on the current node name
	switch (astNodeName) {
		// Unary arithmetic operators
		case 'unaryMinusOp':
			const minVal = annotate(astHelper.getFirstChild(ast, 'operand')[1] as IAST, context);
			return annotateUnaryMinus(ast, minVal);
		case 'unaryPlusOp':
			const plusVal = annotate(astHelper.getFirstChild(ast, 'operand')[1] as IAST, context);
			return annotateUnaryPlus(ast, plusVal);

		// Binary arithmetic operators
		case 'addOp':
		case 'subtractOp':
		case 'divOp':
		case 'idivOp':
		case 'modOp':
		case 'multiplyOp': {
			const left = annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, context);
			const right = annotate(
				astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST,
				context
			);
			return annotateBinOp(ast, left, right, astNodeName);
		}

		// And + Or operators
		case 'andOp':
		case 'orOp':
			annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, context);
			annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, context);
			return annotateLogicalOperator(ast);

		// Sequences
		case 'sequenceExpr':
			const children = astHelper.getChildren(ast, '*');
			children.map((a) => annotate(a, context));
			return annotateSequenceOperator(ast, children.length);

		// Set operations (union, intersect, except)
		case 'unionOp':
		case 'intersectOp':
		case 'exceptOp':
			const l = annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, context);
			const r = annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, context);
			return annotateSetOperator(ast, l, r);

		// String concatentation
		case 'stringConcatenateOp':
			annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, context);
			annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, context);
			return annotateStringConcatenateOperator(ast);

		// Range operator
		case 'rangeSequenceExpr':
			annotate(astHelper.getFirstChild(ast, 'startExpr')[1] as IAST, context);
			annotate(astHelper.getFirstChild(ast, 'endExpr')[1] as IAST, context);
			return annotateRangeSequenceOperator(ast);

		// Comparison operators
		case 'equalOp':
		case 'notEqualOp':
		case 'lessThanOrEqualOp':
		case 'lessThanOp':
		case 'greaterThanOrEqualOp':
		case 'greaterThanOp': {
			annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, context);
			annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, context);
			return annotateGeneralCompare(ast);
		}
		case 'eqOp':
		case 'neOp':
		case 'ltOp':
		case 'leOp':
		case 'gtOp':
		case 'geOp': {
			annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, context);
			annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, context);
			return annotateValueCompare(ast);
		}
		case 'nodeBeforeOp':
		case 'nodeAfterOp': {
			annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, context);
			annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, context);
			return annotateNodeCompare(ast);
		}

		// Path Expression
		case 'pathExpr':
			const root = astHelper.getFirstChild(ast, 'rootExpr');
			if (root) annotate(root[1] as IAST, context);
			astHelper.getChildren(ast, 'stepExpr').map((b) => annotate(b, context));
			return annotatePathExpr(ast);

		// Context Item
		case 'contextItemExpr':
			return annotateContextItemExpr(ast);
		case 'ifThenElseExpr': {
			const ifClause = annotate(
				astHelper.getFirstChild(astHelper.getFirstChild(ast, 'ifClause'), '*'),
				context
			);
			const thenClause = annotate(
				astHelper.getFirstChild(astHelper.getFirstChild(ast, 'thenClause'), '*'),
				context
			);
			const elseClause = annotate(
				astHelper.getFirstChild(astHelper.getFirstChild(ast, 'elseClause'), '*'),
				context
			);
			return annotateIfThenElseExpr(ast, thenClause, elseClause);
		}
		case 'instanceOfExpr': {
			annotate(astHelper.getFirstChild(ast, 'argExpr'), context);
			annotate(astHelper.getFirstChild(ast, 'sequenceType'), context);
			return annotateInstanceOfExpr(ast);
		}

		// Constant expressions
		case 'integerConstantExpr':
			const integerSequenceType = {
				type: ValueType.XSINTEGER,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			};

			astHelper.insertAttribute(ast, 'type', integerSequenceType);
			return integerSequenceType;
		case 'doubleConstantExpr':
			const doubleSequenceType = {
				type: ValueType.XSDOUBLE,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			};

			astHelper.insertAttribute(ast, 'type', doubleSequenceType);
			return doubleSequenceType;
		case 'decimalConstantExpr':
			const decimalSequenceType = {
				type: ValueType.XSDECIMAL,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			};

			astHelper.insertAttribute(ast, 'type', decimalSequenceType);
			return decimalSequenceType;
		case 'stringConstantExpr':
			const stringSequenceType = {
				type: ValueType.XSSTRING,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			};

			astHelper.insertAttribute(ast, 'type', stringSequenceType);
			return stringSequenceType;

		// Functions
		case 'functionCallExpr':
			return annotateFunctionCall(ast, context);
		case 'arrowExpr':
			return annotateArrowExpr(ast, context);
		case 'dynamicFunctionInvocationExpr':
			const functionItem: SequenceType = annotate(
				astHelper.followPath(ast, ['functionItem', '*']),
				context
			);
			const args: SequenceType = annotate(astHelper.getFirstChild(ast, 'arguments'), context);
			return annotateDynamicFunctionInvocationExpr(ast, context, functionItem, args);
		case 'namedFunctionRef':
			return annotateNamedFunctionRef(ast, context);
		case 'inlineFunctionExpr':
			annotate(astHelper.getFirstChild(ast, 'functionBody')[1] as IAST, context);
			return { type: ValueType.FUNCTION, mult: SequenceMultiplicity.EXACTLY_ONE };

		// Casting
		case 'castExpr':
			return annotateCastOperator(ast);
		case 'castableExpr':
			return annotateCastableOperator(ast);

		// Maps
		case 'simpleMapExpr':
			astHelper.getChildren(ast, 'pathExpr').map((c) => annotate(c, context));
			return annotateSimpleMapExpr(ast);
		case 'mapConstructor':
			astHelper.getChildren(ast, 'mapConstructorEntry').map((keyValuePair) => ({
				key: annotate(astHelper.followPath(keyValuePair, ['mapKeyExpr', '*']), context),
				value: annotate(astHelper.followPath(keyValuePair, ['mapValueExpr', '*']), context),
			}));
			return annotateMapConstructor(ast);

		// Arrays
		case 'arrayConstructor':
			astHelper
				.getChildren(astHelper.getFirstChild(ast, '*'), 'arrayElem')
				.map((arrayElem) => annotate(arrayElem, context));
			return annotateArrayConstructor(ast);

		// Unary Lookup
		case 'unaryLookup':
			const ncName = astHelper.getFirstChild(ast, 'NCName');
			return annotateUnaryLookup(ast, ncName);

		// TypeSwitch
		case 'typeSwitchExpr':
			const arg = annotate(astHelper.getFirstChild(ast, 'argExpr') as IAST, context);
			const clauses = astHelper
				.getChildren(ast, 'typeswitchExprCaseClause')
				.map((a) => annotate(a, context));
			const defaultCase = annotate(
				astHelper.getFirstChild(ast, 'typeSwitchExprDefaultClause') as IAST,
				context
			);
			return annotateTypeSwitchOperator(ast);

		case 'quantifiedExpr':
			astHelper.getChildren(ast, '*').map((a) => annotate(a, context));
			return annotateQuantifiedExpr(ast);

		default:
			// Current node cannot be annotated, but maybe deeper ones can.
			for (let i = 1; i < ast.length; i++) {
				annotate(ast[i] as IAST, context);
			}
			return undefined;
	}
}

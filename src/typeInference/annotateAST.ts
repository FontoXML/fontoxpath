import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import StaticContext from '../expressions/StaticContext';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotatationContext';
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
import { annotateFlworExpression, annotateVarRef } from './annotateFlworExpression';
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

/**
 * Recursively traverse the AST in the depth first, pre-order to infer type and annotate AST;
 * Annotates as much type information as possible to the AST nodes.
 * Inserts attribute `type` to the corresponding node if type is inferred.
 *
 * @param ast The AST to annotate
 * @param annotationContext The static context used for function lookups
 */
export default function annotateAst(ast: IAST, staticContext?: StaticContext) {
	const annotationContext: AnnotationContext = new AnnotationContext(staticContext);
	annotate(ast, annotationContext);
}

/**
 * Recursively traverse the AST in the depth first, pre-order to infer type and annotate AST;
 * Annotates as much type information as possible to the AST nodes.
 * Inserts attribute `type` to the corresponding node if type is inferred.
 *
 * @param ast The AST to annotate.
 * @param annotationContext The static context to use for function lookups.
 * @throws errors when attempts to annotate fail.
 * @returns The type of the AST node or `undefined` when the type cannot be annotated.
 */
export function annotate(
	ast: IAST,
	annotationContext: AnnotationContext
): SequenceType | undefined {
	// Check if we actually have an AST
	if (!ast) {
		return undefined;
	}

	const astNodeName = ast[0];

	// Switch on the current node name
	switch (astNodeName) {
		// Unary arithmetic operators
		case 'unaryMinusOp':
			const minVal = annotate(
				astHelper.getFirstChild(ast, 'operand')[1] as IAST,
				annotationContext
			);
			return annotateUnaryMinus(ast, minVal);
		case 'unaryPlusOp':
			const plusVal = annotate(
				astHelper.getFirstChild(ast, 'operand')[1] as IAST,
				annotationContext
			);
			return annotateUnaryPlus(ast, plusVal);

		// Binary arithmetic operators
		case 'addOp':
		case 'subtractOp':
		case 'divOp':
		case 'idivOp':
		case 'modOp':
		case 'multiplyOp': {
			const left = annotate(
				astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST,
				annotationContext
			);
			const right = annotate(
				astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST,
				annotationContext
			);
			return annotateBinOp(ast, left, right, astNodeName);
		}

		// And + Or operators
		case 'andOp':
		case 'orOp':
			annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, annotationContext);
			annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, annotationContext);
			return annotateLogicalOperator(ast);

		// Sequences
		case 'sequenceExpr':
			const children = astHelper.getChildren(ast, '*');
			children.map((a) => annotate(a, annotationContext));
			return annotateSequenceOperator(ast, children.length);

		// Set operations (union, intersect, except)
		case 'unionOp':
		case 'intersectOp':
		case 'exceptOp':
			const l = annotate(
				astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST,
				annotationContext
			);
			const r = annotate(
				astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST,
				annotationContext
			);
			return annotateSetOperator(ast, l, r);

		// String concatentation
		case 'stringConcatenateOp':
			annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, annotationContext);
			annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, annotationContext);
			return annotateStringConcatenateOperator(ast);

		// Range operator
		case 'rangeSequenceExpr':
			annotate(astHelper.getFirstChild(ast, 'startExpr')[1] as IAST, annotationContext);
			annotate(astHelper.getFirstChild(ast, 'endExpr')[1] as IAST, annotationContext);
			return annotateRangeSequenceOperator(ast);

		// Comparison operators
		case 'equalOp':
		case 'notEqualOp':
		case 'lessThanOrEqualOp':
		case 'lessThanOp':
		case 'greaterThanOrEqualOp':
		case 'greaterThanOp': {
			annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, annotationContext);
			annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, annotationContext);
			return annotateGeneralCompare(ast);
		}
		case 'eqOp':
		case 'neOp':
		case 'ltOp':
		case 'leOp':
		case 'gtOp':
		case 'geOp': {
			annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, annotationContext);
			annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, annotationContext);
			return annotateValueCompare(ast);
		}
		case 'nodeBeforeOp':
		case 'nodeAfterOp': {
			annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, annotationContext);
			annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, annotationContext);
			return annotateNodeCompare(ast);
		}

		// Path Expression
		case 'pathExpr':
			const root = astHelper.getFirstChild(ast, 'rootExpr');
			if (root) annotate(root[1] as IAST, annotationContext);
			astHelper.getChildren(ast, 'stepExpr').map((b) => annotate(b, annotationContext));
			return annotatePathExpr(ast);

		// Context Item
		case 'contextItemExpr':
			return annotateContextItemExpr(ast);
		case 'ifThenElseExpr': {
			const ifClause = annotate(
				astHelper.getFirstChild(astHelper.getFirstChild(ast, 'ifClause'), '*'),
				annotationContext
			);
			const thenClause = annotate(
				astHelper.getFirstChild(astHelper.getFirstChild(ast, 'thenClause'), '*'),
				annotationContext
			);
			const elseClause = annotate(
				astHelper.getFirstChild(astHelper.getFirstChild(ast, 'elseClause'), '*'),
				annotationContext
			);
			return annotateIfThenElseExpr(ast, thenClause, elseClause);
		}
		case 'instanceOfExpr': {
			annotate(astHelper.getFirstChild(ast, 'argExpr'), annotationContext);
			annotate(astHelper.getFirstChild(ast, 'sequenceType'), annotationContext);
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
			return annotateFunctionCall(ast, annotationContext);
		case 'arrowExpr':
			return annotateArrowExpr(ast, annotationContext);
		case 'dynamicFunctionInvocationExpr':
			const functionItem: SequenceType = annotate(
				astHelper.followPath(ast, ['functionItem', '*']),
				annotationContext
			);
			const args: SequenceType = annotate(
				astHelper.getFirstChild(ast, 'arguments'),
				annotationContext
			);
			return annotateDynamicFunctionInvocationExpr(
				ast,
				annotationContext,
				functionItem,
				args
			);
		case 'namedFunctionRef':
			return annotateNamedFunctionRef(ast, annotationContext);
		case 'inlineFunctionExpr':
			annotate(astHelper.getFirstChild(ast, 'functionBody')[1] as IAST, annotationContext);
			const functionSeqType: SequenceType = {
				type: ValueType.FUNCTION,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			};
			astHelper.insertAttribute(ast, 'type', functionSeqType);
			return functionSeqType;

		// Casting
		case 'castExpr':
			return annotateCastOperator(ast);
		case 'castableExpr':
			return annotateCastableOperator(ast);
		// Current node cannot be annotated, but maybe deeper ones can.
		case 'flworExpr':
			return annotateFlworExpression(ast, annotationContext, annotate);
		case 'varRef':
			return annotateVarRef(ast[1] as IAST, annotationContext);
		case 'returnClause':
			const pathFollowed: IAST = astHelper.followPath(ast, ['*']);
			const returnType = annotate(pathFollowed, annotationContext);
			astHelper.insertAttribute(pathFollowed, 'type', returnType);
			astHelper.insertAttribute(ast as IAST, 'type', returnType);
			return returnType;

		// Maps
		case 'simpleMapExpr':
			astHelper.getChildren(ast, 'pathExpr').map((c) => annotate(c, annotationContext));
			return annotateSimpleMapExpr(ast);
		case 'mapConstructor':
			astHelper.getChildren(ast, 'mapConstructorEntry').map((keyValuePair) => ({
				key: annotate(
					astHelper.followPath(keyValuePair, ['mapKeyExpr', '*']),
					annotationContext
				),
				value: annotate(
					astHelper.followPath(keyValuePair, ['mapValueExpr', '*']),
					annotationContext
				),
			}));
			return annotateMapConstructor(ast);

		// Arrays
		case 'arrayConstructor':
			astHelper
				.getChildren(astHelper.getFirstChild(ast, '*'), 'arrayElem')
				.map((arrayElem) => annotate(arrayElem, annotationContext));
			return annotateArrayConstructor(ast);

		// Unary Lookup
		case 'unaryLookup':
			const ncName = astHelper.getFirstChild(ast, 'NCName');
			return annotateUnaryLookup(ast, ncName);

		// TypeSwitch
		case 'typeSwitchExpr':
			const arg = annotate(
				astHelper.getFirstChild(ast, 'argExpr') as IAST,
				annotationContext
			);
			const clauses = astHelper
				.getChildren(ast, 'typeswitchExprCaseClause')
				.map((a) => annotate(a, annotationContext));
			const defaultCase = annotate(
				astHelper.getFirstChild(ast, 'typeSwitchExprDefaultClause') as IAST,
				annotationContext
			);
			return annotateTypeSwitchOperator(ast);

		case 'quantifiedExpr':
			astHelper.getChildren(ast, '*').map((a) => annotate(a, annotationContext));
			return annotateQuantifiedExpr(ast);

		default:
			// Current node cannot be annotated, but maybe deeper ones can.
			for (let i = 1; i < ast.length; i++) {
				annotate(ast[i] as IAST, annotationContext);
			}
			return undefined;
	}
}

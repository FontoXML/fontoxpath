import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import StaticContext from '../expressions/StaticContext';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotatationContext';
import { annotateBinOp } from './annotateBinaryOperator';
import { annotateCastableOperator, annotateCastOperator } from './annotateCastOperators';
import {
	annotateGeneralCompare,
	annotateNodeCompare,
	annotateValueCompare,
} from './annotateCompareOperator';
import { annotateFlworExpression } from './annotateFlworExpression';
import { annotateFunctionCall } from './annotateFunctionCall';
import { annotateLogicalOperator } from './annotateLogicalOperator';
import { annotateUnaryMinus, annotateUnaryPlus } from './annotateUnaryOperator';

/**
 * Recursively traverse the AST in the depth first, pre-order to infer type and annotate AST;
 * Annotates as much type information as possible to the AST nodes.
 * Inserts attribute `type` to the corresponding node if type is inferred.
 *
 * @param ast The AST to annotate
 * @param staticContext The static context used for function lookups
 */
export function annotateAST(ast: IAST, staticContext: StaticContext): SequenceType | undefined {
	const annotationContext: AnnotationContext = new AnnotationContext(staticContext);
	const type = annotate(ast, annotationContext);
	return type;
}

/**
 * Recursively traverse the AST in the depth first, pre-order to infer type and annotate AST;
 * Annotates as much type information as possible to the AST nodes.
 * Inserts attribute `type` to the corresponding node if type is inferred.
 *
 * @param ast The AST to annotate.
 * @param staticContext The static context to use for function lookups.
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
		case 'functionCallExpr':
			return annotateFunctionCall(ast, annotationContext);
		case 'castExpr':
			return annotateCastOperator(ast);
		case 'castableExpr':
			return annotateCastableOperator(ast);
		// Current node cannot be annotated, but maybe deeper ones can.
		case 'flworExpr':
			return annotateFlworExpression(ast, annotationContext);
		default:
			// Current node cannot be annotated, but maybe deeper ones can.
			for (let i = 1; i < ast.length; i++) {
				annotate(ast[i] as IAST, annotationContext);
			}
			return undefined;
	}
}

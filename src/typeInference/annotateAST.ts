import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import StaticContext from '../expressions/StaticContext';
import astHelper, { IAST } from '../parsing/astHelper';
import { annotateBinOp } from './annotateBinaryOperator';
import { annotateCastableOperator, annotateCastOperator } from './annotateCastOperators';
import {
	annotateGeneralCompare,
	annotateNodeCompare,
	annotateValueCompare,
} from './annotateCompareOperator';
import { annotateFunctionCall } from './annotateFunctionCall';
import { annotateLogicalOperator } from './annotateLogicalOperator';
import { annotateUnaryMinus, annotateUnaryPlus } from './annotateUnaryOperator';

/**
 * Annotate an AST with additional type information. It tried to infer as much of the types as possible.
 * @param ast The AST to annotate
 * @param staticContext The static context used for function lookups
 */
export default function annotateAst(ast: IAST, staticContext?: StaticContext) {
	annotate(ast, staticContext);
}

/**
 * This is the recursive function used to annotate any AST node.
 * @param ast The AST to annotate
 * @param staticContext The static constext to use for function lookups
 * @returns The type of the AST node
 */
export function annotate(ast: IAST, staticContext: StaticContext): SequenceType | undefined {
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
				staticContext
			);
			return annotateUnaryMinus(ast, minVal);
		case 'unaryPlusOp':
			const plusVal = annotate(
				astHelper.getFirstChild(ast, 'operand')[1] as IAST,
				staticContext
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
				staticContext
			);
			const right = annotate(
				astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST,
				staticContext
			);
			return annotateBinOp(ast, left, right, astNodeName);
		}

		// And + Or operators
		case 'andOp':
		case 'orOp':
			annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, staticContext);
			annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, staticContext);
			return annotateLogicalOperator(ast);

		// Comparison operators
		case 'equalOp':
		case 'notEqualOp':
		case 'lessThanOrEqualOp':
		case 'lessThanOp':
		case 'greaterThanOrEqualOp':
		case 'greaterThanOp': {
			annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, staticContext);
			annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, staticContext);
			return annotateGeneralCompare(ast);
		}
		case 'eqOp':
		case 'neOp':
		case 'ltOp':
		case 'leOp':
		case 'gtOp':
		case 'geOp': {
			annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, staticContext);
			annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, staticContext);
			return annotateValueCompare(ast);
		}
		case 'nodeBeforeOp':
		case 'nodeAfterOp': {
			annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, staticContext);
			annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, staticContext);
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
			return annotateFunctionCall(ast, staticContext);
		case 'castExpr':
			return annotateCastOperator(ast);
		case 'castableExpr':
			return annotateCastableOperator(ast);
		default:
			// Current node cannot be annotated, but maybe deeper ones can.
			for (let i = 1; i < ast.length; i++) {
				annotate(ast[i] as IAST, staticContext);
			}
			return undefined;
	}
}

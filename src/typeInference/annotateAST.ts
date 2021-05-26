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
import { annotateInstanceOfExpr } from './annotateInstanceOfExpr';
import { annotateLogicalOperator } from './annotateLogicalOperator';
import { annotatePathExpr } from './annotatePathExpr';
import { annotateRangeSequenceOperator } from './annotateRangeSequenceOperator';
import { annotateSequenceOperator } from './annotateSequenceOperator';
import { annotateSetOperator } from './annotateSetOperators';
import { annotateStringConcatenateOperator } from './annotateStringConcatenateOperator';
import { annotateTypeSwitchOperator } from './annotateTypeSwitchOperator';
import { annotateUnaryMinus, annotateUnaryPlus } from './annotateUnaryOperator';

/**
 * Recursively traverse the AST in the depth first, pre-order to infer type and annotate AST;
 * Annotates as much type information as possible to the AST nodes.
 * Inserts attribute `type` to the corresponding node if type is inferred.
 *
 * @param ast The AST to annotate
 * @param staticContext The static context used for function lookups
 */
export default function annotateAst(ast: IAST, staticContext?: StaticContext) {
	annotate(ast, staticContext);
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

		// Sequences
		case 'sequenceExpr':
			const children = astHelper.getChildren(ast, '*');
			children.map((a) => annotate(a, staticContext));
			return annotateSequenceOperator(ast, children.length);

		// Set operations (union, intersect, except)
		case 'unionOp':
		case 'intersectOp':
		case 'exceptOp':
			const l = annotate(
				astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST,
				staticContext
			);
			const r = annotate(
				astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST,
				staticContext
			);
			return annotateSetOperator(ast, l, r);

		// String concatentation
		case 'stringConcatenateOp':
			annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, staticContext);
			annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, staticContext);
			return annotateStringConcatenateOperator(ast);

		// Range operator
		case 'rangeSequenceExpr':
			annotate(astHelper.getFirstChild(ast, 'startExpr')[1] as IAST, staticContext);
			annotate(astHelper.getFirstChild(ast, 'endExpr')[1] as IAST, staticContext);
			return annotateRangeSequenceOperator(ast);

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

		// Path Expression
		case 'pathExpr':
			const root = astHelper.getFirstChild(ast, 'rootExpr');
			if (root) annotate(root[1] as IAST, staticContext);
			astHelper.getChildren(ast, 'stepExpr').map((b) => annotate(b, staticContext));
			return annotatePathExpr(ast);

		case 'instanceOfExpr': {
			annotate(astHelper.getFirstChild(ast, 'argExpr'), staticContext);
			annotate(astHelper.getFirstChild(ast, 'sequenceType'), staticContext);
			annotateInstanceOfExpr(ast);
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
			return annotateFunctionCall(ast, staticContext);
     
    // Casting
		case 'castExpr':
			return annotateCastOperator(ast);
		case 'castableExpr':
			return annotateCastableOperator(ast);
    
    // TypeSwitch
		case 'typeSwitchExpr':
			const arg = annotate(astHelper.getFirstChild(ast, 'argExpr') as IAST, staticContext);
			const clauses = astHelper
				.getChildren(ast, 'typeswitchExprCaseClause')
				.map((a) => annotate(a, staticContext));
			const defaultCase = annotate(
				astHelper.getFirstChild(ast, 'typeSwitchExprDefaultClause') as IAST,
				staticContext
			);
			annotateTypeSwitchOperator(ast);
      
		default:
			// Current node cannot be annotated, but maybe deeper ones can.
			for (let i = 1; i < ast.length; i++) {
				annotate(ast[i] as IAST, staticContext);
			}
			return undefined;
	}
}

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
import { annotateUnaryMinus, annotateUnaryPlus } from './annotateUnaryOperator';

export default function annotateAst(
	ast: IAST,
	staticContext?: StaticContext
): SequenceType | undefined {
	const annotationContext: AnnotationContext = new AnnotationContext(staticContext);
	const type = annotate(ast, annotationContext);
	return type;
}

export function annotate(
	ast: IAST,
	annotationContext: AnnotationContext
): SequenceType | undefined {
	if (!ast) {
		return undefined;
	}

	const astNodeName = ast[0];

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
			for (let i = 1; i < ast.length; i++) {
				annotate(ast[i] as IAST, annotationContext);
			}
			return undefined;
	}
}

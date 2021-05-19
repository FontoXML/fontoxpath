import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import { IAST } from '../parsing/astHelper';
import { annotateBinOp } from './annotateBinaryOperator';
import { annotateUnaryMinus, annotateUnaryPlus } from './annotateUnaryOperator';
import {
	annotateNodeCompare,
	annotateValueCompare,
	annotateGeneralCompare,
} from './annotateCompareOperator';
import { insertAttribute } from './insertAttribute';

export default function annotateAst(ast: IAST): SequenceType | undefined {
	const type = annotate(ast);
	return type;
}

export function annotate(ast: IAST): SequenceType | undefined {
	if (!ast) {
		return undefined;
	}

	switch (ast[0]) {
		//Unary arithmetic operators
		case 'unaryMinusOp':
			const minVal = annotate(ast[1][1] as IAST);
			return annotateUnaryMinus(ast, minVal);
		case 'unaryPlusOp':
			const plusVal = annotate(ast[1][1] as IAST);
			return annotateUnaryPlus(ast, plusVal);
		//Binary arithmetic operators
		case 'addOp':
		case 'divOp':
		case 'idivOp':
		case 'modOp':
		case 'multiplyOp': {
			const left = annotate(ast[1][1] as IAST);
			const right = annotate(ast[2][1] as IAST);
			return annotateBinOp(ast, left, right, ast[0]);
		}
		//Comparison operators
		case 'equalOp':
		case 'notEqualOp':
		case 'lessThanOrEqualOp':
		case 'lessThanOp':
		case 'greaterThanOrEqualOp':
		case 'greaterThanOp': {
			const left = annotate(ast[1][1] as IAST);
			const right = annotate(ast[2][1] as IAST);
			return annotateGeneralCompare(ast, left, right);
		}
		case 'eqOp':
		case 'neOp':
		case 'ltOp':
		case 'leOp':
		case 'gtOp':
		case 'geOp': {
			const left = annotate(ast[1][1] as IAST);
			const right = annotate(ast[2][1] as IAST);
			return annotateValueCompare(ast, left, right);
		}
		case 'nodeBeforeOp':
		case 'nodeAfterOp': {
			const left = annotate(ast[1][1] as IAST);
			const right = annotate(ast[2][1] as IAST);
			return annotateNodeCompare(ast, left, right);
		}
		//Constant expressions
		case 'integerConstantExpr':
			const integerSequenceType = {
				type: ValueType.XSINTEGER,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			};

			insertAttribute(ast, 'type', integerSequenceType);
			return integerSequenceType;
		case 'doubleConstantExpr':
			const doubleSequenceType = {
				type: ValueType.XSDOUBLE,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			};

			insertAttribute(ast, 'type', doubleSequenceType);
			return doubleSequenceType;
		case 'decimalConstantExpr':
			const decimalSequenceType = {
				type: ValueType.XSDECIMAL,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			};

			insertAttribute(ast, 'type', decimalSequenceType);
			return decimalSequenceType;
		case 'stringConstantExpr':
			const stringSequenceType = {
				type: ValueType.XSSTRING,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			};

			insertAttribute(ast, 'type', stringSequenceType);
			return stringSequenceType;
		// Current node cannot be annotated, but maybe deeper ones can.
		default:
			for (let i = 1; i < ast.length; i++) {
				annotate(ast[i] as IAST);
			}
			return undefined;
	}
}

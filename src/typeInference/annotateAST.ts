import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { annotateBinOp } from './annotateBinaryOperator';
import { annotateUnaryMinus, annotateUnaryPlus } from './annotateUnaryOperator';
import { insertAttribute } from './insertAttribute';

export default function annotateAst(ast: IAST): SequenceType | undefined {
	const type = annotate(ast);
	return type;
}

export function annotate(ast: IAST): SequenceType | undefined {
	if (!ast) {
		return undefined;
	}

	const astNodeName = ast[0];

	switch (astNodeName) {
		case 'unaryMinusOp':
			const minVal = annotate(astHelper.getFirstChild(ast, 'operand')[1] as IAST);
			return annotateUnaryMinus(ast, minVal);
		case 'unaryPlusOp':
			const plusVal = annotate(astHelper.getFirstChild(ast, 'operand')[1] as IAST);
			return annotateUnaryPlus(ast, plusVal);
		case 'addOp':
		case 'subtractOp':
		case 'divOp':
		case 'idivOp':
		case 'modOp':
		case 'multiplyOp':
			const left = annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST);
			const right = annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST);
			return annotateBinOp(ast, left, right, astNodeName);
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
		default:
			for (let i = 1; i < ast.length; i++) {
				annotate(ast[i] as IAST);
			}
			return undefined;
	}
}

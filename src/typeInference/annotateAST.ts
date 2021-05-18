import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import { IAST } from '../parsing/astHelper';
import { annotateAddOp } from './annotateBinaryOperator';
import { annotateUnaryMinus, annotateUnaryPlus } from './annotateUnaryOperator';
import { insertAttribute } from './insertAttribute';

export default function annotateAst(ast: IAST): SequenceType | undefined {
	const type = annotate(ast);
	return type;
}

function annotateUnaryMinusOp(ast: IAST): SequenceType | undefined {
	const child = annotate(ast[1][1]);

	if (!child) return undefined;

	insertAttribute(ast, 'type', child);
	return child;
}

export function annotate(ast: IAST): SequenceType | undefined {
	if (!ast) {
		return undefined;
	}

	switch (ast[0]) {
		case 'unaryMinusOp':
			const minVal = annotate(ast[1][1] as IAST);
			return annotateUnaryMinus(ast, minVal);
		case 'unaryPlusOp':
			const plusVal = annotate(ast[1][1] as IAST);
			return annotateUnaryPlus(ast, plusVal);
		case 'addOp':
			const left = annotate(ast[1][1] as IAST);
			const right = annotate(ast[2][1] as IAST);

			return annotateAddOp(ast, left, right);
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

import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import { IAST } from '../parsing/astHelper';
import { annotateAddOp } from './annotateBinaryOperator';

export default function annotateAst(ast: IAST): SequenceType | undefined {
	const type = annotate(ast);
	return type;
}

function annotateUnaryMinusOp(ast: IAST): SequenceType | undefined {
	const child = annotate(ast[1][1]);

	if (!child) return undefined;

	ast.push(['type', child]);
	return child;
}

export function annotate(ast: IAST): SequenceType | undefined {
	if (!ast) {
		return undefined;
	}

	switch (ast[0]) {
		case 'unaryMinusOp':
			return annotateUnaryMinusOp(ast);
		case 'addOp':
			const left = annotate(ast[1][1] as IAST);
			const right = annotate(ast[2][1] as IAST);

			return annotateAddOp(ast, left, right);
		case 'integerConstantExpr':
			ast.push([
				'type',
				{ type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE },
			]);
			return { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE };
		case 'doubleConstantExpr':
			ast.push([
				'type',
				{ type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.EXACTLY_ONE },
			]);
			return { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.EXACTLY_ONE };
		case 'decimalConstantExpr':
			ast.push([
				'type',
				{
					type: ValueType.XSDECIMAL,
					mult: SequenceMultiplicity.EXACTLY_ONE,
				},
			]);
			return { type: ValueType.XSDECIMAL, mult: SequenceMultiplicity.EXACTLY_ONE };
		case 'stringConstantExpr':
			ast.push([
				'type',
				{
					type: ValueType.XSSTRING,
					mult: SequenceMultiplicity.EXACTLY_ONE,
				},
			]);
			return { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE };
		default:
			for (let i = 1; i < ast.length; i++) {
				annotate(ast[i] as IAST);
			}
			return { type: ValueType.XSERROR, mult: SequenceMultiplicity.EXACTLY_ONE };
	}
}

function insertAttribute(ast: IAST, sequenceType: SequenceType): IAST {
	// WIP
	if (typeof ast[1] === 'object' && !Array.isArray(ast[1])) {
		ast[1]['type'] = sequenceType;
	} else {
		ast.splice(1, 0, { type: sequenceType });
	}

	return ast;
}

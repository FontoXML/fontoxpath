import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import { IAST } from '../parsing/astHelper';
import { annotateAddOp } from './annotateBinaryOperator';

export default function annotateAst(ast: IAST): SequenceType | undefined {
	const type = annotateUpperLevel(ast);
	return type;
}

function annotateUpperLevel(ast: IAST): SequenceType | undefined {
	if (!ast) return undefined;

	switch (ast[0]) {
		case 'module':
			return annotateUpperLevel(ast[1] as IAST);
		case 'libraryModule':
			return annotateUpperLevel(ast[2] as IAST);
		case 'mainModule':
			return annotateUpperLevel(ast[1] as IAST);
		case 'queryModule':
			return annotateUpperLevel(ast[1] as IAST);
		case 'queryBody':
			return annotate(ast[1] as IAST);
		case 'prolog':
			return annotateUpperLevel(ast[1] as IAST);
		case 'functionDecl':
			return annotateUpperLevel(ast[3] as IAST);
	}
}

function annotateUnaryMinusOp(ast: IAST): SequenceType | undefined {
	const child = annotate(ast[1][1]);

	if (!child) return undefined;

	ast.push(['type', child]);
	return child;
}

export function annotate(ast: IAST): SequenceType | undefined {
	switch (ast[0]) {
		case 'unaryMinusOp':
			return annotateUnaryMinusOp(ast);
		case 'addOp':
			return annotateAddOp(ast);
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
			return { type: ValueType.XSERROR, mult: SequenceMultiplicity.EXACTLY_ONE };
	}
}

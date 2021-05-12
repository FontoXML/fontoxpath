import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import { IAST } from './astHelper';

export default function annotateAst(ast: IAST): SequenceType {
	const type = annotateUpperLevel(ast);
	return type;
}

function annotateUpperLevel(ast: IAST): SequenceType {
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

function annotateAddOp(ast: IAST): SequenceType {
	const left = annotate(ast[1][1] as IAST);
	const right = annotate(ast[2][1] as IAST);

	// TODO: fix
	// if (left !== right) {
	// 	throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
	// }

	ast.push(['type', left]);
	return left;
}

function annotateUnaryMinusOp(ast: IAST): SequenceType {
	const child = annotate(ast[1][1]);

	ast.push(['type', child]);
	return child;
}

function annotate(ast: IAST): SequenceType {
	switch (ast[0]) {
		case 'unaryMinusOp':
			return annotateUnaryMinusOp(ast);
		case 'addOp':
			return annotateAddOp(ast);
		case 'integerConstantExpr':
			ast.push(['type', ValueType.XSINTEGER]);
			return { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE };
		case 'doubleConstantExpr':
			ast.push(['type', ValueType.XSDOUBLE]);
			return { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.EXACTLY_ONE };
		case 'decimalConstantExpr':
			ast.push(['type'], ValueType.XSDECIMAL);
			return { type: ValueType.XSDECIMAL, mult: SequenceMultiplicity.EXACTLY_ONE };
		case 'stringConstantExpr':
			ast.push(['type'], ValueType.XSSTRING);
			return { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE };
		default:
			return { type: ValueType.XSERROR, mult: SequenceMultiplicity.EXACTLY_ONE };
	}
}

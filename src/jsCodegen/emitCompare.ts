import { SequenceMultiplicity, SequenceType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import { acceptAst, PartialCompilationResult, rejectAst } from './JavaScriptCompiledXPath';

export function emitValueCompare(
	ast: IAST,
	firstExpr: PartialCompilationResult,
	secondExpr: PartialCompilationResult,
	identifier: string,
	staticContext: CodeGenContext
): PartialCompilationResult {
	return acceptAst('');
}

export function emitGeneralCompare(
	ast: IAST,
	firstExpr: PartialCompilationResult,
	secondExpr: PartialCompilationResult,
	identifier: string,
	staticContext: CodeGenContext
): PartialCompilationResult {
	const firstAstOp = astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST;
	const firstType: SequenceType = astHelper.getAttribute(ast, 'type');
	const secondAstOp = astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST;
	const secondType: SequenceType = astHelper.getAttribute(ast, 'type');
	if (!firstType || !secondType) {
		return rejectAst('types of compare are not known');
	}
	if (
		firstType.mult === SequenceMultiplicity.EXACTLY_ONE &&
		secondType.mult === SequenceMultiplicity.EXACTLY_ONE
	) {
		return emitValueCompare(ast, firstExpr, secondExpr, identifier, staticContext);
	} else {
		// take all the children except for the type.
		const leftChildren: IAST[] = astHelper.getChildren(firstAstOp, '*');
		const rightChildren: IAST[] = astHelper.getChildren(secondAstOp, '*');
		leftChildren.shift();
		rightChildren.shift();
		//TODO: implement the generalCompare when the valuecompare is done.
		return rejectAst('');
	}
}

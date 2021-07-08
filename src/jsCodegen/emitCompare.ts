import { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import { acceptAst, PartialCompilationResult } from './JavaScriptCompiledXPath';

export function emitValueCompare(
	ast: IAST,
	firstExpr: PartialCompilationResult,
	secondExpr: PartialCompilationResult,
	identifier: string,
	staticContext: CodeGenContext
): PartialCompilationResult {
	return acceptAst('');
}

import { IAST } from '../parsing/astHelper';
import { NamespaceResolver } from '../types/Options';
import { FunctionIdentifier, PartialCompilationResult } from './JavaScriptCompiledXPath';

export type CodeGenContext = {
	emitBaseExpr?: (
		ast: IAST,
		identifier: FunctionIdentifier,
		staticContext: CodeGenContext
	) => PartialCompilationResult;
	resolveNamespace: NamespaceResolver;
};

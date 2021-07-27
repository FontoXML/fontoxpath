import ExecutionParameters from '../expressions/ExecutionParameters';
import StaticContext from '../expressions/StaticContext';
import { IAST } from '../parsing/astHelper';
import { NamespaceResolver } from '../types/Options';
import { FunctionIdentifier, PartialCompilationResult } from './JavaScriptCompiledXPath';

export type CodeGenContext = {
	emitBaseExpr?: (
		ast: IAST,
		identifier: FunctionIdentifier,
		staticContext: CodeGenContext
	) => PartialCompilationResult;
	staticContext?: StaticContext;
	resolveNamespace: NamespaceResolver;
	functions: [any];
	executionParameters: ExecutionParameters;
};

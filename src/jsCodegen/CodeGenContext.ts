import ExecutionParameters from 'src/expressions/ExecutionParameters';
import { FunctionSignature } from '../expressions/dataTypes/FunctionValue';
import ISequence from '../expressions/dataTypes/ISequence';
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

import Expression from './Expression';
import { FunctionProperties } from './functions/functionRegistry';
import ISequence from './dataTypes/ISequence';
import ExecutionParameters from './ExecutionParameters';
import DynamicContext from './DynamicContext';

export default interface IContext {
	registeredDefaultFunctionNamespace: string;
	registeredVariableBindingByHashKey: any[];
	registeredVariableExpressionByHashKey: {
		[hash: string]: Expression;
	};
	registeredVariableDeclarationByHashKey: {
		[hash: string]: (
			dynamicContext: DynamicContext,
			executionParameters: ExecutionParameters
		) => ISequence;
	};
	lookupFunction(
		namespaceURI: string,
		localName: string,
		arity: number
	): FunctionProperties | null;
	lookupVariable(namespaceURI: string | null, localName: string): string | null;
	resolveNamespace(prefix: string): string | null;
}

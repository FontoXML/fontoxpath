import { CodeGenContext } from './CodeGenContext';

export type ContextItemIdentifier = string;

export type FunctionIdentifier = string;

export enum CompiledResultType {
	Value,
	Function,
	None,
}

export type PartiallyCompiledAstAccepted = {
	code: string;
	isAstAccepted: true;
	resultType: CompiledResultType;
	// Contains variable (and function) declarations for the upper compiled
	// scope.
	variables?: string[];
	staticContext?: CodeGenContext;
};

export function getCompiledValueCode(
	identifier: string,
	type: CompiledResultType,
	contextItemName?: string
): string {
	switch (type) {
		case CompiledResultType.Value:
			return identifier;
		case CompiledResultType.Function:
			return `${identifier}(${contextItemName ? contextItemName : `contextItem`})`;
		case CompiledResultType.None:
			throw new Error('Unreachable');
	}
}

export function acceptAst(
	code: string,
	resultType: CompiledResultType,
	variables?: string[],
	staticContext?: CodeGenContext
): PartiallyCompiledAstAccepted {
	return {
		code,
		resultType,
		isAstAccepted: true,
		variables,
		staticContext,
	};
}

/**
 * Result for failing to compile XPath to JavaScript.
 * @beta
 */
export declare interface IAstRejected {
	isAstAccepted: false;
	reason: string;
}

export function rejectAst(reason: string): IAstRejected {
	return { isAstAccepted: false, reason };
}

export type PartialCompilationResult = PartiallyCompiledAstAccepted | IAstRejected;

/**
 * Successfully JavaScript compiled XPath.
 * @beta
 */
export declare interface IAstAccepted {
	code: string;
	isAstAccepted: true;
	staticContext?: CodeGenContext;
}

export function acceptFullyCompiledAst(code: string, staticContext: CodeGenContext): IAstAccepted {
	return { code, isAstAccepted: true, staticContext };
}

/**
 * Result for compiling XPath to JavaScript
 * @beta
 */
export type JavaScriptCompiledXPathResult = IAstAccepted | IAstRejected;

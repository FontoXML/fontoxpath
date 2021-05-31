export type ContextItemIdentifier = string;

export type FunctionIdentifier = string;

export type PartiallyCompiledAstAccepted = {
	code: string;
	isAstAccepted: true;
	// Contains variable (and function) declarations for the upper compiled
	// scope.
	variables?: string[];
};

export function acceptAst(code: string, variables?: string[]): PartiallyCompiledAstAccepted {
	return {
		code,
		variables,
		isAstAccepted: true,
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
}

export function acceptFullyCompiledAst(code: string): IAstAccepted {
	return { code, isAstAccepted: true };
}

/**
 * Result for compiling XPath to JavaScript
 * @beta
 */
export type JavaScriptCompiledXPathResult = IAstAccepted | IAstRejected;

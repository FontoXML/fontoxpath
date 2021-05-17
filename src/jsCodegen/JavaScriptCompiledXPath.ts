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
export type AstRejected = { isAstAccepted: false; reason: string };

export function rejectAst(reason: string): AstRejected {
	return { isAstAccepted: false, reason };
}

export type PartialCompilationResult = PartiallyCompiledAstAccepted | AstRejected;

/**
 * Successfully JavaScript compiled XPath.
 * @beta
 */
export type AstAccepted = { code: string; isAstAccepted: true };

export function acceptFullyCompiledAst(code: string): AstAccepted {
	return { code, isAstAccepted: true };
}

/**
 * Result for compiling XPath to JavaScript
 * @beta
 */
export type JavaScriptCompiledXPathResult = AstAccepted | AstRejected;

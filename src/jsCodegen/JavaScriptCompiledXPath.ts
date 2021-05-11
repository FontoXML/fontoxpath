export type PariallyCompiledAstAccepted = {
	code: string;
	isAstAccepted: true;
	// Contains variable (and function) declarations for the upper compiled
	// scope.
	variables?: string[];
};

/**
 * Result for failing to compile XPath to JavaScript.
 * @beta
 */
export type AstRejected = { isAstAccepted: false; reason: string };

export type PartialCompilationResult = PariallyCompiledAstAccepted | AstRejected;

export function acceptAst(code: string, variables?: string[]): PariallyCompiledAstAccepted {
	return {
		code,
		variables,
		isAstAccepted: true,
	};
}

export function rejectAst(reason: string): AstRejected {
	return { isAstAccepted: false, reason };
}

/**
 * Successfully JavaScript compiled XPath.
 * @beta
 */
export type AstAccepted = { code: string; isAstAccepted: true };

/**
 * Result for compiling XPath to JavaScript
 * @beta
 */
export type JavaScriptCompiledXPathResult = AstAccepted | AstRejected;

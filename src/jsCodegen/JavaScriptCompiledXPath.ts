export type ContextItemIdentifier = string;

export type FunctionIdentifier = string;

export type PartiallyCompiledAstAccepted = {
	code: string;
	isAstAccepted: true;
	// Contains variable (and function) declarations for the upper compiled
	// scope.
	isFunction: boolean;
	variables?: string[];
};

export function getCompiledValueCode(
	identifier: string,
	isFunction: boolean,
	contextItemName?: string
): string {
	return isFunction ? `${identifier}(${contextItemName ?? `contextItem`})` : identifier;
}

export function acceptAst(
	code: string,
	isFunction: boolean,
	variables?: string[]
): PartiallyCompiledAstAccepted {
	return {
		code,
		isFunction,
		isAstAccepted: true,
		variables,
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

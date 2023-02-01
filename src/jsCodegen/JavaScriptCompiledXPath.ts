export type ContextItemIdentifier = string;

export type FunctionIdentifier = string;

export enum CompiledResultType {
	Value,
	Function,
	None,
}

export type PartiallyCompiledAstAccepted = {
	// Expression that was generated
	code: string;
	// What kind of code was generated.
	generatedCodeType: GeneratedCodeType;
	isAstAccepted: true;
	// Contains variable (and function) declarations for the upper compiled
	// scope.
	variables: string[];
};

export enum GeneratedCodeBaseType {
	// A normal value: 5, "test", true, ...
	Value,
	// A generator function representing a lazy sequence
	Generator,
	// Statements, used to build the generator body - doesn't have a value
	Statement,
}

export type GeneratedCodeType =
	| { type: GeneratedCodeBaseType.Value }
	| { type: GeneratedCodeBaseType.Generator }
	| { type: GeneratedCodeBaseType.Statement };

export function acceptAst(
	code: string,
	generatedCodeType: GeneratedCodeType,
	variables: string[]
): PartiallyCompiledAstAccepted {
	return {
		code,
		generatedCodeType,
		variables,
		isAstAccepted: true,
	};
}

/**
 * Result for failing to compile XPath to JavaScript.
 *
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
 *
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
 *
 * @beta
 */
export type JavaScriptCompiledXPathResult = IAstAccepted | IAstRejected;

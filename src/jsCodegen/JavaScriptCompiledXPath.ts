export type ContextItemIdentifier = string;

export type FunctionIdentifier = string;

export enum CompiledResultType {
	Value,
	Function,
	None,
}

export type PartiallyCompiledAstAccepted = {
	code: string;
	// What kind of code was generated.
	generatedCodeType: GeneratedCodeType;
	isAstAccepted: true;
	// Contains variable (and function) declarations for the upper compiled
	// scope.
	variables?: string[];
};

export enum GeneratedCodeBaseType {
	// A normal value: 5, "test", true, ...
	Value,
	// Defining a variable: const test = "test";
	Variable,
	// A statement: if (this) { do that; }
	Statement,
	// A function has been generated: function foo() { return true; }
	Function,
	// An iterator is returned.
	Iterator,
	// A sequence of values has been returned. This isn't used at the
	// moment but will come in handy when we get to add sequence support.
	Sequence,
	// Used in a single case where no code is generated.
	None,
}

export type GeneratedCodeType =
	| { type: GeneratedCodeBaseType.Value }
	| { type: GeneratedCodeBaseType.Variable }
	| { type: GeneratedCodeBaseType.Statement }
	| { returnType: GeneratedCodeType; type: GeneratedCodeBaseType.Function }
	| { type: GeneratedCodeBaseType.Iterator }
	| { type: GeneratedCodeBaseType.Sequence }
	| { type: GeneratedCodeBaseType.None };

export function getCompiledValueCode(
	identifier: string,
	generatedCodeType: GeneratedCodeType,
	contextItemName?: string
): [string, GeneratedCodeBaseType] {
	switch (generatedCodeType.type) {
		case GeneratedCodeBaseType.Value:
			return [identifier, GeneratedCodeBaseType.Value];
		case GeneratedCodeBaseType.Variable:
			return [identifier, GeneratedCodeBaseType.Variable];
		case GeneratedCodeBaseType.Function: {
			const code = `${
				getCompiledValueCode(
					`${identifier}(${contextItemName ? contextItemName : 'contextItem'})`,
					generatedCodeType.returnType,
					contextItemName
				)[0]
			}`;
			return [code, generatedCodeType.returnType.type];
		}
		case GeneratedCodeBaseType.Iterator: {
			return [identifier, GeneratedCodeBaseType.Iterator];
		}
		case GeneratedCodeBaseType.Sequence:
			return [identifier, GeneratedCodeBaseType.Sequence];
		case GeneratedCodeBaseType.None:
			throw new Error('Trying to get value of generated code with type None');
		default:
			throw new Error(
				'Unreachable! Trying to get compiled value of unsupported GeneratedCodeType.'
			);
	}
}

export function acceptAst(
	code: string,
	generatedCodeType: GeneratedCodeType,
	variables?: string[]
): PartiallyCompiledAstAccepted {
	return {
		code,
		generatedCodeType,
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

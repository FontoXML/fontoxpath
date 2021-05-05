type AstRejection = { isAstAccepted: false; reason: string };

export type CompiledJavaScriptResult = { code: string; isAstAccepted: true } | AstRejection;

export type PartiallyCompiledJavaScriptResult =
	| {
			code: string;
			isAstAccepted: true;
			// Contains variables for the upper scope, if any.
			variables?: string[];
	  }
	| AstRejection;

export function acceptAst(code: string, variables?: string[]): PartiallyCompiledJavaScriptResult {
	return {
		code,
		variables,
		isAstAccepted: true,
	};
}

export function rejectAst(reason: string): AstRejection {
	return { isAstAccepted: false, reason };
}

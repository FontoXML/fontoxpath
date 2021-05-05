type AstRejected = { isAstAccepted: false; reason: string };

export type AstAccepted = {
	code: string;
	isAstAccepted: true;
	// Contains variables for the upper scope, if any.
	variables?: string[];
};

export type PartiallyCompiledJavaScriptResult = AstAccepted | AstRejected;

export type CompiledJavaScriptResult = { code: string; isAstAccepted: true } | AstRejected;

export function acceptAst(code: string, variables?: string[]): AstAccepted {
	return {
		code,
		variables,
		isAstAccepted: true,
	};
}

export function rejectAst(reason: string): AstRejected {
	return { isAstAccepted: false, reason };
}

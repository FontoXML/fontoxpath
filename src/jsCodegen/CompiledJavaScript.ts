type RejectedAst = { isAstAccepted: false; reason: string };

export type AcceptedAst = {
	code: string;
	isAstAccepted: true;
	// Contains variables for the upper scope, if any.
	variables?: string[];
};

export type PartiallyCompiledJavaScriptResult = AcceptedAst | RejectedAst;

export type CompiledJavaScriptResult = { code: string; isAstAccepted: true } | RejectedAst;

export function acceptAst(code: string, variables?: string[]): AcceptedAst {
	return {
		code,
		variables,
		isAstAccepted: true,
	};
}

export function rejectAst(reason: string): RejectedAst {
	return { isAstAccepted: false, reason };
}

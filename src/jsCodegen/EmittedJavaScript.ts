export type EmittedJavaScript =
	| {
			code: string;
			isAstAccepted: true;
			variables?: string[];
	  }
	| { isAstAccepted: false; reason: string };

export function acceptAst(code: string, variables?: string[]): EmittedJavaScript {
	return {
		code,
		variables,
		isAstAccepted: true,
	};
}

export function rejectAst(reason: string): EmittedJavaScript {
	return { isAstAccepted: false, reason };
}

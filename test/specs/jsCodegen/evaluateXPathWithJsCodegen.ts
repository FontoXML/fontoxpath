import {
	compileXPathToJavaScript,
	executeJavaScriptCompiledXPath,
	IDomFacade,
	IReturnTypes,
	ReturnType,
	// Relative import is used so this module can be resolved by backend
	// benchmarks.
} from '../../../src/index';

function generateKey(query: string, returnType: ReturnType) {
	return `${query} ${returnType}`;
}

function normalizeEndOfLines(xpathString: string): string {
	// Replace all character sequences of 0xD followed by 0xA and all 0xD not followed by 0xA with 0xA.
	return xpathString.replace(/(\x0D+\x0A)|(\x0D+(?!\x0A))/g, String.fromCharCode(0xa));
}

const cache = {};

const evaluateXPathWithJsCodegen = <
	TNode extends Node,
	TReturnType extends keyof IReturnTypes<TNode>
>(
	query: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	returnType?: ReturnType
): IReturnTypes<TNode>[TReturnType] => {
	returnType = returnType || (ReturnType.ANY as any);
	query = normalizeEndOfLines(query);

	const cachedQuery = cache[generateKey(query, returnType)];

	if (!cachedQuery) {
		const compiledXPathResult = compileXPathToJavaScript(query, returnType);
		if (compiledXPathResult.isAstAccepted === true) {
			console.log(compiledXPathResult.code);
			// tslint:disable-next-line
			const evalFunction = new Function(compiledXPathResult.code) as any;

			cache[generateKey(query, returnType)] = evalFunction;

			return executeJavaScriptCompiledXPath(evalFunction, contextItem, domFacade);
		} else {
			throw new Error(compiledXPathResult.reason);
		}
	} else {
		return executeJavaScriptCompiledXPath(cachedQuery, contextItem, domFacade);
	}
};

export default evaluateXPathWithJsCodegen;

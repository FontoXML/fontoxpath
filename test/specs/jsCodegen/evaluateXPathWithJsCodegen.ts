import {
	CompiledXPathFunction,
	compileXPathToJavaScript,
	executeJavaScriptCompiledXPath,
	IDomFacade,
	IReturnTypes,
	Options,
	ReturnType,
	// Relative import is used so this module can be resolved by backend
	// benchmarks.
} from '../../../src/index';

function generateKey(query: string, returnType: ReturnType) {
	return `${query} ${returnType}`;
}

const compiledXPathCache = new Map();

const evaluateXPathWithJsCodegen = <
	TNode extends Node,
	TReturnType extends keyof IReturnTypes<TNode>
>(
	query: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	returnType?: ReturnType,
	options?: Options
): IReturnTypes<TNode>[TReturnType] => {
	returnType = returnType || (ReturnType.ANY as any);

	const cacheKey = generateKey(query, returnType);
	const cachedCompiledXPath = compiledXPathCache.get(cacheKey);

	if (!cachedCompiledXPath) {
		const compiledXPathResult = compileXPathToJavaScript(query, returnType, options);
		if (compiledXPathResult.isAstAccepted === true) {
			// tslint:disable-next-line
			const evalFunction = new Function(compiledXPathResult.code) as CompiledXPathFunction;

			compiledXPathCache.set(cacheKey, evalFunction);

			return executeJavaScriptCompiledXPath(evalFunction, contextItem, domFacade);
		} else {
			throw new Error(compiledXPathResult.reason);
		}
	} else {
		return executeJavaScriptCompiledXPath(cachedCompiledXPath, contextItem, domFacade);
	}
};

export default evaluateXPathWithJsCodegen;

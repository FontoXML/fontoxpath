import {
	CompiledXPathFunction,
	compileXPathToJavaScript,
	EvaluableExpression,
	executeJavaScriptCompiledXPath,
	IDomFacade,
	IReturnTypes,
	Options,
	ReturnType,
} from '../../../../src/index';

const compiledXPathCache = new Map<EvaluableExpression, Map<ReturnType, CompiledXPathFunction>>();

function getFromCache(
	query: EvaluableExpression,
	returnType: ReturnType
): CompiledXPathFunction | undefined {
	return compiledXPathCache.get(query)?.get(returnType);
}

function addToCache(
	query: EvaluableExpression,
	returnType: ReturnType,
	fn: CompiledXPathFunction
): void {
	let byReturnType = compiledXPathCache.get(query);
	if (byReturnType === undefined) {
		byReturnType = new Map();
		compiledXPathCache.set(query, byReturnType);
	}
	byReturnType.set(returnType, fn);
}

const evaluateXPathWithJsCodegen = <
	TNode extends Node,
	TReturnType extends keyof IReturnTypes<TNode>
>(
	query: EvaluableExpression,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	returnType?: ReturnType,
	options?: Options
): IReturnTypes<TNode>[TReturnType] => {
	returnType = returnType || (ReturnType.ANY as any);

	const cachedCompiledXPath = getFromCache(query, returnType);
	if (!cachedCompiledXPath) {
		const compiledXPathResult = compileXPathToJavaScript(query, returnType, options);
		if (compiledXPathResult.isAstAccepted === true) {
			// tslint:disable-next-line
			const evalFunction = new Function(compiledXPathResult.code) as CompiledXPathFunction;

			addToCache(query, returnType, evalFunction);

			return executeJavaScriptCompiledXPath(evalFunction, contextItem, domFacade);
		} else {
			throw new Error(compiledXPathResult.reason);
		}
	} else {
		return executeJavaScriptCompiledXPath(cachedCompiledXPath, contextItem, domFacade);
	}
};

export default evaluateXPathWithJsCodegen;

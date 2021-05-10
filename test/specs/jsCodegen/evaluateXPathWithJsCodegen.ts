import { compileXPathToJavaScript, executeCompiledXPath, IDomFacade } from '../../../src/index';
import { ReturnType } from '../../../src/parsing/convertXDMReturnValue';
import { normalizeEndOfLines } from '../../../src/evaluationUtils/buildEvaluationContext';

function generateKey(query: string, returnType: ReturnType) {
	return `${query} ${returnType}`;
}

const cache = {};

function evaluateXPathWithJsCodegen(
	query: string,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	returnType?: ReturnType
): any {
	returnType = returnType || (ReturnType.ANY as any);
	query = normalizeEndOfLines(query);

	const cachedQuery = cache[generateKey(query, returnType)];

	if (!cachedQuery) {
		const compiledXPathResult = compileXPathToJavaScript(query, returnType);
		if (compiledXPathResult.isAstAccepted === true) {
			const evalFunction = new Function(
				'contextItem',
				'domFacade',
				'runtimeLibrary',
				compiledXPathResult.code
			) as () => {};

			cache[generateKey(query, returnType)] = evalFunction;

			return executeCompiledXPath(evalFunction, contextItem, domFacade);
		} else {
			throw new Error(compiledXPathResult.reason);
		}
	} else {
		return executeCompiledXPath(cachedQuery, contextItem, domFacade);
	}
}

export default evaluateXPathWithJsCodegen;

import { ReturnType } from '../parsing/convertXDMReturnValue';
import { CompiledJavaScriptFunction } from './evaluateCompiledJavaScript';

const compiledJavaScriptCache = {};

function generateCacheKey(normalizedQuery: string, returnType: ReturnType) {
	return `${normalizedQuery} ${returnType}`;
}

export function getCompiledJavaScriptFromCache(normalizedQuery: string, returnType: ReturnType) {
	return compiledJavaScriptCache[generateCacheKey(normalizedQuery, returnType)];
}

export function storeCompiledJavaScriptInCache(
	normalizedQuery: string,
	returnType: ReturnType,
	compiledJavaScript: CompiledJavaScriptFunction
) {
	compiledJavaScriptCache[generateCacheKey(normalizedQuery, returnType)] = compiledJavaScript;
}

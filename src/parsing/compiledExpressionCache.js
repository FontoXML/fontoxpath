import Expression from '../expressions/Expression';

/**
 * @dict
 * @type {Object<string, Object<string, Array<CacheEntry>>>}
 */
const compiledExpressionCache = Object.create(null);


/**
 * @dict
 * @type {Object<string, Object<string, Expression>>}
 */
const halfCompiledExpressionCache = Object.create(null);

class CacheEntry {
	constructor (referredNamespaces, referredVariables, compiledExpression, moduleImports) {
		this.referredNamespaces = referredNamespaces;
		this.referredVariables = referredVariables;
		this.compiledExpression = compiledExpression;
		this.moduleImports = moduleImports;
	}
}

export function getAnyStaticCompilationResultFromCache (selectorString, language) {
	const halfCompiledExpressionFromCache = halfCompiledExpressionCache[selectorString];
	if (halfCompiledExpressionFromCache) {
		return halfCompiledExpressionFromCache[language] || null;
	}

	const cachesForExpression = compiledExpressionCache[selectorString];

	if (!cachesForExpression) {
		return null;
	}

	const cachesForLanguage = cachesForExpression[language];
	if (!cachesForLanguage || cachesForLanguage.length === 0) {
		return null;
	}

	return cachesForLanguage[0].compiledExpression;
}

export function storeHalfCompiledCompilationResultInCache (selectorString, language, expressionInstance) {
	if (!halfCompiledExpressionCache[selectorString]) {
		halfCompiledExpressionCache[selectorString] = {
			[language]: expressionInstance
		};
		return;
	}
	halfCompiledExpressionCache[selectorString][language] = expressionInstance;
}

export function getStaticCompilationResultFromCache (selectorString, language, namespaceResolver, variables, moduleImports) {
	const cachesForExpression = compiledExpressionCache[selectorString];

	if (!cachesForExpression) {
		const halfCompiledExpressionFromCache = getAnyStaticCompilationResultFromCache(
			selectorString,
			language);
		if (halfCompiledExpressionFromCache) {
			return {
				requiresStaticCompilation: true,
				expression: halfCompiledExpressionFromCache
			};
		}
		return null;
	}

	const cachesForLanguage = cachesForExpression[language];
	if (!cachesForLanguage) {
		const halfCompiledExpressionFromCache = getAnyStaticCompilationResultFromCache(
			selectorString,
			language);
		if (halfCompiledExpressionFromCache) {
			return {
				requiresStaticCompilation: true,
				expression: halfCompiledExpressionFromCache
			};
		}
		return null;
	}

	const cacheWithCorrectContext = cachesForLanguage.find(
		cache => cache.referredNamespaces
			.every(
				nsRef => namespaceResolver(nsRef.prefix) === nsRef.namespaceURI) &&
			cache.referredVariables.every(
				varRef => variables[varRef.name] !== undefined) &&
			cache.moduleImports.every(
				moduleImport => moduleImports[moduleImport.prefix] === moduleImport.namespaceURI));

	if (!cacheWithCorrectContext) {
		const halfCompiledExpressionFromCache = getAnyStaticCompilationResultFromCache(
			selectorString,
			language);
		if (halfCompiledExpressionFromCache) {
			return {
				requiresStaticCompilation: true,
				expression: halfCompiledExpressionFromCache
			};
		}
		return null;
	}

	return {
		requiresStaticCompilation: false,
		expression: cacheWithCorrectContext.compiledExpression
	};
}

function removeHalfCompiledExpression (selectorString, language, compiledExpression) {
	const halfCompiledExpressionFromCache = halfCompiledExpressionCache[selectorString];
	if (halfCompiledExpressionFromCache) {
		const expression = halfCompiledExpressionFromCache[language];
		if (expression && expression === compiledExpression) {
			delete halfCompiledExpressionFromCache[language];
		}
	}
}

export function storeStaticCompilationResultInCache (selectorString, language, executionStaticContext, moduleImports, compiledExpression) {
	removeHalfCompiledExpression(selectorString, language, compiledExpression);

	let cachesForExpression = compiledExpressionCache[selectorString];
	if (!cachesForExpression) {
		cachesForExpression = compiledExpressionCache[selectorString] = Object.create(null);
	}

	let cachesForLanguage = cachesForExpression[language];
	if (!cachesForLanguage) {
		cachesForLanguage = cachesForExpression[language] = [];
	}

	cachesForLanguage.push(new CacheEntry(
		executionStaticContext.getReferredNamespaces(),
		executionStaticContext.getReferredVariables(),
		compiledExpression,
		Object.keys(moduleImports)
			.map(moduleImportPrefix => ({ prefix: moduleImportPrefix, namespaceURI: moduleImports[moduleImportPrefix] }))
	));
}

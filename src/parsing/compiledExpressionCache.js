/**
 * @dict
* @type {Object<string, Object<string, Array<CacheEntry>>>}
 */
const compiledExpressionCache = Object.create(null);

class CacheEntry {
	constructor (referredNamespaces, referredVariables, compiledExpression, moduleImports) {
		this.referredNamespaces = referredNamespaces;
		this.referredVariables = referredVariables;
		this.compiledExpression = compiledExpression;
		this.moduleImports = moduleImports;
	}
}

export function getStaticCompilationResultFromCache (selectorString, language, namespaceResolver, variables, moduleImports) {
	const cachesForExpression = compiledExpressionCache[selectorString];

	if (!cachesForExpression) {
		return null;
	}

	const cachesForLanguage = cachesForExpression[language];
	if (!cachesForLanguage) {
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
		return null;
	}

	return cacheWithCorrectContext.compiledExpression;
}

export function storeStaticCompilationResultInCache (selectorString, language, executionStaticContext, moduleImports, compiledExpression) {
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

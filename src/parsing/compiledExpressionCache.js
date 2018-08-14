/**
 * @dict
 */
const compiledExpressionCache = Object.create(null);

export function getStaticCompilationResultFromCache (selectorString, language, namespaceResolver, variables) {
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
				varRef => variables[varRef.name] !== undefined));

	if (!cacheWithCorrectContext) {
		return null;
	}

	return cacheWithCorrectContext.compiledExpression;
}

export function storeStaticCompilationResultInCache (selectorString, language, executionStaticContext, compiledExpression) {
	let cachesForExpression = compiledExpressionCache[selectorString];
	if (!cachesForExpression) {
		cachesForExpression = compiledExpressionCache[selectorString] = Object.create(null);
	}

	let cachesForLanguage = cachesForExpression[language];
	if (!cachesForLanguage) {
		cachesForLanguage = cachesForExpression[language] = [];
	}

	cachesForLanguage.push({
		referredNamespaces: executionStaticContext.getReferredNamespaces(),
		referredVariables: executionStaticContext.getReferredVariables(),
		compiledExpression: compiledExpression
	});
}

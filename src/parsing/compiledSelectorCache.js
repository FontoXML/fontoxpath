/**
 * @dict
 */
const compiledSelectorCache = Object.create(null);

export function getStaticCompilationResultFromCache (selectorString, language, namespaceResolver, variables) {
	const cachesForSelector = compiledSelectorCache[selectorString];

	if (!cachesForSelector) {
		return null;
	}

	const cachesForLanguage = cachesForSelector[language];
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

	return cacheWithCorrectContext.compiledSelector;
}

export function storeStaticCompilationResultInCache (selectorString, language, executionStaticContext, compiledSelector) {
	let cachesForSelector = compiledSelectorCache[selectorString];
	if (!cachesForSelector) {
		cachesForSelector = compiledSelectorCache[selectorString] = Object.create(null);
	}

	let cachesForLanguage = cachesForSelector[language];
	if (!cachesForLanguage) {
		cachesForLanguage = cachesForSelector[language] = [];
	}

	cachesForLanguage.push({
		referredNamespaces: executionStaticContext.getReferredNamespaces(),
		referredVariables: executionStaticContext.getReferredVariables(),
		compiledSelector: compiledSelector
	});
}

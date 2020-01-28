import ExecutionSpecificStaticContext from '../expressions/ExecutionSpecificStaticContext';
import Expression from '../expressions/Expression';

const compiledExpressionCache: { [s: string]: { [s: string]: CacheEntry[] } } = Object.create(null);

const halfCompiledExpressionCache: { [s: string]: { [s: string]: Expression } } = Object.create(
	null
);

class CacheEntry {
	public compiledExpression: Expression;
	public moduleImports: { namespaceURI: string; prefix: string }[] | null;
	public referredNamespaces: { namespaceURI: string; prefix: string }[] | null;
	public referredVariables: { name: string }[] | null;
	public usedNamespaceResolver: { [prefix: string]: string } | null;

	constructor(
		referredNamespaces: { namespaceURI: string; prefix: string }[] | null,
		usedNamespaceResolver: { [prefix: string]: string } | null,
		referredVariables: { name: string }[] | null,
		compiledExpression: Expression,
		moduleImports: { namespaceURI: string; prefix: string }[] | null
	) {
		this.compiledExpression = compiledExpression;
		this.moduleImports = moduleImports;
		this.referredNamespaces = referredNamespaces;
		this.referredVariables = referredVariables;
		this.usedNamespaceResolver = usedNamespaceResolver;
	}
}

function generateLanguageKey(language: string, debug: boolean): string {
	return language + (debug ? '_DEBUG' : '');
}

export function getAnyStaticCompilationResultFromCache(
	selectorString: string,
	language: string,
	debug: boolean
) {
	const languageKey = generateLanguageKey(language, debug);
	const halfCompiledExpressionFromCache = halfCompiledExpressionCache[selectorString];
	if (halfCompiledExpressionFromCache) {
		return halfCompiledExpressionFromCache[languageKey] || null;
	}

	const cachesForExpression = compiledExpressionCache[selectorString];

	if (!cachesForExpression) {
		return null;
	}

	const cachesForLanguage = cachesForExpression[languageKey];
	if (!cachesForLanguage || cachesForLanguage.length === 0) {
		return null;
	}

	return cachesForLanguage[0].compiledExpression;
}

export function storeHalfCompiledCompilationResultInCache(
	selectorString: string,
	language: string,
	expressionInstance: Expression,
	debug: boolean
) {
	const languageKey = generateLanguageKey(language, debug);
	if (!halfCompiledExpressionCache[selectorString]) {
		halfCompiledExpressionCache[selectorString] = {
			[languageKey]: expressionInstance
		};
		return;
	}
	halfCompiledExpressionCache[selectorString][languageKey] = expressionInstance;
}

function areNamespaceResolversEqual(
	cache: CacheEntry,
	namespaceResolverB: { [prefix: string]: string } | ((prefix: string) => string)
) {
	const namespaceResolverA = cache.usedNamespaceResolver;
	const isFunctionA = namespaceResolverA === null;
	const isFunctionB = typeof namespaceResolverB === 'function';

	if (isFunctionA !== isFunctionB) {
		return false;
	}

	if (!isFunctionA && !isFunctionA) {
		// We can assume that two equal objects are the 'same' namespace resolver
		return namespaceResolverA === namespaceResolverB;
	}

	// Both functions
	return cache.referredNamespaces.every(
		nsRef =>
			(namespaceResolverB as (prefix: string) => string)(nsRef.prefix) === nsRef.namespaceURI
	);
}

export function getStaticCompilationResultFromCache(
	selectorString: string,
	language: string,
	namespaceResolver: { [prefix: string]: string | null } | ((prefix: string) => string | null),
	variables: object,
	moduleImports: { [x: string]: string },
	debug: boolean
) {
	const cachesForExpression = compiledExpressionCache[selectorString];

	if (!cachesForExpression) {
		const halfCompiledExpressionFromCache = getAnyStaticCompilationResultFromCache(
			selectorString,
			language,
			debug
		);
		if (halfCompiledExpressionFromCache) {
			return {
				expression: halfCompiledExpressionFromCache,
				requiresStaticCompilation: true
			};
		}
		return null;
	}
	const languageKey = generateLanguageKey(language, debug);
	const cachesForLanguage = cachesForExpression[languageKey];
	if (!cachesForLanguage) {
		const halfCompiledExpressionFromCache = getAnyStaticCompilationResultFromCache(
			selectorString,
			language,
			debug
		);
		if (halfCompiledExpressionFromCache) {
			return {
				expression: halfCompiledExpressionFromCache,
				requiresStaticCompilation: true
			};
		}
		return null;
	}

	const cacheWithCorrectContext = cachesForLanguage.find(
		cache =>
			areNamespaceResolversEqual(cache, namespaceResolver) &&
			(cache.referredVariables === null ||
				cache.referredVariables.every(varRef => variables[varRef.name] !== undefined)) &&
			cache.moduleImports.every(
				moduleImport => moduleImports[moduleImport.prefix] === moduleImport.namespaceURI
			)
	);

	if (!cacheWithCorrectContext) {
		const halfCompiledExpressionFromCache = getAnyStaticCompilationResultFromCache(
			selectorString,
			language,
			debug
		);
		if (halfCompiledExpressionFromCache) {
			return {
				expression: halfCompiledExpressionFromCache,
				requiresStaticCompilation: true
			};
		}
		return null;
	}

	return {
		expression: cacheWithCorrectContext.compiledExpression,
		requiresStaticCompilation: false
	};
}

function removeHalfCompiledExpression(
	selectorString: string,
	language: string,
	debug: boolean,
	compiledExpression: Expression
) {
	const languageKey = generateLanguageKey(language, debug);
	const halfCompiledExpressionFromCache = halfCompiledExpressionCache[selectorString];
	if (halfCompiledExpressionFromCache) {
		const expression = halfCompiledExpressionFromCache[languageKey];
		if (expression && expression === compiledExpression) {
			delete halfCompiledExpressionFromCache[languageKey];
		}
	}
}

export function storeStaticCompilationResultInCache(
	selectorString: string,
	namespaceResolver: { [prefix: string]: string } | ((prefix: string) => string),
	language: string,
	executionStaticContext: ExecutionSpecificStaticContext,
	moduleImports: { [x: string]: any },
	compiledExpression: Expression,
	debug: boolean
) {
	removeHalfCompiledExpression(selectorString, language, debug, compiledExpression);

	let cachesForExpression = compiledExpressionCache[selectorString];
	if (!cachesForExpression) {
		cachesForExpression = compiledExpressionCache[selectorString] = Object.create(null);
	}

	const languageKey = generateLanguageKey(language, debug);
	let cachesForLanguage = cachesForExpression[languageKey];
	if (!cachesForLanguage) {
		cachesForLanguage = cachesForExpression[languageKey] = [];
	}

	cachesForLanguage.push(
		new CacheEntry(
			executionStaticContext.getReferredNamespaces(),
			typeof namespaceResolver === 'function'
				? null
				: (namespaceResolver as { [prefix: string]: string }),
			executionStaticContext.getReferredVariables(),
			compiledExpression,
			Object.keys(moduleImports).map(moduleImportPrefix => ({
				namespaceURI: moduleImports[moduleImportPrefix],
				prefix: moduleImportPrefix
			}))
		)
	);
}

import ExecutionSpecificStaticContext from 'src/expressions/ExecutionSpecificStaticContext';
import Expression from '../expressions/Expression';

const compiledExpressionCache: { [s: string]: { [s: string]: CacheEntry[] } } = Object.create(null);

const halfCompiledExpressionCache: { [s: string]: { [s: string]: Expression } } = Object.create(
	null
);

class CacheEntry {
	public compiledExpression: Expression;
	public moduleImports: { namespaceURI: string; prefix: string }[];
	public referredNamespaces: { namespaceURI: string; prefix: string }[];
	public referredVariables: { name: string }[];

	constructor(
		referredNamespaces: { namespaceURI: string; prefix: string }[],
		referredVariables: { name: string }[],
		compiledExpression: Expression,
		moduleImports:
			| { namespaceURI: any; prefix: string }[]
			| { namespaceURI: string; prefix: string }[]
	) {
		this.referredNamespaces = referredNamespaces;
		this.referredVariables = referredVariables;
		this.compiledExpression = compiledExpression;
		this.moduleImports = moduleImports;
	}
}

export function getAnyStaticCompilationResultFromCache(selectorString: string, language: string) {
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

export function storeHalfCompiledCompilationResultInCache(
	selectorString: string,
	language: string,
	expressionInstance: Expression
) {
	if (!halfCompiledExpressionCache[selectorString]) {
		halfCompiledExpressionCache[selectorString] = {
			[language]: expressionInstance
		};
		return;
	}
	halfCompiledExpressionCache[selectorString][language] = expressionInstance;
}

export function getStaticCompilationResultFromCache(
	selectorString: string,
	language: string,
	namespaceResolver: (namespace: string) => string | null,
	variables: object,
	moduleImports: { [x: string]: string }
) {
	const cachesForExpression = compiledExpressionCache[selectorString];

	if (!cachesForExpression) {
		const halfCompiledExpressionFromCache = getAnyStaticCompilationResultFromCache(
			selectorString,
			language
		);
		if (halfCompiledExpressionFromCache) {
			return {
				expression: halfCompiledExpressionFromCache,
				requiresStaticCompilation: true
			};
		}
		return null;
	}

	const cachesForLanguage = cachesForExpression[language];
	if (!cachesForLanguage) {
		const halfCompiledExpressionFromCache = getAnyStaticCompilationResultFromCache(
			selectorString,
			language
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
			cache.referredNamespaces.every(
				nsRef => namespaceResolver(nsRef.prefix) === nsRef.namespaceURI
			) &&
			cache.referredVariables.every(varRef => variables[varRef.name] !== undefined) &&
			cache.moduleImports.every(
				moduleImport => moduleImports[moduleImport.prefix] === moduleImport.namespaceURI
			)
	);

	if (!cacheWithCorrectContext) {
		const halfCompiledExpressionFromCache = getAnyStaticCompilationResultFromCache(
			selectorString,
			language
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
	compiledExpression: Expression
) {
	const halfCompiledExpressionFromCache = halfCompiledExpressionCache[selectorString];
	if (halfCompiledExpressionFromCache) {
		const expression = halfCompiledExpressionFromCache[language];
		if (expression && expression === compiledExpression) {
			delete halfCompiledExpressionFromCache[language];
		}
	}
}

export function storeStaticCompilationResultInCache(
	selectorString: string,
	language: string,
	executionStaticContext: ExecutionSpecificStaticContext,
	moduleImports: { [x: string]: any },
	compiledExpression: Expression
) {
	removeHalfCompiledExpression(selectorString, language, compiledExpression);

	let cachesForExpression = compiledExpressionCache[selectorString];
	if (!cachesForExpression) {
		cachesForExpression = compiledExpressionCache[selectorString] = Object.create(null);
	}

	let cachesForLanguage = cachesForExpression[language];
	if (!cachesForLanguage) {
		cachesForLanguage = cachesForExpression[language] = [];
	}

	cachesForLanguage.push(
		new CacheEntry(
			executionStaticContext.getReferredNamespaces(),
			executionStaticContext.getReferredVariables(),
			compiledExpression,
			Object.keys(moduleImports).map(moduleImportPrefix => ({
				namespaceURI: moduleImports[moduleImportPrefix],
				prefix: moduleImportPrefix
			}))
		)
	);
}

import { EvaluableExpression } from '../evaluateXPath';
import ExecutionSpecificStaticContext, {
	ResolvedFunction,
} from '../expressions/ExecutionSpecificStaticContext';
import Expression from '../expressions/Expression';
import { FunctionNameResolver } from '../types/Options';

const compiledExpressionCache: Map<EvaluableExpression, { [s: string]: CacheEntry[] }> = new Map();

const halfCompiledExpressionCache: Map<EvaluableExpression, { [s: string]: Expression }> =
	new Map();

class CacheEntry {
	constructor(
		public readonly referredNamespaces: { namespaceURI: string; prefix: string }[],
		public readonly referredVariables: { name: string }[],
		public readonly compiledExpression: Expression,
		public readonly moduleImports:
			| { namespaceURI: any; prefix: string }[]
			| { namespaceURI: string; prefix: string }[],
		public readonly defaultFunctionNamespaceURI: string,
		public readonly resolvedFunctions: ResolvedFunction[]
	) {}
}

function generateLanguageKey(language: string, debug: boolean): string {
	return language + (debug ? '_DEBUG' : '');
}

export function getAnyStaticCompilationResultFromCache(
	selectorExpression: EvaluableExpression,
	language: string,
	debug: boolean
) {
	const languageKey = generateLanguageKey(language, debug);
	const halfCompiledExpressionFromCache = halfCompiledExpressionCache.get(selectorExpression);
	if (halfCompiledExpressionFromCache) {
		return halfCompiledExpressionFromCache[languageKey] || null;
	}

	const cachesForExpression = compiledExpressionCache.get(selectorExpression);

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
	selectorExpression: EvaluableExpression,
	language: string,
	expressionInstance: Expression,
	debug: boolean
) {
	const languageKey = generateLanguageKey(language, debug);
	let halfCompiledExpressionFromCache = halfCompiledExpressionCache.get(selectorExpression);
	if (!halfCompiledExpressionFromCache) {
		halfCompiledExpressionFromCache = {};
		halfCompiledExpressionCache.set(selectorExpression, halfCompiledExpressionFromCache);
	}
	halfCompiledExpressionFromCache[languageKey] = expressionInstance;
}

export function getStaticCompilationResultFromCache(
	selectorExpression: EvaluableExpression,
	language: string,
	namespaceResolver: (namespace: string) => string | null,
	variables: { [varName: string]: any },
	moduleImports: { [x: string]: string },
	debug: boolean,
	defaultFunctionNamespaceURI: string,
	functionNameResolver: FunctionNameResolver
) {
	const cachesForExpression = compiledExpressionCache.get(selectorExpression);

	if (!cachesForExpression) {
		const halfCompiledExpressionFromCache = getAnyStaticCompilationResultFromCache(
			selectorExpression,
			language,
			debug
		);
		if (halfCompiledExpressionFromCache) {
			return {
				expression: halfCompiledExpressionFromCache,
				requiresStaticCompilation: true,
			};
		}
		return null;
	}
	const languageKey = generateLanguageKey(language, debug);
	const cachesForLanguage = cachesForExpression[languageKey];
	if (!cachesForLanguage) {
		const halfCompiledExpressionFromCache =
			halfCompiledExpressionCache.has(selectorExpression) &&
			halfCompiledExpressionCache.get(selectorExpression)[languageKey];

		if (halfCompiledExpressionFromCache) {
			return {
				expression: halfCompiledExpressionFromCache,
				requiresStaticCompilation: true,
			};
		}
		return null;
	}

	const cacheWithCorrectContext = cachesForLanguage.find(
		(cache) =>
			cache.defaultFunctionNamespaceURI === defaultFunctionNamespaceURI &&
			cache.referredNamespaces.every(
				(nsRef) => namespaceResolver(nsRef.prefix) === nsRef.namespaceURI
			) &&
			cache.referredVariables.every((varRef) => variables[varRef.name] !== undefined) &&
			cache.moduleImports.every(
				(moduleImport) => moduleImports[moduleImport.prefix] === moduleImport.namespaceURI
			) &&
			cache.resolvedFunctions.every((resolvedFunction) => {
				const newResolvedFunction = functionNameResolver(
					resolvedFunction.lexicalQName,
					resolvedFunction.arity
				);
				return (
					newResolvedFunction &&
					newResolvedFunction.namespaceURI ===
						resolvedFunction.resolvedQName.namespaceURI &&
					newResolvedFunction.localName === resolvedFunction.resolvedQName.localName
				);
			})
	);

	if (!cacheWithCorrectContext) {
		const halfCompiledExpressionFromCache =
			halfCompiledExpressionCache.has(selectorExpression) &&
			halfCompiledExpressionCache.get(selectorExpression)[languageKey];
		if (halfCompiledExpressionFromCache) {
			return {
				expression: halfCompiledExpressionFromCache,
				requiresStaticCompilation: true,
			};
		}
		return null;
	}

	return {
		expression: cacheWithCorrectContext.compiledExpression,
		requiresStaticCompilation: false,
	};
}

function removeHalfCompiledExpression(
	selectorExpression: EvaluableExpression,
	language: string,
	debug: boolean,
	compiledExpression: Expression
) {
	const languageKey = generateLanguageKey(language, debug);
	const halfCompiledExpressionFromCache = halfCompiledExpressionCache.get(selectorExpression);
	if (halfCompiledExpressionFromCache) {
		const expression = halfCompiledExpressionFromCache[languageKey];
		if (expression && expression === compiledExpression) {
			delete halfCompiledExpressionFromCache[languageKey];
		}
	}
}

export function storeStaticCompilationResultInCache(
	selectorExpression: EvaluableExpression,
	language: string,
	executionStaticContext: ExecutionSpecificStaticContext,
	moduleImports: { [x: string]: any },
	compiledExpression: Expression,
	debug: boolean,
	defaultFunctionNamespaceURI: string
) {
	removeHalfCompiledExpression(selectorExpression, language, debug, compiledExpression);

	let cachesForExpression = compiledExpressionCache.get(selectorExpression);
	if (!cachesForExpression) {
		cachesForExpression = Object.create(null);
		compiledExpressionCache.set(selectorExpression, cachesForExpression);
	}

	const languageKey = generateLanguageKey(language, debug);
	let cachesForLanguage = cachesForExpression[languageKey];
	if (!cachesForLanguage) {
		cachesForLanguage = cachesForExpression[languageKey] = [];
	}

	cachesForLanguage.push(
		new CacheEntry(
			executionStaticContext.getReferredNamespaces(),
			executionStaticContext.getReferredVariables(),
			compiledExpression,
			Object.keys(moduleImports).map((moduleImportPrefix) => ({
				namespaceURI: moduleImports[moduleImportPrefix],
				prefix: moduleImportPrefix,
			})),
			defaultFunctionNamespaceURI,
			executionStaticContext.getResolvedFunctions()
		)
	);
}

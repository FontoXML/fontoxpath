import { EvaluableExpression } from '../evaluateXPath';
import ExecutionSpecificStaticContext, {
	ResolvedFunction,
} from '../expressions/ExecutionSpecificStaticContext';
import Expression from '../expressions/Expression';
import { FunctionNameResolver } from '../types/Options';

const compiledExpressionCache: Map<EvaluableExpression, { [s: string]: CacheEntry[] }> = new Map();

class CacheEntry {
	constructor(
		public readonly referredNamespaces: { namespaceURI: string; prefix: string }[],
		public readonly referredVariables: { name: string }[],
		public readonly compiledExpression: Expression,
		public readonly moduleImports:
			| { namespaceURI: any; prefix: string }[]
			| { namespaceURI: string; prefix: string }[],
		public readonly defaultFunctionNamespaceURI: string,
		public readonly resolvedFunctions: ResolvedFunction[],
	) {}
}

function generateLanguageKey(language: string, debug: boolean): string {
	return language + (debug ? '_DEBUG' : '');
}

export function getAnyStaticCompilationResultFromCache(
	selectorExpression: EvaluableExpression,
	language: string | null,
	debug: boolean,
) {
	const cachesForExpression = compiledExpressionCache.get(selectorExpression);

	if (!cachesForExpression) {
		return null;
	}

	if (language === null) {
		// Any language is ok
		for (const lang of Object.keys(cachesForExpression)) {
			if (cachesForExpression[lang] && cachesForExpression[lang].length) {
				return cachesForExpression[lang][0].compiledExpression;
			}
		}
		return null;
	}

	const languageKey = language && generateLanguageKey(language, debug);

	const cachesForLanguage = cachesForExpression[languageKey];
	if (!cachesForLanguage || cachesForLanguage.length === 0) {
		return null;
	}

	return cachesForLanguage[0].compiledExpression;
}

export function getStaticCompilationResultFromCache(
	selectorExpression: EvaluableExpression,
	language: string,
	namespaceResolver: (namespace: string) => string | null,
	variables: { [varName: string]: any },
	moduleImports: { [x: string]: string },
	debug: boolean,
	defaultFunctionNamespaceURI: string,
	functionNameResolver: FunctionNameResolver,
) {
	const cachesForExpression = compiledExpressionCache.get(selectorExpression);

	if (!cachesForExpression) {
		return null;
	}
	const languageKey = generateLanguageKey(language, debug);
	const cachesForLanguage = cachesForExpression[languageKey];
	if (!cachesForLanguage) {
		return null;
	}

	const cacheWithCorrectContext = cachesForLanguage.find(
		(cache) =>
			cache.defaultFunctionNamespaceURI === defaultFunctionNamespaceURI &&
			cache.referredNamespaces.every(
				(nsRef) => namespaceResolver(nsRef.prefix) === nsRef.namespaceURI,
			) &&
			cache.referredVariables.every((varRef) => variables[varRef.name] !== undefined) &&
			cache.moduleImports.every(
				(moduleImport) => moduleImports[moduleImport.prefix] === moduleImport.namespaceURI,
			) &&
			cache.resolvedFunctions.every((resolvedFunction) => {
				const newResolvedFunction = functionNameResolver(
					resolvedFunction.lexicalQName,
					resolvedFunction.arity,
				);
				return (
					newResolvedFunction &&
					newResolvedFunction.namespaceURI ===
						resolvedFunction.resolvedQName.namespaceURI &&
					newResolvedFunction.localName === resolvedFunction.resolvedQName.localName
				);
			}),
	);

	if (!cacheWithCorrectContext) {
		return null;
	}

	return {
		expression: cacheWithCorrectContext.compiledExpression,
		requiresStaticCompilation: false,
	};
}

export function storeStaticCompilationResultInCache(
	selectorExpression: EvaluableExpression,
	language: string,
	executionStaticContext: ExecutionSpecificStaticContext,
	moduleImports: { [x: string]: any },
	compiledExpression: Expression,
	debug: boolean,
	defaultFunctionNamespaceURI: string,
) {
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
			executionStaticContext.getResolvedFunctions(),
		),
	);
}

import ExecutionSpecificStaticContext, {
	ResolvedFunction,
} from '../expressions/ExecutionSpecificStaticContext';
import Expression from '../expressions/Expression';
import { FunctionNameResolver } from '../types/Options';

const compiledExpressionCache: { [s: string]: { [s: string]: CacheEntry[] } } = Object.create(null);

const halfCompiledExpressionCache: { [s: string]: { [s: string]: Expression } } =
	Object.create(null);

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
			[languageKey]: expressionInstance,
		};
		return;
	}
	halfCompiledExpressionCache[selectorString][languageKey] = expressionInstance;
}

export function getStaticCompilationResultFromCache(
	selectorString: string,
	language: string,
	namespaceResolver: (namespace: string) => string | null,
	variables: { [varName: string]: any },
	moduleImports: { [x: string]: string },
	debug: boolean,
	defaultFunctionNamespaceURI: string,
	functionNameResolver: FunctionNameResolver
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
				requiresStaticCompilation: true,
			};
		}
		return null;
	}
	const languageKey = generateLanguageKey(language, debug);
	const cachesForLanguage = cachesForExpression[languageKey];
	if (!cachesForLanguage) {
		const halfCompiledExpressionFromCache =
			halfCompiledExpressionCache[selectorString] &&
			halfCompiledExpressionCache[selectorString][languageKey];
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
			halfCompiledExpressionCache[selectorString] &&
			halfCompiledExpressionCache[selectorString][languageKey];
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
	language: string,
	executionStaticContext: ExecutionSpecificStaticContext,
	moduleImports: { [x: string]: any },
	compiledExpression: Expression,
	debug: boolean,
	defaultFunctionNamespaceURI: string
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

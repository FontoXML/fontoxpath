import { EvaluableExpression } from '../evaluateXPath';
import ExecutionSpecificStaticContext from '../expressions/ExecutionSpecificStaticContext';
import Expression from '../expressions/Expression';
import StaticContext from '../expressions/StaticContext';
import annotateAst from '../typeInference/annotateAST';
import { AnnotationContext } from '../typeInference/AnnotationContext';
import { FunctionNameResolver } from '../types/Options';
import astHelper, { IAST } from './astHelper';
import compileAstToExpression from './compileAstToExpression';
import {
	getStaticCompilationResultFromCache,
	storeStaticCompilationResultInCache,
} from './compiledExpressionCache';
import convertXmlToAst from './convertXmlToAst';
import { enhanceStaticContextWithModule, performStaticCompilationOnModules } from './globalModuleCache';
import normalizeEndOfLines from './normalizeEndOfLines';
import parseExpression from './parseExpression';
import processProlog from './processProlog';

enum CACHE_STATE {
	PARSED,
	COMPILED,
	STATIC_ANALYZED,
}

function createExpressionFromSource(
	xpathSource: EvaluableExpression,
	compilationOptions: {
		allowUpdating: boolean | undefined;
		allowXQuery: boolean | undefined;
		debug: boolean | undefined;
		disableCache: boolean | undefined;
	},
	namespaceResolver: (namespace: string) => string | null,
	variables: { [varName: string]: any },
	moduleImports: { [namespaceURI: string]: string },
	defaultFunctionNamespaceURI: string,
	functionNameResolver: FunctionNameResolver
):
	| { ast: IAST; state: CACHE_STATE.PARSED }
	| { expression: Expression; state: CACHE_STATE.COMPILED | CACHE_STATE.STATIC_ANALYZED } {
	const language = compilationOptions.allowXQuery ? 'XQuery' : 'XPath';

	const fromCache = compilationOptions.disableCache
		? null
		: getStaticCompilationResultFromCache(
				xpathSource,
				language,
				namespaceResolver,
				variables,
				moduleImports,
				compilationOptions.debug,
				defaultFunctionNamespaceURI,
				functionNameResolver
		  );

	if (fromCache !== null) {
		return {
			state: fromCache.requiresStaticCompilation
				? CACHE_STATE.COMPILED
				: CACHE_STATE.STATIC_ANALYZED,
			expression: fromCache.expression,
		};
	} else {
		// We can not use anything from the cache, parse + compile
		const ast =
			typeof xpathSource === 'string'
				? parseExpression(xpathSource, compilationOptions)
				: convertXmlToAst(xpathSource);

		return {
			state: CACHE_STATE.PARSED,
			ast,
		};
	}
}

function buildExpressionFromAst(
	ast: IAST,
	compilationOptions: {
		allowUpdating: boolean | undefined;
		allowXQuery: boolean | undefined;
		debug: boolean | undefined;
		disableCache: boolean | undefined;
	},
	rootStaticContext: StaticContext,
	source: EvaluableExpression
) {
	const mainModule = astHelper.getFirstChild(ast, 'mainModule');
	if (!mainModule) {
		// This must be a library module
		throw new Error('Can not execute a library module.');
	}

	const prolog = astHelper.getFirstChild(mainModule, 'prolog');

	if (prolog) {
		if (!compilationOptions.allowXQuery) {
			throw new Error(
				'XPST0003: Use of XQuery functionality is not allowed in XPath context'
			);
		}

		// XPath with a prolog: we're going to need to statically analyze modules if that didn't
		// happen yet:
		performStaticCompilationOnModules();

		const moduleDeclaration = processProlog(prolog, rootStaticContext, true, source);
		// Immediately perform static compilation as well
		moduleDeclaration.performStaticAnalysis(moduleDeclaration);
	}

	const context = new AnnotationContext(rootStaticContext);
	annotateAst(ast, context);

	const queryBodyContents = astHelper.followPath(mainModule, ['queryBody', '*']);

	return compileAstToExpression(queryBodyContents, compilationOptions);
}

export default function staticallyCompileXPath(
	selector: EvaluableExpression,
	compilationOptions: {
		allowUpdating: boolean | undefined;
		allowXQuery: boolean | undefined;
		debug: boolean | undefined;
		disableCache: boolean | undefined;
	},
	namespaceResolver: (namespace: string) => string | null,
	variables: { [varName: string]: any },
	moduleImports: { [namespaceURI: string]: string },
	defaultFunctionNamespaceURI: string,
	functionNameResolver: FunctionNameResolver
): { expression: Expression; staticContext: StaticContext } {
	const executionSpecificStaticContext = new ExecutionSpecificStaticContext(
		namespaceResolver,
		variables,
		defaultFunctionNamespaceURI,
		functionNameResolver
	);
	const rootStaticContext = new StaticContext(executionSpecificStaticContext);

	if (Object.keys(moduleImports).length > 0) {
		// XPath with imports: we're going to need to statically analyze modules if that didn't
		// happen yet:
		performStaticCompilationOnModules();
	}

	Object.keys(moduleImports).forEach((modulePrefix) => {
		const moduleURI = moduleImports[modulePrefix];
		enhanceStaticContextWithModule(rootStaticContext, moduleURI);

		rootStaticContext.registerNamespace(modulePrefix, moduleURI);
	});

	if (typeof selector === 'string') {
		selector = normalizeEndOfLines(selector);
	}
	const result = createExpressionFromSource(
		selector,
		compilationOptions,
		namespaceResolver,
		variables,
		moduleImports,
		defaultFunctionNamespaceURI,
		functionNameResolver
	);
	switch (result.state) {
		case CACHE_STATE.STATIC_ANALYZED:
			return {
				staticContext: rootStaticContext,
				expression: result.expression,
			};

		case CACHE_STATE.COMPILED: {
			result.expression.performStaticEvaluation(rootStaticContext);

			const language = compilationOptions.allowXQuery ? 'XQuery' : 'XPath';
			storeStaticCompilationResultInCache(
				selector,
				language,
				executionSpecificStaticContext,
				moduleImports,
				result.expression,
				compilationOptions.debug,
				defaultFunctionNamespaceURI
			);

			return {
				staticContext: rootStaticContext,
				expression: result.expression,
			};
		}
		case CACHE_STATE.PARSED: {
			const expressionFromAst = buildExpressionFromAst(
				result.ast,
				compilationOptions,
				rootStaticContext,
				selector
			);
			expressionFromAst.performStaticEvaluation(rootStaticContext);

			if (!compilationOptions.disableCache) {
				const language = compilationOptions.allowXQuery ? 'XQuery' : 'XPath';
				storeStaticCompilationResultInCache(
					selector,
					language,
					executionSpecificStaticContext,
					moduleImports,
					expressionFromAst,
					compilationOptions.debug,
					defaultFunctionNamespaceURI
				);
			}

			return {
				staticContext: rootStaticContext,
				expression: expressionFromAst,
			};
		}
	}
}

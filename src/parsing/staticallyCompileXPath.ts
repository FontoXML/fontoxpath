import ExecutionSpecificStaticContext from '../expressions/ExecutionSpecificStaticContext';
import StaticContext from '../expressions/StaticContext';
import { FunctionNameResolver } from '../types/Options';
import astHelper from './astHelper';
import compileAstToExpression from './compileAstToExpression';
import compileAstToJavaScript from './compileAstToJavaScript';
import { TargetKinds, CompiledXPath } from './compiledXPath';
import {
	getStaticCompilationResultFromCache,
	storeStaticCompilationResultInCache,
} from './compiledExpressionCache';
import { enhanceStaticContextWithModule } from './globalModuleCache';
import parseExpression from './parseExpression';
import processProlog from './processProlog';

export default function staticallyCompileXPath(
	xpathString: string,
	compilationOptions: {
		allowUpdating: boolean | undefined;
		allowXQuery: boolean | undefined;
		debug: boolean | undefined;
		disableCache: boolean | undefined;
	},
	namespaceResolver: (namespace: string) => string | null,
	variables: object,
	moduleImports: { [namespaceURI: string]: string },
	defaultFunctionNamespaceURI: string,
	functionNameResolver: FunctionNameResolver
): { expression: CompiledXPath; staticContext: StaticContext } {
	const language = compilationOptions.allowXQuery ? 'XQuery' : 'XPath';

	const fromCache = compilationOptions.disableCache
		? null
		: getStaticCompilationResultFromCache(
			xpathString,
			language,
			namespaceResolver,
			variables,
			moduleImports,
			compilationOptions.debug,
			defaultFunctionNamespaceURI,
			functionNameResolver
		);

	const executionSpecificStaticContext = new ExecutionSpecificStaticContext(
		namespaceResolver,
		variables,
		defaultFunctionNamespaceURI,
		functionNameResolver
	);
	const rootStaticContext = new StaticContext(executionSpecificStaticContext);

	let expression: CompiledXPath;

	if (fromCache !== null) {
		expression = { kind: TargetKinds.EXPRESSION, value: fromCache.expression };
	} else {
		// We can not use anything from the cache, parse + compile
		const ast = parseExpression(xpathString, compilationOptions);

		const mainModule = astHelper.getFirstChild(ast, 'mainModule');
		if (!mainModule) {
			// This must be a library module
			throw new Error('Can not execute a library module.');
		}

		const prolog = astHelper.getFirstChild(mainModule, 'prolog');
		const queryBodyContents = astHelper.followPath(mainModule, ['queryBody', '*']);

		if (prolog) {
			if (!compilationOptions.allowXQuery) {
				throw new Error(
					'XPST0003: Use of XQuery functionality is not allowed in XPath context'
				);
			}
			processProlog(prolog, rootStaticContext);
		}

		// expression = compileAstToJavaScript(queryBodyContents);
		expression = { kind: TargetKinds.EXPRESSION, value: compileAstToExpression(queryBodyContents, compilationOptions) };
	}

	if (expression.kind === TargetKinds.EXPRESSION && (fromCache === null || fromCache.requiresStaticCompilation)) {
		Object.keys(moduleImports).forEach((modulePrefix) => {
			const moduleURI = moduleImports[modulePrefix];
			enhanceStaticContextWithModule(rootStaticContext, moduleURI);

			rootStaticContext.registerNamespace(modulePrefix, moduleURI);
		});

		expression.value.performStaticEvaluation(rootStaticContext);

		if (!compilationOptions.disableCache) {
			storeStaticCompilationResultInCache(
				xpathString,
				language,
				executionSpecificStaticContext,
				moduleImports,
				expression.value,
				compilationOptions.debug,
				defaultFunctionNamespaceURI
			);
		}
	}

	return { expression, staticContext: rootStaticContext };
}

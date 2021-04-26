import ExecutionSpecificStaticContext from '../expressions/ExecutionSpecificStaticContext';
import Expression from '../expressions/Expression';
import StaticContext from '../expressions/StaticContext';
import { FunctionNameResolver } from '../types/Options';
import astHelper, { IAST } from './astHelper';
import compileAstToExpression from './compileAstToExpression';
import {
	getStaticCompilationResultFromCache,
	storeStaticCompilationResultInCache,
} from './compiledExpressionCache';
import { enhanceStaticContextWithModule } from './globalModuleCache';
import parseExpression from './parseExpression';
import processProlog from './processProlog';
import { NODE_TYPES } from '../domFacade/ConcreteNode';

function serializeToJsonMl(ast: Element): IAST;
function serializeToJsonMl(ast: Node): IAST | string {
	switch (ast.nodeType) {
		case NODE_TYPES.ELEMENT_NODE:
			const astElement = ast as Element;
			return [
				astElement.localName,

				Array.from(astElement.attributes).reduce(
					(allAttributes, attribute) =>
						(allAttributes[attribute.localName] = attribute.value),
					{}
				),
			].concat(Array.from(astElement.childNodes).map(serializeToJsonMl));
		case NODE_TYPES.TEXT_NODE:
			return (ast as Text).data;

		default:
			throw new Error(
				`Unsupported node type ${ast.nodeType}. Only pass elements containig elements and text nodes.`
			);
	}
}

export default function staticallyCompileXPath(
	scriptStringOrAst: string | Element,
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
): { expression: Expression; staticContext: StaticContext } {
	const language = compilationOptions.allowXQuery ? 'XQuery' : 'XPath';

	const fromCache =
		typeof scriptStringOrAst !== 'string' || compilationOptions.disableCache
			? null
			: getStaticCompilationResultFromCache(
					scriptStringOrAst,
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

	let expression: Expression;

	if (fromCache !== null) {
		expression = fromCache.expression;
	} else {
		// We can not use anything from the cache, parse + compile
		const ast =
			typeof scriptStringOrAst === 'string'
				? parseExpression(scriptStringOrAst, compilationOptions)
				: serializeToJsonMl(scriptStringOrAst);

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

		expression = compileAstToExpression(queryBodyContents, compilationOptions);
	}

	if (fromCache === null || fromCache.requiresStaticCompilation) {
		Object.keys(moduleImports).forEach((modulePrefix) => {
			const moduleURI = moduleImports[modulePrefix];
			enhanceStaticContextWithModule(rootStaticContext, moduleURI);

			rootStaticContext.registerNamespace(modulePrefix, moduleURI);
		});

		expression.performStaticEvaluation(rootStaticContext);

		if (!compilationOptions.disableCache && typeof scriptStringOrAst === 'string') {
			storeStaticCompilationResultInCache(
				scriptStringOrAst,
				language,
				executionSpecificStaticContext,
				moduleImports,
				expression,
				compilationOptions.debug,
				defaultFunctionNamespaceURI
			);
		}
	}

	return { expression, staticContext: rootStaticContext };
}

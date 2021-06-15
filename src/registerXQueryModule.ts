import { createDefaultFunctionNameResolver } from './evaluationUtils/buildEvaluationContext';
import { printAndRethrowError } from './evaluationUtils/printAndRethrowError';
import ExecutionSpecificStaticContext from './expressions/ExecutionSpecificStaticContext';
import { BUILT_IN_NAMESPACE_URIS } from './expressions/staticallyKnownNamespaces';
import StaticContext from './expressions/StaticContext';
import astHelper from './parsing/astHelper';
import { loadModuleFile } from './parsing/globalModuleCache';
import parseExpression from './parsing/parseExpression';
import processProlog, { FunctionDeclaration } from './parsing/processProlog';
import annotateAst from './typeInference/annotateAST';
import { AnnotationContext } from './typeInference/AnnotationContext';
import { NamespaceResolver } from './types/Options';

/**
 * Register an XQuery module
 * @public
 * @param   moduleString - The string contents of the module
 * @param   options - Additional compilation options
 * @returns  The namespace uri of the new module
 */
export default function registerXQueryModule(
	moduleString: string,
	options: { debug: boolean } = { debug: false }
): string {
	const parsedModule = parseExpression(moduleString, {
		allowXQuery: true,
		debug: options['debug'],
	});

	annotateAst(parsedModule, new AnnotationContext(undefined));

	const libraryModule = astHelper.getFirstChild(parsedModule, 'libraryModule');
	if (!libraryModule) {
		throw new Error('XQuery module must be declared in a library module.');
	}
	const moduleDecl = astHelper.getFirstChild(libraryModule, 'moduleDecl')!;
	const uriNode = astHelper.getFirstChild(moduleDecl, 'uri')!;
	const moduleTargetNamespaceURI = astHelper.getTextContent(uriNode);
	const prefixNode = astHelper.getFirstChild(moduleDecl, 'prefix')!;
	const moduleTargetPrefix = astHelper.getTextContent(prefixNode);

	const namespaceResolver: NamespaceResolver = () => null;
	const staticContext = new StaticContext(
		new ExecutionSpecificStaticContext(
			namespaceResolver,
			Object.create(null),
			BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
			createDefaultFunctionNameResolver(BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI)
		)
	);

	staticContext.registerNamespace(moduleTargetPrefix, moduleTargetNamespaceURI);

	const prolog = astHelper.getFirstChild(libraryModule, 'prolog');
	if (prolog !== null) {
		let moduleDeclaration: {
			functionDeclarations: FunctionDeclaration[];
		};
		try {
			moduleDeclaration = processProlog(prolog, staticContext);
		} catch (error) {
			printAndRethrowError(moduleString, error);
		}
		moduleDeclaration.functionDeclarations.forEach(({ namespaceURI }) => {
			if (moduleTargetNamespaceURI !== namespaceURI) {
				throw new Error(
					'XQST0048: Functions and variables declared in a module must reside in the module target namespace.'
				);
			}
		});

		loadModuleFile(moduleTargetNamespaceURI, moduleDeclaration);
	} else {
		loadModuleFile(moduleTargetNamespaceURI, { functionDeclarations: [] });
	}

	return moduleTargetNamespaceURI;
}

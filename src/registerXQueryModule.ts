import { createDefaultFunctionNameResolver } from './evaluationUtils/buildEvaluationContext';
import { printAndRethrowError } from './evaluationUtils/printAndRethrowError';
import ExecutionSpecificStaticContext from './expressions/ExecutionSpecificStaticContext';
import { BUILT_IN_NAMESPACE_URIS } from './expressions/staticallyKnownNamespaces';
import StaticContext from './expressions/StaticContext';
import astHelper from './parsing/astHelper';
import { loadModuleFile } from './parsing/globalModuleCache';
import parseExpression from './parsing/parseExpression';
import processProlog, { ModuleDeclaration } from './parsing/processProlog';
import annotateAst from './typeInference/annotateAST';
import { AnnotationContext } from './typeInference/AnnotationContext';
import { NamespaceResolver } from './types/Options';

/**
 * Register an XQuery module
 *
 * Static analysis of this module will only happen during the first time an XPath is executed, or
 * when {@link finalizeModuleRegistration} is called.
 *
 * XQuery modules can depend on other XQuery modules. All public functions and variables declared in
 * a dependency module are available in a registered module. All public functions and variables
 * declared in the same namespace as a registered module, but registered in a different
 * `registerXQueryModule` call are also available.
 *
 * @example
 *
 * ```
 *
 * registerXQueryModule(`module namespace example = "http://www.example.com";
 * declare %public function example:hello () as xs:string { "hello world" \};
 * `);
 *
 * // Optionally invoke static analysis manually before executing,
 * // otherwise this is called automatically when the first expression is evaluated,
 * // possibly causing a confusing error callstack
 * finalizeModuleRegistration();
 *
 * evaluateXPathToString(`import module namespace example = "http://www.example.com";
 *  example:hello()
 * `); // outputs "hello world"
 * ```
 *
 * @public
 * @param   moduleString - The string contents of the module
 * @param   options - Additional compilation options
 * @returns  The namespace uri of the new module
 */
export default function registerXQueryModule(
	moduleString: string,
	options: { debug: boolean } = { debug: false }
): string {
	let parsedModule;
	try {
		parsedModule = parseExpression(moduleString, {
			allowXQuery: true,
			debug: options['debug'],
		});
	} catch (error) {
		printAndRethrowError(moduleString, error);
	}

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
		let moduleDeclaration: ModuleDeclaration;
		try {
			moduleDeclaration = processProlog(prolog, staticContext, true, moduleString);
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
		loadModuleFile(moduleTargetNamespaceURI, {
			functionDeclarations: [],
			variableDeclarations: [],
			// No static analysis needed: there is no prolog
			performStaticAnalysis: null,
			source: moduleString,
		});
	}

	return moduleTargetNamespaceURI;
}
